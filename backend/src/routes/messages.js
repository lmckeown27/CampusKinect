const express = require('express');
const { body, query, param } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validation');
const { auth, requireVerification } = require('../middleware/auth');
const messageService = require('../services/messageService');

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

    const result = await messageService.getUserConversations(userId, page, limit);
    res.json(result);

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch conversations. Please try again.'
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
  param('id').isInt().withMessage('Conversation ID must be an integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    const result = await messageService.getConversationMessages(conversationId, userId, page, limit);
    res.json(result);

  } catch (error) {
    console.error('Get messages error:', error);
    const statusCode = error.message.includes('Access denied') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch messages. Please try again.'
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

    const result = await messageService.startConversation(userId, otherUserId, postId);
    res.status(201).json(result);

  } catch (error) {
    console.error('Start conversation error:', error);
    const statusCode = error.message.includes('already exists') ? 400 : 
                      error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to start conversation. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/messages/requests
// @desc    Create a message request
// @access  Private
router.post('/requests', [
  auth,
  requireVerification,
  body('toUserId').isInt().withMessage('To user ID must be an integer'),
  body('content').isLength({ min: 1, max: 2000 }).withMessage('Message content must be 1-2000 characters'),
  body('postId').optional().isInt().withMessage('Post ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { toUserId, content, postId } = req.body;
    const fromUserId = req.user.id;

    const result = await messageService.createMessageRequest(fromUserId, toUserId, content, postId);
    res.status(201).json(result);

  } catch (error) {
    console.error('Create message request error:', error);
    const statusCode = error.message.includes('already exists') || error.message.includes('already sent') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to create message request. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/messages/requests/sent
// @desc    Get sent message requests for user
// @access  Private
router.get('/requests/sent', [
  auth,
  requireVerification,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await messageService.getSentMessageRequests(userId, page, limit);
    res.json(result);

  } catch (error) {
    console.error('Get sent message requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch sent message requests. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/messages/conversations/:id/messages
// @desc    Get messages from a conversation
// @access  Private
router.get('/conversations/:id/messages', [
  auth,
  requireVerification,
  param('id').isInt().withMessage('Conversation ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await messageService.getConversationMessages(conversationId, userId, page, limit);
    
    res.json({
      success: true,
      data: {
        messages: result.messages,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit)
        }
      }
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch conversation messages. Please try again.'
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
  param('id').isInt().withMessage('Conversation ID must be an integer'),
  body('content').isLength({ min: 1, max: 2000 }).withMessage('Message content must be 1-2000 characters'),
  body('messageType').optional().isIn(['text', 'image', 'contact', 'location', 'file']).withMessage('Invalid message type'),
  body('mediaUrl').optional().isURL().withMessage('Media URL must be a valid URL'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content, messageType = 'text', mediaUrl } = req.body;
    const userId = req.user.id;

    const result = await messageService.sendMessage(conversationId, userId, content, messageType, mediaUrl);
    
    // Emit real-time message via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Get the other user in the conversation
      const { query: dbQuery } = require('../config/database');
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
          message: result.data.message
        });
      }
    }

    res.status(201).json(result);

  } catch (error) {
    console.error('Send message error:', error);
    const statusCode = error.message.includes('Access denied') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to send message. Please try again.'
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
  param('id').isInt().withMessage('Conversation ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    const result = await messageService.markConversationAsRead(conversationId, userId);
    res.json(result);

  } catch (error) {
    console.error('Mark as read error:', error);
    const statusCode = error.message.includes('Access denied') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to mark messages as read. Please try again.'
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
  param('id').isInt().withMessage('Conversation ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const userId = req.user.id;

    const result = await messageService.deleteConversation(conversationId, userId);
    res.json(result);

  } catch (error) {
    console.error('Delete conversation error:', error);
    const statusCode = error.message.includes('Access denied') ? 403 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to delete conversation. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/messages/requests
// @desc    Get message requests for user
// @access  Private
router.get('/requests', [
  auth,
  requireVerification,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const result = await messageService.getMessageRequests(userId, page, limit);
    res.json(result);

  } catch (error) {
    console.error('Get message requests error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch message requests. Please try again.'
      }
    });
  }
});

// @route   PUT /api/v1/messages/requests/:id/respond
// @desc    Respond to a message request
// @access  Private
router.put('/requests/:id/respond', [
  auth,
  requireVerification,
  param('id').isInt().withMessage('Request ID must be an integer'),
  body('action').isIn(['accepted', 'rejected', 'ignored']).withMessage('Action must be accepted, rejected, or ignored'),
  body('message').optional().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
  validate
], async (req, res) => {
  try {
    const { id: requestId } = req.params;
    const { action, message } = req.body;
    const userId = req.user.id;

    const result = await messageService.respondToMessageRequest(requestId, userId, action, message);
    res.json(result);

  } catch (error) {
    console.error('Respond to message request error:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      error: {
        message: error.message || 'Failed to respond to message request. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/messages/stats
// @desc    Get message statistics for user
// @access  Private
router.get('/stats', [
  auth,
  requireVerification,
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await messageService.getMessageStats(userId);
    res.json(result);

  } catch (error) {
    console.error('Get message stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to fetch message statistics. Please try again.'
      }
    });
  }
});

module.exports = router; 