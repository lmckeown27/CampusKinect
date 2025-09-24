const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const router = express.Router();

// @route   POST /api/v1/reports
// @desc    Report objectionable content
// @access  Private
router.post('/', [
  auth,
  body('contentId').isInt().withMessage('Content ID must be an integer'),
  body('contentType').isIn(['post', 'message', 'user']).withMessage('Content type must be post, message, or user'),
  body('reason').isIn([
    'harassment', 'hate_speech', 'spam', 'inappropriate_content', 
    'scam', 'violence', 'sexual_content', 'false_information', 'other'
  ]).withMessage('Invalid report reason'),
  body('details').optional().isLength({ max: 1000 }).withMessage('Details must be less than 1000 characters'),
  validate
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

    const { contentId, contentType, reason, details } = req.body;
    const reporterId = req.user.id;

    // Determine the reported_user_id based on content type
    let reportedUserId = null;
    if (contentType === 'post') {
      const postResult = await query('SELECT user_id FROM posts WHERE id = $1', [contentId]);
      if (postResult.rows.length > 0) {
        reportedUserId = postResult.rows[0].user_id;
      }
    } else if (contentType === 'message') {
      const messageResult = await query('SELECT sender_id FROM messages WHERE id = $1', [contentId]);
      if (messageResult.rows.length > 0) {
        reportedUserId = messageResult.rows[0].sender_id;
      }
    } else if (contentType === 'user') {
      reportedUserId = contentId;
    }

    if (!reportedUserId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reported content or user not found.' }
      });
    }

    const result = await query(
      `INSERT INTO content_reports (reporter_id, reported_user_id, content_id, content_type, reason, details)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [reporterId, reportedUserId, contentId, contentType, reason, details]
    );

    console.log(`🚨 New content report received:
      Reporter ID: ${reporterId}
      Reported User ID: ${reportedUserId}
      Content Type: ${contentType}
      Content ID: ${contentId}
      Reason: ${reason}
      Details: ${details || 'N/A'}
    `);

    res.status(201).json({
      success: true,
      message: 'Content report submitted successfully. Our team will review it within 24 hours.',
      report: result.rows[0]
    });

  } catch (error) {
    console.error('Error submitting content report:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit report.' }
    });
  }
});

// @route   GET /api/v1/reports/my-reports
// @desc    Get user's submitted reports
// @access  Private
router.get('/my-reports', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT 
        cr.id,
        cr.content_id,
        cr.content_type,
        cr.reason,
        cr.details,
        cr.status,
        cr.created_at,
        cr.resolved_at,
        cr.moderator_notes
      FROM content_reports cr
      WHERE cr.reporter_id = $1
      ORDER BY cr.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM content_reports
      WHERE reporter_id = $1
    `, [userId]);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch reports'
      }
    });
  }
});

module.exports = router; 