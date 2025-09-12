const { query } = require('../config/database');
const { redisGet, redisSet, redisDel } = require('../config/redis');
const pushNotificationService = require('./pushNotificationService');

class BackgroundSyncService {
  constructor() {
    this.syncQueues = new Map();
    this.conflictResolvers = new Map();
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.batchSize = 50;
    
    this.initializeConflictResolvers();
    this.startSyncProcessor();
  }

  initializeConflictResolvers() {
    // Define conflict resolution strategies for different data types
    this.conflictResolvers.set('message', this.resolveMessageConflict.bind(this));
    this.conflictResolvers.set('post_interaction', this.resolveInteractionConflict.bind(this));
    this.conflictResolvers.set('post_create', this.resolvePostConflict.bind(this));
    this.conflictResolvers.set('user_update', this.resolveUserUpdateConflict.bind(this));
  }

  // Add action to sync queue
  async queueAction(userId, action) {
    try {
      const queueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending'
      };

      // Store in database
      await query(`
        INSERT INTO offline_sync_queue (user_id, action_type, action_data, client_timestamp, processed)
        VALUES ($1, $2, $3, $4, false)
      `, [
        userId,
        action.type,
        JSON.stringify(action),
        action.clientTimestamp || new Date()
      ]);

      // Add to memory queue for immediate processing
      if (!this.syncQueues.has(userId)) {
        this.syncQueues.set(userId, []);
      }
      this.syncQueues.get(userId).push(queueItem);

      console.log(`📥 Queued action ${action.type} for user ${userId}`);
      return { success: true, queueId: queueItem.id };

    } catch (error) {
      console.error('Error queueing sync action:', error);
      return { success: false, error: error.message };
    }
  }

  // Process sync queue for a specific user
  async processSyncQueue(userId) {
    try {
      // Get pending actions from database
      const result = await query(`
        SELECT id, action_type, action_data, client_timestamp, retry_count
        FROM offline_sync_queue 
        WHERE user_id = $1 AND processed = false
        ORDER BY client_timestamp ASC
        LIMIT $2
      `, [userId, this.batchSize]);

      if (result.rows.length === 0) {
        return { success: true, processed: 0 };
      }

      const processedActions = [];
      const failedActions = [];

      for (const row of result.rows) {
        try {
          const action = JSON.parse(row.action_data);
          const syncResult = await this.processAction(userId, action, row.client_timestamp);

          if (syncResult.success) {
            processedActions.push(row.id);
          } else {
            failedActions.push({
              id: row.id,
              error: syncResult.error,
              retryCount: row.retry_count || 0
            });
          }
        } catch (actionError) {
          console.error(`Error processing action ${row.id}:`, actionError);
          failedActions.push({
            id: row.id,
            error: actionError.message,
            retryCount: row.retry_count || 0
          });
        }
      }

      // Mark successful actions as processed
      if (processedActions.length > 0) {
        await query(`
          UPDATE offline_sync_queue 
          SET processed = true, processed_at = NOW() 
          WHERE id = ANY($1)
        `, [processedActions]);
      }

      // Handle failed actions
      for (const failed of failedActions) {
        if (failed.retryCount < this.maxRetries) {
          // Increment retry count
          await query(`
            UPDATE offline_sync_queue 
            SET retry_count = retry_count + 1, last_error = $1 
            WHERE id = $2
          `, [failed.error, failed.id]);
        } else {
          // Mark as failed permanently
          await query(`
            UPDATE offline_sync_queue 
            SET processed = true, failed = true, last_error = $1 
            WHERE id = $2
          `, [failed.error, failed.id]);
        }
      }

      return {
        success: true,
        processed: processedActions.length,
        failed: failedActions.length,
        total: result.rows.length
      };

    } catch (error) {
      console.error('Error processing sync queue:', error);
      return { success: false, error: error.message };
    }
  }

  // Process individual action
  async processAction(userId, action, clientTimestamp) {
    try {
      switch (action.type) {
        case 'message':
          return await this.syncMessage(userId, action, clientTimestamp);
        
        case 'post_interaction':
          return await this.syncPostInteraction(userId, action, clientTimestamp);
        
        case 'post_create':
          return await this.syncPostCreate(userId, action, clientTimestamp);
        
        case 'user_update':
          return await this.syncUserUpdate(userId, action, clientTimestamp);
        
        case 'post_view':
          return await this.syncPostView(userId, action, clientTimestamp);
        
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }
    } catch (error) {
      console.error(`Error processing action ${action.type}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Sync message creation
  async syncMessage(userId, action, clientTimestamp) {
    try {
      // Check for conflicts (message already exists)
      const existingMessage = await query(`
        SELECT id FROM messages 
        WHERE conversation_id = $1 AND sender_id = $2 AND content = $3
        AND created_at BETWEEN $4 - INTERVAL '1 minute' AND $4 + INTERVAL '1 minute'
      `, [action.conversationId, userId, action.content, clientTimestamp]);

      if (existingMessage.rows.length > 0) {
        return { success: true, duplicate: true, messageId: existingMessage.rows[0].id };
      }

      // Create message
      const result = await query(`
        INSERT INTO messages (conversation_id, sender_id, content, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at
      `, [action.conversationId, userId, action.content, clientTimestamp]);

      // Update conversation timestamp
      await query(`
        UPDATE conversations 
        SET updated_at = $1 
        WHERE id = $2
      `, [result.rows[0].created_at, action.conversationId]);

      // Send push notification to recipient
      const conversation = await query(`
        SELECT user1_id, user2_id FROM conversations WHERE id = $1
      `, [action.conversationId]);

      if (conversation.rows.length > 0) {
        const recipientId = conversation.rows[0].user1_id === userId 
          ? conversation.rows[0].user2_id 
          : conversation.rows[0].user1_id;

        const sender = await query(`
          SELECT first_name, last_name FROM users WHERE id = $1
        `, [userId]);

        if (sender.rows.length > 0) {
          await pushNotificationService.sendMessageNotification(
            recipientId,
            `${sender.rows[0].first_name} ${sender.rows[0].last_name}`,
            action.content
          );
        }
      }

      return { 
        success: true, 
        messageId: result.rows[0].id,
        serverTimestamp: result.rows[0].created_at
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sync post interaction (like, bookmark, etc.)
  async syncPostInteraction(userId, action, clientTimestamp) {
    try {
      // Check if interaction already exists
      const existing = await query(`
        SELECT id FROM post_interactions 
        WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3
      `, [userId, action.postId, action.interactionType]);

      if (action.remove) {
        // Remove interaction
        if (existing.rows.length > 0) {
          await query(`
            DELETE FROM post_interactions 
            WHERE user_id = $1 AND post_id = $2 AND interaction_type = $3
          `, [userId, action.postId, action.interactionType]);
        }
      } else {
        // Add interaction
        if (existing.rows.length === 0) {
          await query(`
            INSERT INTO post_interactions (user_id, post_id, interaction_type, created_at)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
          `, [userId, action.postId, action.interactionType, clientTimestamp]);
        }
      }

      // Update post engagement counts
      await this.updatePostEngagementCounts(action.postId);

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sync post creation
  async syncPostCreate(userId, action, clientTimestamp) {
    try {
      // Check for duplicate posts
      const duplicate = await query(`
        SELECT id FROM posts 
        WHERE user_id = $1 AND content = $2
        AND created_at BETWEEN $3 - INTERVAL '5 minutes' AND $3 + INTERVAL '5 minutes'
      `, [userId, action.content, clientTimestamp]);

      if (duplicate.rows.length > 0) {
        return { success: true, duplicate: true, postId: duplicate.rows[0].id };
      }

      // Create post
      const result = await query(`
        INSERT INTO posts (user_id, content, category, subcategory, location, duration_type, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at
      `, [
        userId,
        action.content,
        action.category || null,
        action.subcategory || null,
        action.location || null,
        action.duration || 'permanent',
        clientTimestamp
      ]);

      const postId = result.rows[0].id;

      // Handle tags if present
      if (action.tags && action.tags.length > 0) {
        for (const tagName of action.tags) {
          let tagResult = await query('SELECT id FROM tags WHERE name = $1', [tagName]);
          
          if (tagResult.rows.length === 0) {
            tagResult = await query(
              'INSERT INTO tags (name) VALUES ($1) RETURNING id',
              [tagName]
            );
          }

          await query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [postId, tagResult.rows[0].id]
          );
        }
      }

      return { 
        success: true, 
        postId,
        serverTimestamp: result.rows[0].created_at
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sync user profile updates
  async syncUserUpdate(userId, action, clientTimestamp) {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic update query
      for (const [field, value] of Object.entries(action.updates)) {
        if (['first_name', 'last_name', 'bio', 'year', 'major', 'hometown'].includes(field)) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return { success: true, message: 'No valid fields to update' };
      }

      values.push(userId);
      
      await query(`
        UPDATE users 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramIndex}
      `, values);

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Sync post view tracking
  async syncPostView(userId, action, clientTimestamp) {
    try {
      // Simple view tracking - could be enhanced with analytics
      await query(`
        UPDATE posts 
        SET view_count = COALESCE(view_count, 0) + 1 
        WHERE id = $1
      `, [action.postId]);

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update post engagement counts
  async updatePostEngagementCounts(postId) {
    try {
      await query(`
        UPDATE posts SET
          message_count = (SELECT COUNT(*) FROM post_interactions WHERE post_id = $1 AND interaction_type = 'message'),
          bookmark_count = (SELECT COUNT(*) FROM post_interactions WHERE post_id = $1 AND interaction_type = 'bookmark'),
          repost_count = (SELECT COUNT(*) FROM post_interactions WHERE post_id = $1 AND interaction_type = 'repost')
        WHERE id = $1
      `, [postId]);
    } catch (error) {
      console.error('Error updating engagement counts:', error);
    }
  }

  // Conflict resolution strategies
  async resolveMessageConflict(localAction, serverData, clientTimestamp) {
    // For messages, server wins (avoid duplicates)
    return { resolution: 'server_wins', action: 'ignore_local' };
  }

  async resolveInteractionConflict(localAction, serverData, clientTimestamp) {
    // For interactions, use timestamp to determine winner
    const serverTimestamp = new Date(serverData.created_at);
    return clientTimestamp > serverTimestamp 
      ? { resolution: 'client_wins', action: 'apply_local' }
      : { resolution: 'server_wins', action: 'ignore_local' };
  }

  async resolvePostConflict(localAction, serverData, clientTimestamp) {
    // For posts, avoid duplicates but allow similar content
    return { resolution: 'create_new', action: 'apply_with_suffix' };
  }

  async resolveUserUpdateConflict(localAction, serverData, clientTimestamp) {
    // For user updates, merge changes where possible
    return { resolution: 'merge', action: 'merge_fields' };
  }

  // Start background sync processor
  startSyncProcessor() {
    setInterval(async () => {
      try {
        // Get users with pending sync actions
        const result = await query(`
          SELECT DISTINCT user_id 
          FROM offline_sync_queue 
          WHERE processed = false 
          AND (retry_count < $1 OR retry_count IS NULL)
        `, [this.maxRetries]);

        for (const row of result.rows) {
          await this.processSyncQueue(row.user_id);
        }
      } catch (error) {
        console.error('Error in sync processor:', error);
      }
    }, 30000); // Run every 30 seconds
  }

  // Get sync status for user
  async getSyncStatus(userId) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_actions,
          COUNT(*) FILTER (WHERE processed = true) as processed_actions,
          COUNT(*) FILTER (WHERE processed = false AND retry_count < $1) as pending_actions,
          COUNT(*) FILTER (WHERE failed = true) as failed_actions,
          MAX(created_at) as last_action_time
        FROM offline_sync_queue 
        WHERE user_id = $2
      `, [this.maxRetries, userId]);

      const stats = result.rows[0];
      
      return {
        totalActions: parseInt(stats.total_actions),
        processedActions: parseInt(stats.processed_actions),
        pendingActions: parseInt(stats.pending_actions),
        failedActions: parseInt(stats.failed_actions),
        lastActionTime: stats.last_action_time,
        syncProgress: stats.total_actions > 0 
          ? (stats.processed_actions / stats.total_actions) * 100 
          : 100
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        totalActions: 0,
        processedActions: 0,
        pendingActions: 0,
        failedActions: 0,
        lastActionTime: null,
        syncProgress: 100
      };
    }
  }

  // Force sync for user
  async forceSyncUser(userId) {
    try {
      const result = await this.processSyncQueue(userId);
      
      // Send push notification about sync completion if there were actions
      if (result.processed > 0) {
        await pushNotificationService.sendSystemNotification(
          userId,
          'Sync Complete',
          `${result.processed} action(s) synchronized successfully`
        );
      }

      return result;
    } catch (error) {
      console.error('Error forcing sync:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up old sync records
  async cleanupOldSyncRecords(retentionDays = 30) {
    try {
      const result = await query(`
        DELETE FROM offline_sync_queue 
        WHERE processed = true 
        AND processed_at < NOW() - INTERVAL '${retentionDays} days'
      `);

      console.log(`🧹 Cleaned up ${result.rowCount} old sync records`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up sync records:', error);
      return 0;
    }
  }
}

module.exports = new BackgroundSyncService(); 