const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { auth } = require('../middleware/auth');

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
      WHERE banned_at IS NOT NULL
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

    // Ban the user (keep them active but mark as banned for auth middleware to block)
    await query(`
      UPDATE users 
      SET banned_at = CURRENT_TIMESTAMP,
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

// @route   GET /api/v1/admin/analytics
// @desc    Get comprehensive analytics data
// @access  Admin only
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    // Get total posts
    const totalPostsResult = await query(`
      SELECT COUNT(*) as count FROM posts WHERE is_active = true
    `);

    // Get total messages
    const totalMessagesResult = await query(`
      SELECT COUNT(*) as count FROM messages WHERE is_deleted = false
    `);

    // Get active users (users who posted or messaged in last 30 days)
    const activeUsersResult = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM (
        SELECT user_id FROM posts WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        UNION
        SELECT sender_id as user_id FROM messages WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      ) active_users
    `);

    // Get new users today
    const newUsersTodayResult = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE DATE(created_at) = CURRENT_DATE AND is_active = true
    `);

    // Get posts today
    const postsTodayResult = await query(`
      SELECT COUNT(*) as count 
      FROM posts 
      WHERE DATE(created_at) = CURRENT_DATE AND is_active = true
    `);

    // Get average messages per day (last 30 days)
    const messagesPerDayResult = await query(`
      SELECT ROUND(COUNT(*)::numeric / 30, 0) as avg_per_day
      FROM messages 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' AND is_deleted = false
    `);

    // Get top universities by user count
    const topUniversitiesResult = await query(`
      SELECT u.name, COUNT(us.id) as user_count
      FROM universities u
      JOIN users us ON u.id = us.university_id
      WHERE us.is_active = true
      GROUP BY u.id, u.name
      ORDER BY user_count DESC
      LIMIT 10
    `);

    // Get content trends (last 7 days)
    const contentTrendsResult = await query(`
      SELECT 
        date_series.date,
        COALESCE(posts.count, 0) as posts,
        COALESCE(messages.count, 0) as messages
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ) date_series
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM posts 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days' AND is_active = true
        GROUP BY DATE(created_at)
      ) posts ON date_series.date = posts.date
      LEFT JOIN (
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM messages 
        WHERE created_at >= CURRENT_DATE - INTERVAL '6 days' AND is_deleted = false
        GROUP BY DATE(created_at)
      ) messages ON date_series.date = messages.date
      ORDER BY date_series.date
    `);

    // Get reports by reason
    const reportsByReasonResult = await query(`
      SELECT reason, COUNT(*) as count
      FROM content_reports
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY reason
      ORDER BY count DESC
    `);

    // Get user growth (last 30 days)
    const userGrowthResult = await query(`
      SELECT 
        date_series.date,
        COUNT(u.id) as users
      FROM (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      ) date_series
      LEFT JOIN users u ON DATE(u.created_at) = date_series.date AND u.is_active = true
      GROUP BY date_series.date
      ORDER BY date_series.date
    `);

    res.json({
      success: true,
      data: {
        totalPosts: parseInt(totalPostsResult.rows[0].count),
        totalMessages: parseInt(totalMessagesResult.rows[0].count),
        activeUsers: parseInt(activeUsersResult.rows[0].count),
        newUsersToday: parseInt(newUsersTodayResult.rows[0].count),
        postsToday: parseInt(postsTodayResult.rows[0].count),
        messagesPerDay: parseInt(messagesPerDayResult.rows[0].avg_per_day || 0),
        topUniversities: topUniversitiesResult.rows.map(row => ({
          name: row.name,
          userCount: parseInt(row.user_count)
        })),
        contentTrends: contentTrendsResult.rows.map(row => ({
          date: row.date,
          posts: parseInt(row.posts),
          messages: parseInt(row.messages)
        })),
        reportsByReason: reportsByReasonResult.rows.map(row => ({
          reason: row.reason,
          count: parseInt(row.count)
        })),
        userGrowth: userGrowthResult.rows.map(row => ({
          date: row.date,
          users: parseInt(row.users)
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch analytics data'
      }
    });
  }
});

// @route   GET /api/v1/admin/users/banned
// @desc    Get list of banned users
// @access  Admin only
router.get('/users/banned', auth, adminAuth, async (req, res) => {
  try {
    const bannedUsersResult = await query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.banned_at,
        u.ban_reason,
        un.name as university
      FROM users u
      JOIN universities un ON u.university_id = un.id
      WHERE u.banned_at IS NOT NULL
      ORDER BY u.banned_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: bannedUsersResult.rows.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          bannedAt: user.banned_at,
          banReason: user.ban_reason,
          university: user.university
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching banned users:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch banned users'
      }
    });
  }
});

// @route   POST /api/v1/admin/users/:userId/unban
// @desc    Unban a user
// @access  Admin only
router.post('/users/:userId/unban', auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and is banned
    const userResult = await query(`
      SELECT id, username, banned_at FROM users WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const user = userResult.rows[0];
    if (!user.banned_at) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User is not banned'
        }
      });
    }

    // Unban the user
    await query(`
      UPDATE users 
      SET banned_at = NULL,
          ban_reason = NULL
      WHERE id = $1
    `, [userId]);

    // Reactivate user's posts (optional - you might want to review them first)
    await query(`
      UPDATE posts 
      SET is_active = true,
          is_flagged = false,
          flag_reason = NULL,
          flagged_at = NULL
      WHERE user_id = $1 AND flag_reason = 'User banned'
    `, [userId]);

    res.json({
      success: true,
      message: 'User unbanned successfully'
    });

  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to unban user'
      }
    });
  }
});

module.exports = router; 