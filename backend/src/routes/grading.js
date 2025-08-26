const express = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, requireVerification } = require('../middleware/auth');
const relativeGradingService = require('../services/relativeGradingService');
const marketSizeService = require('../services/marketSizeService');

const router = express.Router();

// @route   POST /api/v1/grading/calculate-market/:marketSize
// @desc    Calculate and assign relative grades for a specific market
// @access  Private (Admin only)
router.post('/calculate-market/:marketSize', [
  param('marketSize').isIn(['small', 'medium', 'large', 'massive']).withMessage('Invalid market size'),
  validate
], async (req, res) => {
  try {
    const { marketSize } = req.params;
    
    const result = await relativeGradingService.calculateMarketGrades(marketSize);
    
    res.json({
      success: true,
      message: `Grades calculated for ${marketSize} market`,
      data: result
    });

  } catch (error) {
    console.error('Error calculating market grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate market grades',
      error: error.message
    });
  }
});

// @route   POST /api/v1/grading/calculate-all-markets
// @desc    Calculate and assign relative grades for all markets
// @access  Private (Admin only)
router.post('/calculate-all-markets', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const result = await relativeGradingService.recalculateAllMarketGrades();
    
    res.json({
      success: true,
      message: 'All market grades recalculated',
      data: result
    });

  } catch (error) {
    console.error('Error calculating all market grades:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate all market grades',
      error: error.message
    });
  }
});

// @route   GET /api/v1/grading/market/:marketSize/distribution
// @desc    Get grade distribution for a specific market
// @access  Public
router.get('/market/:marketSize/distribution', [
  param('marketSize').isIn(['small', 'medium', 'large', 'massive']).withMessage('Invalid market size'),
  validate
], async (req, res) => {
  try {
    const { marketSize } = req.params;
    
    const distribution = await relativeGradingService.getMarketGradeDistribution(marketSize);
    
    res.json({
      success: true,
      data: distribution
    });

  } catch (error) {
    console.error('Error getting market grade distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get market grade distribution',
      error: error.message
    });
  }
});

// @route   GET /api/v1/grading/post/:postId
// @desc    Get grade information for a specific post
// @access  Public
router.get('/post/:postId', [
  param('postId').isInt({ min: 1 }).withMessage('Invalid post ID'),
  validate
], async (req, res) => {
  try {
    const { postId } = req.params;
    
    const gradeInfo = await relativeGradingService.getPostGradeInfo(postId);
    
    res.json({
      success: true,
      data: gradeInfo
    });

  } catch (error) {
    console.error('Error getting post grade info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post grade info',
      error: error.message
    });
  }
});

// @route   POST /api/v1/grading/post/:postId/update
// @desc    Update grade for a specific post
// @access  Private
router.post('/post/:postId/update', [
  auth,
  requireVerification,
  param('postId').isInt({ min: 1 }).withMessage('Invalid post ID'),
  validate
], async (req, res) => {
  try {
    const { postId } = req.params;
    
    const result = await relativeGradingService.updatePostGrade(postId);
    
    res.json({
      success: true,
      message: 'Post grade updated successfully',
      data: result
    });

  } catch (error) {
    console.error('Error updating post grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post grade',
      error: error.message
    });
  }
});



module.exports = router; 