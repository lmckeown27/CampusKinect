const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const auth = require('../middleware/auth');

// Admin authentication middleware - Restricted to specific user
const adminAuth = async (req, res, next) => {
  try {
    // Check if user is the specific admin (liam_mckeown38 / lmckeown@calpoly.edu)
    const userResult = await query(
      'SELECT email, username FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Not found'
        }
      });
    }

    const user = userResult.rows[0];
    const isAuthorizedAdmin = user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38';
    
    if (!isAuthorizedAdmin) {
      console.log(`Unauthorized admin access attempt by user: ${user.email} (${user.username})`);
      // Return 404 to hide the existence of admin endpoints
      return res.status(404).json({
        success: false,
        error: {
          message: 'Not found'
        }
      });
    }
    
    console.log(`Admin access granted to: ${user.email} (${user.username})`);
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    // Return 404 to hide admin endpoints even on server errors
    res.status(404).json({
      success: false,
      error: {
        message: 'Not found'
      }
    });
  }
};

// @route   GET /api/v1/admin/reports/pending
// @desc    Get pending content reports for moderation
// @access  Admin only
router.get('/reports/pending', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get pending reports with user information
    const reportsResult = await query(`
      SELECT 
        cr.id,
        cr.reporter_id,
        cr.reported_user_id,
        cr.content_id,
        cr.content_type,
        cr.reason,
        cr.details,
        cr.status,
        cr.created_at,
        u1.username as reporter_username,
        u1.display_name as reporter_display_name,
        u2.username as reported_username,
        u2.display_name as reported_display_name
      FROM content_reports cr
      LEFT JOIN users u1 ON cr.reporter_id = u1.id
      LEFT JOIN users u2 ON cr.reported_user_id = u2.id
      WHERE cr.status = 'pending'
      ORDER BY cr.created_at ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM content_reports 
      WHERE status = 'pending'
    `);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      data: {
        data: reportsResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pending reports:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch pending reports'
      }
    });
  }
});

// @route   GET /api/v1/admin/moderation/stats
// @desc    Get moderation statistics
// @access  Admin only
router.get('/moderation/stats', auth, adminAuth, async (req, res) => {
  try {
    // Get pending reports count
    const pendingResult = await query(`
      SELECT COUNT(*) as count 
      FROM content_reports 
      WHERE status = 'pending'
    `);

    // Get reports resolved today
    const resolvedTodayResult = await query(`
      SELECT COUNT(*) as count 
      FROM content_reports 
      WHERE status IN ('resolved', 'dismissed') 
      AND DATE(resolved_at) = CURRENT_DATE
    `);

    // Get average response time (in hours)
    const avgResponseResult = await query(`
      SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
      FROM content_reports 
      WHERE status IN ('resolved', 'dismissed') 
      AND resolved_at IS NOT NULL
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `);

    // Get total users count
    const totalUsersResult = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE is_active = true
    `);

    // Get banned users count
    const bannedUsersResult = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE is_active = false AND banned_at IS NOT NULL
    `);

    res.json({
      success: true,
      data: {
        pendingReports: parseInt(pendingResult.rows[0].count),
        resolvedToday: parseInt(resolvedTodayResult.rows[0].count),
        averageResponseTime: Math.round(parseFloat(avgResponseResult.rows[0].avg_hours || 0) * 10) / 10,
        totalUsers: parseInt(totalUsersResult.rows[0].count),
        bannedUsers: parseInt(bannedUsersResult.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch moderation statistics'
      }
    });
  }
});

// @route   POST /api/v1/admin/reports/:reportId/moderate
// @desc    Moderate a content report (approve/dismiss)
// @access  Admin only
router.post('/reports/:reportId/moderate', auth, adminAuth, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action, moderatorNotes } = req.body;

    if (!['approve', 'dismiss'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Action must be either "approve" or "dismiss"'
        }
      });
    }

    // Get the report details
    const reportResult = await query(`
      SELECT * FROM content_reports WHERE id = $1
    `, [reportId]);

    if (reportResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Report not found'
        }
      });
    }

    const report = reportResult.rows[0];

    if (action === 'approve') {
      // Remove the content and ban the user
      if (report.content_type === 'post') {
        // Deactivate the post
        await query(`
          UPDATE posts 
          SET is_active = false, 
              is_flagged = true, 
              flag_reason = $1,
              flagged_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [report.reason, report.content_id]);
      } else if (report.content_type === 'message') {
        // Mark message as deleted
        await query(`
          UPDATE messages 
          SET is_deleted = true, 
              deleted_at = CURRENT_TIMESTAMP,
              deleted_reason = $1
          WHERE id = $2
        `, [report.reason, report.content_id]);
      }

      // Ban the reported user
      await query(`
        UPDATE users 
        SET is_active = false, 
            banned_at = CURRENT_TIMESTAMP,
            ban_reason = $1
        WHERE id = $2
      `, [`Content violation: ${report.reason}`, report.reported_user_id]);

      // Update report status
      await query(`
        UPDATE content_reports 
        SET status = 'resolved',
            moderator_id = $1,
            moderator_notes = $2,
            resolved_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [req.user.id, moderatorNotes, reportId]);

    } else if (action === 'dismiss') {
      // Just update report status
      await query(`
        UPDATE content_reports 
        SET status = 'dismissed',
            moderator_id = $1,
            moderator_notes = $2,
            resolved_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [req.user.id, moderatorNotes, reportId]);
    }

    res.json({
      success: true,
      message: `Report ${action}d successfully`
    });

  } catch (error) {
    console.error('Error moderating report:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to moderate report'
      }
    });
  }
});

// @route   POST /api/v1/admin/users/:userId/ban
// @desc    Ban a user
// @access  Admin only
router.post('/users/:userId/ban', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Ban reason is required'
        }
      });
    }

    // Check if user exists
    const userResult = await query(`
      SELECT id FROM users WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Ban the user
    await query(`
      UPDATE users 
      SET is_active = false, 
          banned_at = CURRENT_TIMESTAMP,
          ban_reason = $1
      WHERE id = $2
    `, [reason, userId]);

    // Deactivate all user's posts
    await query(`
      UPDATE posts 
      SET is_active = false,
          is_flagged = true,
          flag_reason = 'User banned',
          flagged_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [userId]);

    res.json({
      success: true,
      message: 'User banned successfully'
    });

  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to ban user'
      }
    });
  }
});

module.exports = router; 