const express = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, requireVerification } = require('../middleware/auth');
const marketSizeService = require('../services/marketSizeService');

const router = express.Router();

// @route   GET /api/v1/market-size/statistics
// @desc    Get market size statistics across all markets
// @access  Public
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await marketSizeService.getMarketSizeStatistics();
    
    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error getting market size statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market size statistics',
      error: error.message
    });
  }
});

// @route   GET /api/v1/market-size/university/:universityId
// @desc    Get market size for a specific university
// @access  Public
router.get('/university/:universityId', [
  param('universityId').isInt({ min: 1 }).withMessage('Invalid university ID'),
  validate
], async (req, res) => {
  try {
    const { universityId } = req.params;
    
    const marketInfo = await marketSizeService.getUniversityMarketSize(universityId);
    
    res.json({
      success: true,
      data: marketInfo
    });

  } catch (error) {
    console.error('Error getting university market size:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get university market size',
      error: error.message
    });
  }
});

// @route   POST /api/v1/market-size/update-all
// @desc    Update market sizes for all universities
// @access  Private (Admin only)
router.post('/update-all', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const result = await marketSizeService.updateAllMarketSizes();
    
    res.json({
      success: true,
      message: 'All market sizes updated',
      data: result
    });

  } catch (error) {
    console.error('Error updating market sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update market sizes',
      error: error.message
    });
  }
});

// @route   POST /api/v1/market-size/posts/update
// @desc    Update market sizes for all posts
// @access  Private (Admin only)
router.post('/posts/update', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const result = await marketSizeService.updatePostMarketSizes();
    
    res.json({
      success: true,
      message: 'Post market sizes updated',
      data: result
    });

  } catch (error) {
    console.error('Error updating post market sizes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post market sizes',
      error: error.message
    });
  }
});

module.exports = router; 