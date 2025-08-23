const express = require('express');
const { body, query } = require('express-validator');
const { query: dbQuery } = require('../config/database');
const { redisGet, redisSet, redisDel, generateCacheKey, CACHE_TTL } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { auth, requireVerification } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', [
  auth,
  requireVerification,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get conversations with last message and other user info
    const result = await dbQuery(`
      SELECT 
        c.id as conversation_id,
        c.post_id,
        c.created_at as conversation_created,
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
      ORDER BY last_message_time DESC NULLS LAST
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

    res.json({
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
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch conversations. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/messages/conversations/:id
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id', [
  auth,
  requireVerification,
  query('id').isInt().withMessage('Conversation ID must be an integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user is part of this conversation
    const convCheck = await dbQuery(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this conversation'
        }
      });
    }

    // Get messages
    const result = await dbQuery(`
      SELECT 
        m.id,
        m.content,
        m.message_type,
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
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [conversationId, limit, offset]);

    // Get total count
    const countResult = await dbQuery(`
      SELECT COUNT(*) as total
      FROM messages
      WHERE conversation_id = $1
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

    res.json({
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
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch messages. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/messages/conversations
// @desc    Start a new conversation
// @access  Private
router.post('/conversations', [
  auth,
  requireVerification,
  body('otherUserId').isInt().withMessage('Other user ID must be an integer'),
  body('postId').optional().isInt().withMessage('Post ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { otherUserId, postId } = req.body;
    const userId = req.user.id;

    if (otherUserId === userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot start conversation with yourself'
        }
      });
    }

    // Check if conversation already exists
    const existingConv = await dbQuery(`
      SELECT id FROM conversations 
      WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
      ${postId ? 'AND post_id = $3' : ''}
    `, postId ? [userId, otherUserId, postId] : [userId, otherUserId]);

    if (existingConv.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Conversation already exists'
        }
      });
    }

    // Check if other user exists
    const otherUser = await dbQuery(`
      SELECT id, username, first_name, last_name, display_name, profile_picture
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [otherUserId]);

    if (otherUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Create conversation
    const result = await dbQuery(`
      INSERT INTO conversations (user1_id, user2_id, post_id)
      VALUES ($1, $2, $3)
      RETURNING id, created_at
    `, [userId, otherUserId, postId]);

    const conversation = result.rows[0];

    res.status(201).json({
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
    });

  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to start conversation. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/messages/conversations/:id/messages
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id/messages', [
  auth,
  requireVerification,
  query('id').isInt().withMessage('Conversation ID must be an integer'),
  body('content').isLength({ min: 1, max: 2000 }).withMessage('Message content must be 1-2000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'contact']).withMessage('Invalid message type'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content, messageType = 'text' } = req.body;
    const userId = req.user.id;

    // Check if user is part of this conversation
    const convCheck = await dbQuery(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this conversation'
        }
      });
    }

    // Create message
    const result = await dbQuery(`
      INSERT INTO messages (conversation_id, sender_id, content, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, message_type, is_read, created_at
    `, [conversationId, userId, content, messageType]);

    const message = result.rows[0];

    // Get sender info
    const senderResult = await dbQuery(`
      SELECT username, first_name, last_name, display_name, profile_picture
      FROM users 
      WHERE id = $1
    `, [userId]);

    const sender = senderResult.rows[0];

    const formattedMessage = {
      id: message.id,
      content: message.content,
      messageType: message.message_type,
      isRead: message.is_read,
      createdAt: message.created_at,
      sender: {
        id: userId,
        username: sender.username,
        firstName: sender.first_name,
        lastName: sender.last_name,
        displayName: sender.display_name,
        profilePicture: sender.profile_picture
      },
      isOwn: true
    };

    // Emit real-time message via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Get the other user in the conversation
      const otherUserResult = await dbQuery(`
        SELECT 
          CASE 
            WHEN user1_id = $1 THEN user2_id
            ELSE user1_id
          END as other_user_id
        FROM conversations 
        WHERE id = $2
      `, [userId, conversationId]);

      if (otherUserResult.rows.length > 0) {
        const otherUserId = otherUserResult.rows[0].other_user_id;
        
        // Emit to the other user's personal room
        io.to(`user-${otherUserId}`).emit('new-message', {
          conversationId,
          message: formattedMessage
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: formattedMessage
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send message. Please try again.'
      }
    });
  }
});

// @route   PUT /api/v1/messages/conversations/:id/read
// @desc    Mark conversation as read
// @access  Private
router.put('/conversations/:id/read', [
  auth,
  requireVerification,
  query('id').isInt().withMessage('Conversation ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    // Check if user is part of this conversation
    const convCheck = await dbQuery(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this conversation'
        }
      });
    }

    // Mark messages as read
    const result = await dbQuery(`
      UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
      RETURNING COUNT(*) as updated_count
    `, [conversationId, userId]);

    const updatedCount = parseInt(result.rows[0].updated_count);

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: {
        updatedCount
      }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark messages as read. Please try again.'
      }
    });
  }
});

// @route   DELETE /api/v1/messages/conversations/:id
// @desc    Delete a conversation
// @access  Private
router.delete('/conversations/:id', [
  auth,
  requireVerification,
  query('id').isInt().withMessage('Conversation ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    // Check if user is part of this conversation
    const convCheck = await dbQuery(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

    if (convCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied to this conversation'
        }
      });
    }

    // Delete conversation (cascades to messages)
    await dbQuery(`
      DELETE FROM conversations 
      WHERE id = $1
    `, [conversationId]);

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete conversation. Please try again.'
      }
    });
  }
});

module.exports = router; 