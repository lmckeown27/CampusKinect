const express = require('express');
const { query } = require('../config/database');

const router = express.Router();

// @route   GET /api/v1/guest/universities
// @desc    Get list of all universities for guest selection
// @access  Public
router.get('/universities', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        id,
        name,
        domain,
        city,
        state,
        country,
        timezone
      FROM universities
      WHERE is_active = true
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: result.rows,
      message: 'Universities retrieved successfully'
    });

  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve universities. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/guest/university/:id
// @desc    Get single university details
// @access  Public
router.get('/university/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        id,
        name,
        domain,
        city,
        state,
        country,
        timezone,
        (SELECT COUNT(*) FROM users WHERE university_id = $1 AND is_active = true) as student_count,
        (SELECT COUNT(*) FROM posts WHERE university_id = $1 AND is_active = true) as post_count
      FROM universities
      WHERE id = $1 AND is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'University not found'
        }
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'University retrieved successfully'
    });

  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve university. Please try again.'
      }
    });
  }
});

module.exports = router;
