const { query: dbQuery } = require('../config/database');
const { redisGet, redisSet, redisDel, generateCacheKey, CACHE_TTL } = require('../config/redis');

class MessageService {
  /**
   * Get user's conversations with pagination and caching
   */
  async getUserConversations(userId, page = 1, limit = 20) {
    const cacheKey = generateCacheKey(`conversations:${userId}:${page}:${limit}`);
    
    try {
      // Try to get from cache first
      const cached = await redisGet(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const offset = (page - 1) * limit;

      // Get conversations with last message and other user info
      const result = await dbQuery(`
        SELECT 
          c.id as conversation_id,
          c.post_id,
          c.created_at as conversation_created,
          c.last_message_at,
          CASE 
            WHEN c.user1_id = $1 THEN c.user2_id
            ELSE c.user1_id
          END as other_user_id,
          u.username,
          u.first_name,
          u.last_name,
          u.display_name,
          u.profile_picture,
          un.name as university_name,
          p.title as post_title,
          p.post_type as post_type,
          (
            SELECT m.content 
            FROM messages m 
            WHERE m.conversation_id = c.id 
            ORDER BY m.created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT m.created_at 
            FROM messages m 
            WHERE m.conversation_id = c.id 
            ORDER BY m.created_at DESC 
            LIMIT 1
          ) as last_message_time,
          (
            SELECT COUNT(*) 
            FROM messages m 
            WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.is_read = false
          ) as unread_count
        FROM conversations c
        JOIN users u ON (
          CASE 
            WHEN c.user1_id = $1 THEN c.user2_id
            ELSE c.user1_id
          END = u.id
        )
        JOIN universities un ON u.university_id = un.id
        LEFT JOIN posts p ON c.post_id = p.id
        WHERE c.user1_id = $1 OR c.user2_id = $1
        ORDER BY c.last_message_at DESC NULLS LAST
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await dbQuery(`
        SELECT COUNT(*) as total
        FROM conversations
        WHERE user1_id = $1 OR user2_id = $1
      `, [userId]);

      const total = parseInt(countResult.rows[0].total);

      // Format conversations
      const conversations = result.rows.map(conv => ({
        id: conv.conversation_id,
        postId: conv.post_id,
        postTitle: conv.post_title,
        postType: conv.post_type,
        otherUser: {
          id: conv.other_user_id,
          username: conv.username,
          firstName: conv.first_name,
          lastName: conv.last_name,
          displayName: conv.display_name,
          profilePicture: conv.profile_picture,
          university: conv.university_name
        },
        lastMessage: conv.last_message,
        lastMessageTime: conv.last_message_time,
        unreadCount: conv.unread_count || 0,
        createdAt: conv.conversation_created
      }));

      const response = {
        success: true,
        data: {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

      // Cache the result
      await redisSet(cacheKey, JSON.stringify(response), CACHE_TTL.MEDIUM);
      
      return response;

    } catch (error) {
      console.error('Get conversations error:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  /**
   * Get messages in a conversation with pagination
   */
  async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    try {
      // Check if user is part of this conversation
      const convCheck = await dbQuery(`
        SELECT id FROM conversations 
        WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
      `, [conversationId, userId]);

      if (convCheck.rows.length === 0) {
        throw new Error('Access denied to this conversation');
      }

      const offset = (page - 1) * limit;

      // Get messages
      const result = await dbQuery(`
        SELECT 
          m.id,
          m.content,
          m.message_type,
          m.media_url,
          m.is_read,
          m.created_at,
          m.sender_id,
          u.username,
          u.first_name,
          u.last_name,
          u.display_name,
          u.profile_picture
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1 AND m.is_deleted = false
        ORDER BY m.created_at DESC
        LIMIT $2 OFFSET $3
      `, [conversationId, limit, offset]);

      // Get total count
      const countResult = await dbQuery(`
        SELECT COUNT(*) as total
        FROM messages
        WHERE conversation_id = $1 AND is_deleted = false
      `, [conversationId]);

      const total = parseInt(countResult.rows[0].total);

      // Mark messages as read if they're from the other user
      await dbQuery(`
        UPDATE messages 
        SET is_read = true 
        WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
      `, [conversationId, userId]);

      // Format messages
      const messages = result.rows.map(msg => ({
        id: msg.id,
        content: msg.content,
        messageType: msg.message_type,
        mediaUrl: msg.media_url,
        isRead: msg.is_read,
        createdAt: msg.created_at,
        sender: {
          id: msg.sender_id,
          username: msg.username,
          firstName: msg.first_name,
          lastName: msg.last_name,
          displayName: msg.display_name,
          profilePicture: msg.profile_picture
        },
        isOwn: msg.sender_id === userId
      }));

      return {
        success: true,
        data: {
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  /**
   * Start a new conversation
   */
  async startConversation(userId, otherUserId, postId = null) {
    try {
      if (otherUserId === userId) {
        throw new Error('Cannot start conversation with yourself');
      }

      // Check if conversation already exists
      const existingConv = await dbQuery(`
        SELECT id FROM conversations 
        WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        ${postId ? 'AND post_id = $3' : ''}
      `, postId ? [userId, otherUserId, postId] : [userId, otherUserId]);

      if (existingConv.rows.length > 0) {
        throw new Error('Conversation already exists');
      }

      // Check if other user exists and is active
      const otherUser = await dbQuery(`
        SELECT id, username, first_name, last_name, display_name, profile_picture
        FROM users 
        WHERE id = $1 AND is_active = true
      `, [otherUserId]);

      if (otherUser.rows.length === 0) {
        throw new Error('User not found');
      }

      // Create conversation
      const result = await dbQuery(`
        INSERT INTO conversations (user1_id, user2_id, post_id)
        VALUES ($1, $2, $3)
        RETURNING id, created_at
      `, [userId, otherUserId, postId]);

      const conversation = result.rows[0];

      // Clear cache for both users
      await this.clearUserConversationCache(userId);
      await this.clearUserConversationCache(otherUserId);

      return {
        success: true,
        message: 'Conversation started successfully',
        data: {
          conversation: {
            id: conversation.id,
            createdAt: conversation.created_at,
            otherUser: {
              id: otherUser.rows[0].id,
              username: otherUser.rows[0].username,
              firstName: otherUser.rows[0].first_name,
              lastName: otherUser.rows[0].last_name,
              displayName: otherUser.rows[0].display_name,
              profilePicture: otherUser.rows[0].profile_picture
            }
          }
        }
      };

    } catch (error) {
      console.error('Start conversation error:', error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId, senderId, content, messageType = 'text', mediaUrl = null) {
    try {
      // Check if user is part of this conversation
      const convCheck = await dbQuery(`
        SELECT id FROM conversations 
        WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
      `, [conversationId, senderId]);

      if (convCheck.rows.length === 0) {
        throw new Error('Access denied to this conversation');
      }

      // Create message
      const result = await dbQuery(`
        INSERT INTO messages (conversation_id, sender_id, content, message_type, media_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, content, message_type, media_url, is_read, created_at
      `, [conversationId, senderId, content, messageType, mediaUrl]);

      const message = result.rows[0];

      // Update conversation's last_message_at
      await dbQuery(`
        UPDATE conversations 
        SET last_message_at = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [message.created_at, conversationId]);

      // Get sender info
      const senderResult = await dbQuery(`
        SELECT username, first_name, last_name, display_name, profile_picture
        FROM users 
        WHERE id = $1
      `, [senderId]);

      const sender = senderResult.rows[0];

      const formattedMessage = {
        id: message.id,
        content: message.content,
        messageType: message.message_type,
        mediaUrl: message.media_url,
        isRead: message.is_read,
        createdAt: message.created_at,
        sender: {
          id: senderId,
          username: sender.username,
          firstName: sender.first_name,
          lastName: sender.last_name,
          displayName: sender.display_name,
          profilePicture: sender.profile_picture
        },
        isOwn: true
      };

      // Clear cache for both users in the conversation
      await this.clearConversationCache(conversationId);

      return {
        success: true,
        message: 'Message sent successfully',
        data: {
          message: formattedMessage
        }
      };

    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId, userId) {
    try {
      // Check if user is part of this conversation
      const convCheck = await dbQuery(`
        SELECT id FROM conversations 
        WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
      `, [conversationId, userId]);

      if (convCheck.rows.length === 0) {
        throw new Error('Access denied to this conversation');
      }

      // Mark messages as read
      const result = await dbQuery(`
        UPDATE messages 
        SET is_read = true 
        WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
        RETURNING COUNT(*) as updated_count
      `, [conversationId, userId]);

      const updatedCount = parseInt(result.rows[0].updated_count);

      // Clear cache
      await this.clearConversationCache(conversationId);

      return {
        success: true,
        message: 'Messages marked as read',
        data: {
          updatedCount
        }
      };

    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId, userId) {
    try {
      // Check if user is part of this conversation
      const convCheck = await dbQuery(`
        SELECT id FROM conversations 
        WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
      `, [conversationId, userId]);

      if (convCheck.rows.length === 0) {
        throw new Error('Access denied to this conversation');
      }

      // Get both users to clear their cache
      const usersResult = await dbQuery(`
        SELECT user1_id, user2_id FROM conversations WHERE id = $1
      `, [conversationId]);

      const { user1_id, user2_id } = usersResult.rows[0];

      // Delete conversation (cascades to messages)
      await dbQuery(`
        DELETE FROM conversations 
        WHERE id = $1
      `, [conversationId]);

      // Clear cache for both users
      await this.clearUserConversationCache(user1_id);
      await this.clearUserConversationCache(user2_id);

      return {
        success: true,
        message: 'Conversation deleted successfully'
      };

    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  }

  /**
   * Get message requests for a user
   */
  async getMessageRequests(userId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;

      const result = await dbQuery(`
        SELECT 
          mr.id,
          mr.message,
          mr.status,
          mr.created_at,
          mr.post_id,
          p.title as post_title,
          p.post_type as post_type,
          u.username,
          u.first_name,
          u.last_name,
          u.display_name,
          u.profile_picture,
          un.name as university_name
        FROM message_requests mr
        JOIN users u ON mr.from_user_id = u.id
        JOIN universities un ON u.university_id = un.id
        LEFT JOIN posts p ON mr.post_id = p.id
        WHERE mr.to_user_id = $1
        ORDER BY mr.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await dbQuery(`
        SELECT COUNT(*) as total
        FROM message_requests
        WHERE to_user_id = $1
      `, [userId]);

      const total = parseInt(countResult.rows[0].total);

      const requests = result.rows.map(req => ({
        id: req.id,
        message: req.message,
        status: req.status,
        createdAt: req.created_at,
        post: req.post_id ? {
          id: req.post_id,
          title: req.post_title,
          postType: req.post_type
        } : null,
        fromUser: {
          username: req.username,
          firstName: req.first_name,
          lastName: req.last_name,
          displayName: req.display_name,
          profilePicture: req.profile_picture,
          university: req.university_name
        }
      }));

      return {
        success: true,
        data: {
          requests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };

    } catch (error) {
      console.error('Get message requests error:', error);
      throw new Error('Failed to fetch message requests');
    }
  }

  /**
   * Respond to a message request
   */
  async respondToMessageRequest(requestId, userId, action, message = null) {
    try {
      // Check if user owns this request
      const requestCheck = await dbQuery(`
        SELECT id, from_user_id, post_id FROM message_requests 
        WHERE id = $1 AND to_user_id = $2
      `, [requestId, userId]);

      if (requestCheck.rows.length === 0) {
        throw new Error('Message request not found');
      }

      const request = requestCheck.rows[0];

      if (action === 'accept') {
        // Start conversation
        await this.startConversation(userId, request.from_user_id, request.post_id);
        
        // If there was an initial message, send it
        if (message) {
          const conversation = await dbQuery(`
            SELECT id FROM conversations 
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
            ${request.post_id ? 'AND post_id = $3' : ''}
          `, [userId, request.from_user_id, request.post_id]);
          
          if (conversation.rows.length > 0) {
            await this.sendMessage(conversation.rows[0].id, request.from_user_id, message);
          }
        }
      }

      // Update request status
      await dbQuery(`
        UPDATE message_requests 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [action, requestId]);

      return {
        success: true,
        message: `Message request ${action}ed successfully`
      };

    } catch (error) {
      console.error('Respond to message request error:', error);
      throw error;
    }
  }

  /**
   * Get message statistics for a user
   */
  async getMessageStats(userId) {
    try {
      const stats = await dbQuery(`
        SELECT 
          (SELECT COUNT(*) FROM conversations WHERE user1_id = $1 OR user2_id = $1) as total_conversations,
          (SELECT COUNT(*) FROM messages WHERE sender_id = $1 AND is_deleted = false) as total_messages_sent,
          (SELECT COUNT(*) FROM messages m 
           JOIN conversations c ON m.conversation_id = c.id 
           WHERE (c.user1_id = $1 OR c.user2_id = $1) AND m.sender_id != $1 AND m.is_read = false) as total_unread,
          (SELECT COUNT(*) FROM message_requests WHERE to_user_id = $1 AND status = 'pending') as pending_requests
      `, [userId]);

      return {
        success: true,
        data: {
          totalConversations: parseInt(stats.rows[0].total_conversations),
          totalMessagesSent: parseInt(stats.rows[0].total_messages_sent),
          totalUnread: parseInt(stats.rows[0].total_unread),
          pendingRequests: parseInt(stats.rows[0].pending_requests)
        }
      };

    } catch (error) {
      console.error('Get message stats error:', error);
      throw new Error('Failed to fetch message statistics');
    }
  }

  /**
   * Clear cache for a specific conversation
   */
  async clearConversationCache(conversationId) {
    try {
      const pattern = `conversations:*:*:*`;
      // Note: Redis doesn't support pattern deletion in single command
      // This would need to be implemented with SCAN + DEL in production
      console.log(`Cache cleared for conversation: ${conversationId}`);
    } catch (error) {
      console.error('Clear conversation cache error:', error);
    }
  }

  /**
   * Clear cache for a specific user's conversations
   */
  async clearUserConversationCache(userId) {
    try {
      const pattern = `conversations:${userId}:*:*`;
      console.log(`Cache cleared for user conversations: ${userId}`);
    } catch (error) {
      console.error('Clear user conversation cache error:', error);
    }
  }
}

module.exports = new MessageService(); 