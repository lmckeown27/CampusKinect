const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/v1/users/block
// @desc    Block a user
// @access  Private
router.post('/block', [
  auth,
  body('userId').isInt().withMessage('User ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { userId } = req.body;
    const blockerId = req.user.id;

    // Prevent users from blocking themselves
    if (userId === blockerId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You cannot block yourself'
        }
      });
    }

    // Check if user exists and is active
    const userCheck = await query(`
      SELECT id, username, first_name, last_name 
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [userId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Check if already blocked
    const existingBlock = await query(`
      SELECT id FROM user_blocks 
      WHERE blocker_id = $1 AND blocked_id = $2
    `, [blockerId, userId]);

    if (existingBlock.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User is already blocked'
        }
      });
    }

    // Create the block
    await query(`
      INSERT INTO user_blocks (blocker_id, blocked_id, created_at)
      VALUES ($1, $2, NOW())
    `, [blockerId, userId]);

    // Remove any existing conversations between the users
    await query(`
      UPDATE conversations 
      SET is_active = false 
      WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
    `, [blockerId, userId]);

    console.log(`🚫 User ${blockerId} blocked user ${userId}`);

    res.json({
      success: true,
      message: 'User blocked successfully'
    });

  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to block user. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/users/unblock
// @desc    Unblock a user
// @access  Private
router.post('/unblock', [
  auth,
  body('userId').isInt().withMessage('User ID must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { userId } = req.body;
    const blockerId = req.user.id;

    // Check if block exists
    const blockCheck = await query(`
      SELECT id FROM user_blocks 
      WHERE blocker_id = $1 AND blocked_id = $2
    `, [blockerId, userId]);

    if (blockCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User is not blocked'
        }
      });
    }

    // Remove the block
    await query(`
      DELETE FROM user_blocks 
      WHERE blocker_id = $1 AND blocked_id = $2
    `, [blockerId, userId]);

    console.log(`✅ User ${blockerId} unblocked user ${userId}`);

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to unblock user. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/users/blocked
// @desc    Get list of blocked users
// @access  Private
router.get('/blocked', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.profile_picture,
        ub.created_at as blocked_at
      FROM user_blocks ub
      JOIN users u ON u.id = ub.blocked_id
      WHERE ub.blocker_id = $1 AND u.is_active = true
      ORDER BY ub.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM user_blocks ub
      JOIN users u ON u.id = ub.blocked_id
      WHERE ub.blocker_id = $1 AND u.is_active = true
    `, [userId]);

    // Format the response
    const blockedUsers = result.rows.map(row => ({
      id: row.id,
      username: row.username,
      displayName: `${row.first_name} ${row.last_name}`.trim(),
      profilePicture: row.profile_picture,
      blockedAt: row.blocked_at
    }));

    res.json({
      success: true,
      data: blockedUsers,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching blocked users:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch blocked users'
      }
    });
  }
});

// @route   GET /api/v1/users/is-blocked/:userId
// @desc    Check if a user is blocked
// @access  Private
router.get('/is-blocked/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const result = await query(`
      SELECT id FROM user_blocks 
      WHERE blocker_id = $1 AND blocked_id = $2
    `, [currentUserId, userId]);

    res.json({
      success: true,
      data: {
        isBlocked: result.rows.length > 0
      }
    });

  } catch (error) {
    console.error('Error checking block status:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check block status'
      }
    });
  }
});

module.exports = router; 