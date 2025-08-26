const express = require('express');
const { body, query, param } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, requireVerification } = require('../middleware/auth');
const reshuffleService = require('../services/reshuffleService');

const router = express.Router();

// @route   POST /api/v1/reshuffle/all
// @desc    Reshuffle all posts for a user (reset interaction history)
// @access  Private
router.post('/all', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is eligible for reshuffle
    const eligibility = await reshuffleService.checkReshuffleEligibility(userId, 'combined');
    
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: 'Not eligible for reshuffle',
        data: eligibility
      });
    }
    
    const result = await reshuffleService.reshuffleAllPosts(userId);
    
    res.json({
      success: true,
      message: 'All posts reshuffled successfully',
      data: result
    });

  } catch (error) {
    console.error('Error reshuffling all posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reshuffle posts',
      error: error.message
    });
  }
});

// @route   POST /api/v1/reshuffle/tag
// @desc    Reshuffle posts for a specific tag/category
// @access  Private
router.post('/tag', [
  auth,
  requireVerification,
  body('mainTab').isIn(['goods-services', 'events', 'combined']).withMessage('Invalid main tab'),
  body('subTab').optional().isString().withMessage('Sub tab must be a string'),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { mainTab, subTab = 'all' } = req.body;
    
    const result = await reshuffleService.reshuffleTagPosts(userId, mainTab, subTab);
    
    res.json({
      success: true,
      message: `${subTab} posts reshuffled successfully`,
      data: result
    });

  } catch (error) {
    console.error('Error reshuffling tag posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reshuffle tag posts',
      error: error.message
    });
  }
});

// @route   GET /api/v1/reshuffle/eligibility
// @desc    Check if user is eligible for reshuffle
// @access  Private
router.get('/eligibility', [
  auth,
  requireVerification,
  query('mainTab').optional().isIn(['goods-services', 'events', 'combined']).withMessage('Invalid main tab'),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { mainTab = 'combined' } = req.query;
    
    const eligibility = await reshuffleService.checkReshuffleEligibility(userId, mainTab);
    
    res.json({
      success: true,
      data: eligibility
    });

  } catch (error) {
    console.error('Error checking reshuffle eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check reshuffle eligibility',
      error: error.message
    });
  }
});

// @route   GET /api/v1/reshuffle/statistics
// @desc    Get reshuffle statistics for a user
// @access  Private
router.get('/statistics', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const userId = req.user.id;
    
    const statistics = await reshuffleService.getReshuffleStatistics(userId);
    
    res.json({
      success: true,
      data: statistics
    });

  } catch (error) {
    console.error('Error getting reshuffle statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reshuffle statistics',
      error: error.message
    });
  }
});

// @route   GET /api/v1/reshuffle/status
// @desc    Get current reshuffle status and recommendations
// @access  Private
router.get('/status', [
  auth,
  requireVerification
], async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check eligibility for all main tabs
    const goodsServicesEligibility = await reshuffleService.checkReshuffleEligibility(userId, 'goods-services');
    const eventsEligibility = await reshuffleService.checkReshuffleEligibility(userId, 'events');
    const combinedEligibility = await reshuffleService.checkReshuffleEligibility(userId, 'combined');
    
    const status = {
      userId,
      mainTabs: {
        'goods-services': goodsServicesEligibility,
        'events': eventsEligibility,
        'combined': combinedEligibility
      },
      recommendations: []
    };
    
    // Generate recommendations
    if (combinedEligibility.eligible) {
      status.recommendations.push({
        type: 'reshuffle',
        priority: 'high',
        message: 'You have seen all available posts! Click "Reshuffle from Top" to see them again.',
        action: 'reshuffle-all'
      });
    } else if (goodsServicesEligibility.eligible) {
      status.recommendations.push({
        type: 'reshuffle',
        priority: 'medium',
        message: 'You have seen all goods and services posts. Consider reshuffling or switching to events.',
        action: 'reshuffle-goods-services'
      });
    } else if (eventsEligibility.eligible) {
      status.recommendations.push({
        type: 'reshuffle',
        priority: 'medium',
        message: 'You have seen all events posts. Consider reshuffling or switching to goods and services.',
        action: 'reshuffle-events'
      });
    }
    
    // Add warnings for low post counts
    if (goodsServicesEligibility.remainingPosts < 10 && goodsServicesEligibility.remainingPosts > 0) {
      status.recommendations.push({
        type: 'warning',
        priority: 'low',
        message: `Only ${goodsServicesEligibility.remainingPosts} goods and services posts remaining.`,
        action: 'explore-events'
      });
    }
    
    if (eventsEligibility.remainingPosts < 10 && eventsEligibility.remainingPosts > 0) {
      status.recommendations.push({
        type: 'warning',
        priority: 'low',
        message: `Only ${eventsEligibility.remainingPosts} events posts remaining.`,
        action: 'explore-goods-services'
      });
    }
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error getting reshuffle status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reshuffle status',
      error: error.message
    });
  }
});

module.exports = router; 