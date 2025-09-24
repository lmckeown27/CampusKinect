const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const auth = require('../middleware/auth');
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
  body('details').optional().isLength({ max: 1000 }).withMessage('Details must be less than 1000 characters')
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

    // Check if user has already reported this content
    const existingReport = await query(`
      SELECT id FROM content_reports 
      WHERE reporter_id = $1 AND content_id = $2 AND content_type = $3
    `, [reporterId, contentId, contentType]);

    if (existingReport.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You have already reported this content'
        }
      });
    }

    // Verify content exists based on type
    let contentExists = false;
    let contentAuthorId = null;

    if (contentType === 'post') {
      const postCheck = await query('SELECT user_id FROM posts WHERE id = $1 AND is_active = true', [contentId]);
      if (postCheck.rows.length > 0) {
        contentExists = true;
        contentAuthorId = postCheck.rows[0].user_id;
      }
    } else if (contentType === 'message') {
      const messageCheck = await query('SELECT sender_id FROM messages WHERE id = $1', [contentId]);
      if (messageCheck.rows.length > 0) {
        contentExists = true;
        contentAuthorId = messageCheck.rows[0].sender_id;
      }
    } else if (contentType === 'user') {
      const userCheck = await query('SELECT id FROM users WHERE id = $1 AND is_active = true', [contentId]);
      if (userCheck.rows.length > 0) {
        contentExists = true;
        contentAuthorId = contentId;
      }
    }

    if (!contentExists) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Content not found or no longer available'
        }
      });
    }

    // Prevent users from reporting their own content
    if (contentAuthorId === reporterId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You cannot report your own content'
        }
      });
    }

    // Create the report
    const result = await query(`
      INSERT INTO content_reports (
        reporter_id, content_id, content_type, reason, details, 
        content_author_id, status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
      RETURNING id, created_at
    `, [reporterId, contentId, contentType, reason, details, contentAuthorId]);

    const report = result.rows[0];

    // Log the report for moderation team
    console.log(`🚨 NEW CONTENT REPORT:`, {
      reportId: report.id,
      contentType,
      contentId,
      reason,
      reporterId,
      contentAuthorId,
      timestamp: report.created_at
    });

    // TODO: Send notification to moderation team
    // TODO: Auto-moderate based on content filters
    
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our moderation team will review this within 24 hours.',
      data: {
        reportId: report.id,
        status: 'pending'
      }
    });

  } catch (error) {
    console.error('Error creating content report:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit report. Please try again.'
      }
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