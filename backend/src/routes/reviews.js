const express = require('express');
const { body, query, param } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validation');
const { auth, checkOwnership, requireVerification } = require('../middleware/auth');
const reviewService = require('../services/reviewService');

const router = express.Router();

// All review routes require authentication
router.use(auth);

// @route   POST /api/v1/reviews
// @desc    Create a new review for a recurring post
// @access  Private
router.post('/', [
  body('postId').isInt({ min: 1 }).withMessage('Post ID must be a positive integer'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content').isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean'),
  validate
], async (req, res) => {
  try {
    const reviewData = {
      postId: parseInt(req.body.postId),
      reviewerId: req.user.id,
      rating: parseInt(req.body.rating),
      title: req.body.title,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || false
    };

    const review = await reviewService.createReview(reviewData);

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: {
        review: {
          id: review.id,
          postId: review.post_id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isAnonymous: review.is_anonymous,
          isVerifiedCustomer: review.is_verified_customer,
          createdAt: review.created_at
        }
      }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// @route   GET /api/v1/reviews/post/:postId
// @desc    Get reviews for a specific post
// @access  Private
router.get('/post/:postId', [
  param('postId').isInt({ min: 1 }).withMessage('Post ID must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['rating', 'created_at']).withMessage('Sort by must be rating or created_at'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  validate
], async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc'
    };

    const result = await reviewService.getPostReviews(postId, options);

    res.json({
      success: true,
      data: {
        reviews: result.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isAnonymous: review.is_anonymous,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          reviewer: {
            name: review.reviewer_name,
            username: review.reviewer_username,
            profilePicture: review.reviewer_picture
          },
          response: review.response_content ? {
            content: review.response_content,
            createdAt: review.response_created_at,
            responderName: review.responder_name
          } : null
        })),
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Get post reviews error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve reviews'
      }
    });
  }
});

// @route   GET /api/v1/reviews/post/:postId/summary
// @desc    Get review summary for a post
// @access  Private
router.get('/post/:postId/summary', [
  param('postId').isInt({ min: 1 }).withMessage('Post ID must be a positive integer'),
  validate
], async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const summary = await reviewService.getReviewSummary(postId);

    res.json({
      success: true,
      data: {
        summary: {
          totalReviews: summary.total_reviews,
          averageRating: parseFloat(summary.average_rating) || 0,
          ratingDistribution: summary.rating_distribution,
          counts: {
            fiveStar: summary.five_star_count,
            fourStar: summary.four_star_count,
            threeStar: summary.three_star_count,
            twoStar: summary.two_star_count,
            oneStar: summary.one_star_count
          }
        }
      }
    });

  } catch (error) {
    console.error('Get review summary error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve review summary'
      }
    });
  }
});

// @route   PUT /api/v1/reviews/:reviewId
// @desc    Update an existing review
// @access  Private (review owner only)
router.put('/:reviewId', [
  param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('content').optional().isLength({ min: 10, max: 1000 }).withMessage('Content must be between 10 and 1000 characters'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be a boolean'),
  validate
], async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const updateData = {
      rating: req.body.rating ? parseInt(req.body.rating) : undefined,
      title: req.body.title,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous
    };

    const review = await reviewService.updateReview(reviewId, req.user.id, updateData);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: {
          id: review.id,
          postId: review.post_id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isAnonymous: review.is_anonymous,
          isVerifiedCustomer: review.is_verified_customer,
          updatedAt: review.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// @route   DELETE /api/v1/reviews/:reviewId
// @desc    Delete a review
// @access  Private (review owner only)
router.delete('/:reviewId', [
  param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
  validate
], async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    await reviewService.deleteReview(reviewId, req.user.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// @route   POST /api/v1/reviews/:reviewId/response
// @desc    Add a response to a review (post owner only)
// @access  Private (post owner only)
router.post('/:reviewId/response', [
  param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
  body('content').isLength({ min: 10, max: 1000 }).withMessage('Response content must be between 10 and 1000 characters'),
  validate
], async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const content = req.body.content;

    const response = await reviewService.addReviewResponse(reviewId, req.user.id, content);

    res.status(201).json({
      success: true,
      message: 'Response added successfully',
      data: {
        response: {
          id: response.id,
          reviewId: response.review_id,
          content: response.content,
          createdAt: response.created_at
        }
      }
    });

  } catch (error) {
    console.error('Add review response error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// @route   PUT /api/v1/reviews/response/:responseId
// @desc    Update a review response (post owner only)
// @access  Private (post owner only)
router.put('/response/:responseId', [
  param('responseId').isInt({ min: 1 }).withMessage('Response ID must be a positive integer'),
  body('content').isLength({ min: 10, max: 1000 }).withMessage('Response content must be between 10 and 1000 characters'),
  validate
], async (req, res) => {
  try {
    const responseId = parseInt(req.params.responseId);
    const content = req.body.content;

    const response = await reviewService.updateReviewResponse(responseId, req.user.id, content);

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: {
        response: {
          id: response.id,
          reviewId: response.review_id,
          content: response.content,
          updatedAt: response.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update review response error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// @route   POST /api/v1/reviews/:reviewId/verify
// @desc    Mark a review as verified customer (post owner only)
// @access  Private (post owner only)
router.post('/:reviewId/verify', [
  param('reviewId').isInt({ min: 1 }).withMessage('Review ID must be a positive integer'),
  validate
], async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    await reviewService.markReviewAsVerified(reviewId, req.user.id);

    res.json({
      success: true,
      message: 'Review marked as verified customer successfully'
    });

  } catch (error) {
    console.error('Mark review as verified error:', error);
    res.status(400).json({
      success: false,
      error: {
        message: error.message
      }
    });
  }
});

// @route   GET /api/v1/reviews/my-reviews
// @desc    Get current user's reviews
// @access  Private
router.get('/my-reviews', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  validate
], async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    // Get user's reviews with post information
    const result = await reviewService.getUserReviews(req.user.id, options);

    res.json({
      success: true,
      data: {
        reviews: result.reviews.map(review => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          isAnonymous: review.is_anonymous,
          isVerifiedCustomer: review.is_verified_customer,
          createdAt: review.created_at,
          post: {
            id: review.post_id,
            title: review.post_title,
            postType: review.post_type,
            durationType: review.duration_type
          }
        })),
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve your reviews'
      }
    });
  }
});

module.exports = router; 