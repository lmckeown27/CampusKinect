const { query } = require('../config/database');
const { redisGet, redisSet, redisDel, generateCacheKey, CACHE_TTL } = require('../config/redis');

/**
 * Review Service
 * Handles all review-related operations for recurring posts
 * Includes review creation, management, and scoring integration
 */

class ReviewService {
  /**
   * Create a new review for a recurring post
   * @param {Object} reviewData - Review data
   * @param {number} reviewData.postId - Post ID
   * @param {number} reviewData.reviewerId - User ID of reviewer
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.title - Review title (optional)
   * @param {string} reviewData.content - Review content
   * @param {boolean} reviewData.isAnonymous - Whether review is anonymous
   * @returns {Object} Created review
   */
  async createReview(reviewData) {
    const {
      postId,
      reviewerId,
      rating,
      title,
      content,
      isAnonymous = false
    } = reviewData;

    try {
      // Verify the post is a recurring post
      const postCheck = await query(`
        SELECT id, user_id, duration_type, is_active
        FROM posts 
        WHERE id = $1 AND duration_type = 'recurring' AND is_active = true
      `, [postId]);

      if (postCheck.rows.length === 0) {
        throw new Error('Post not found or not eligible for reviews (must be recurring)');
      }

      const post = postCheck.rows[0];

      // Prevent users from reviewing their own posts
      if (post.user_id === reviewerId) {
        throw new Error('Cannot review your own post');
      }

      // Check if user has already reviewed this post
      const existingReview = await query(`
        SELECT id FROM reviews WHERE post_id = $1 AND reviewer_id = $2
      `, [postId, reviewerId]);

      if (existingReview.rows.length > 0) {
        throw new Error('You have already reviewed this post');
      }

      // Create the review
      const result = await query(`
        INSERT INTO reviews (post_id, reviewer_id, rating, title, content, is_anonymous)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [postId, reviewerId, rating, title, content, isAnonymous]);

      const review = result.rows[0];

      // Update post review statistics
      await this.updatePostReviewStats(postId);

      // Clear post cache
      await this.clearPostCache(postId);

      return review;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   * @param {number} reviewId - Review ID
   * @param {number} reviewerId - User ID of reviewer (for ownership verification)
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated review
   */
  async updateReview(reviewId, reviewerId, updateData) {
    const { rating, title, content, isAnonymous } = updateData;

    try {
      // Verify ownership
      const ownershipCheck = await query(`
        SELECT id FROM reviews WHERE id = $1 AND reviewer_id = $2
      `, [reviewId, reviewerId]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('Review not found or you do not have permission to edit it');
      }

      // Update the review
      const result = await query(`
        UPDATE reviews 
        SET rating = COALESCE($1, rating),
            title = COALESCE($2, title),
            content = COALESCE($3, content),
            is_anonymous = COALESCE($4, is_anonymous),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `, [rating, title, content, isAnonymous, reviewId]);

      const review = result.rows[0];

      // Update post review statistics
      await this.updatePostReviewStats(review.post_id);

      // Clear post cache
      await this.clearPostCache(review.post_id);

      return review;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   * @param {number} reviewId - Review ID
   * @param {number} reviewerId - User ID of reviewer (for ownership verification)
   * @returns {boolean} Success status
   */
  async deleteReview(reviewId, reviewerId) {
    try {
      // Verify ownership
      const ownershipCheck = await query(`
        SELECT id, post_id FROM reviews WHERE id = $1 AND reviewer_id = $2
      `, [reviewId, reviewerId]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('Review not found or you do not have permission to delete it');
      }

      const postId = ownershipCheck.rows[0].post_id;

      // Delete the review
      await query('DELETE FROM reviews WHERE id = $1', [reviewId]);

      // Update post review statistics
      await this.updatePostReviewStats(postId);

      // Clear post cache
      await this.clearPostCache(postId);

      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Delete a review by post owner (with reason tracking)
   * @param {number} reviewId - Review ID
   * @param {number} postOwnerId - User ID of post owner
   * @param {string} deletionReason - Required reason for deletion
   * @returns {Object} Deleted review information
   */
  async deleteReviewByOwner(reviewId, postOwnerId, deletionReason) {
    try {
      // Verify the user is the post owner
      const ownershipCheck = await query(`
        SELECT p.id 
        FROM posts p
        JOIN reviews r ON p.id = r.post_id
        WHERE r.id = $1 AND p.user_id = $2
      `, [reviewId, postOwnerId]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('You can only delete reviews on your own posts');
      }

      // Get the review data before deletion
      const reviewData = await query(`
        SELECT * FROM reviews WHERE id = $1
      `, [reviewId]);

      if (reviewData.rows.length === 0) {
        throw new Error('Review not found');
      }

      const review = reviewData.rows[0];

      // Store the deleted review with reason
      const deletedReviewResult = await query(`
        INSERT INTO deleted_reviews (
          original_review_id, post_id, reviewer_id, rating, title, content,
          is_verified_customer, is_anonymous, deleted_by, deletion_reason,
          original_created_at, original_updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        review.id,
        review.post_id,
        review.reviewer_id,
        review.rating,
        review.title,
        review.content,
        review.is_verified_customer,
        review.is_anonymous,
        postOwnerId,
        deletionReason,
        review.created_at,
        review.updated_at
      ]);

      // Delete the original review
      await query('DELETE FROM reviews WHERE id = $1', [reviewId]);

      // Update post review statistics
      await this.updatePostReviewStats(review.post_id);

      // Clear post cache
      await this.clearPostCache(review.post_id);

      return deletedReviewResult.rows[0];
    } catch (error) {
      console.error('Error deleting review by owner:', error);
      throw error;
    }
  }

  /**
   * Get deleted reviews for a specific post
   * @param {number} postId - Post ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Reviews per page
   * @returns {Object} Deleted reviews with pagination
   */
  async getDeletedReviews(postId, options = {}) {
    const { page = 1, limit = 10 } = options;

    try {
      const offset = (page - 1) * limit;

      // Get deleted reviews with user information
      const result = await query(`
        SELECT 
          dr.id,
          dr.original_review_id,
          dr.rating,
          dr.title,
          dr.content,
          dr.is_anonymous,
          dr.deletion_reason,
          dr.deletion_timestamp,
          dr.original_created_at,
          dr.original_updated_at,
          CASE 
            WHEN dr.is_anonymous THEN 'Anonymous'
            ELSE u.display_name
          END as reviewer_name,
          CASE 
            WHEN dr.is_anonymous THEN NULL
            ELSE u.username
          END as reviewer_username,
          u2.display_name as deleted_by_name,
          u2.username as deleted_by_username
        FROM deleted_reviews dr
        LEFT JOIN users u ON dr.reviewer_id = u.id
        LEFT JOIN users u2 ON dr.deleted_by = u2.id
        WHERE dr.post_id = $1
        ORDER BY dr.deletion_timestamp DESC
        LIMIT $2 OFFSET $3
      `, [postId, limit, offset]);

      // Get total count
      const countResult = await query(`
        SELECT COUNT(*) as total FROM deleted_reviews WHERE post_id = $1
      `, [postId]);

      const total = parseInt(countResult.rows[0].total);

      return {
        deletedReviews: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting deleted reviews:', error);
      throw error;
    }
  }

  /**
   * Get deleted reviews summary for a post
   * @param {number} postId - Post ID
   * @returns {Object} Deleted reviews summary
   */
  async getDeletedReviewsSummary(postId) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_deleted,
          COUNT(CASE WHEN deleted_by IS NOT NULL THEN 1 END) as deleted_by_owner,
          COUNT(CASE WHEN deleted_by IS NULL THEN 1 END) as deleted_by_system,
          AVG(rating) as average_rating_before_deletion,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_deleted,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_deleted,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_deleted,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_deleted,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_deleted
        FROM deleted_reviews 
        WHERE post_id = $1
      `, [postId]);

      const summary = result.rows[0];

      // Calculate percentage distributions
      const total = parseInt(summary.total_deleted);
      if (total > 0) {
        summary.rating_distribution = {
          five_star: Math.round((summary.five_star_deleted / total) * 100),
          four_star: Math.round((summary.four_star_deleted / total) * 100),
          three_star: Math.round((summary.three_star_deleted / total) * 100),
          two_star: Math.round((summary.two_star_deleted / total) * 100),
          one_star: Math.round((summary.one_star_deleted / total) * 100)
        };
      } else {
        summary.rating_distribution = {
          five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0
        };
      }

      return summary;
    } catch (error) {
      console.error('Error getting deleted reviews summary:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific post
   * @param {number} postId - Post ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Reviews per page
   * @param {string} options.sortBy - Sort field (rating, created_at)
   * @param {string} options.sortOrder - Sort order (asc, desc)
   * @returns {Object} Reviews with pagination
   */
  async getPostReviews(postId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    try {
      const offset = (page - 1) * limit;

      // Validate sort parameters
      const allowedSortFields = ['rating', 'created_at'];
      const allowedSortOrders = ['asc', 'desc'];

      if (!allowedSortFields.includes(sortBy)) {
        sortBy = 'created_at';
      }
      if (!allowedSortOrders.includes(sortOrder)) {
        sortOrder = 'desc';
      }

      // Get reviews with user information
      const result = await query(`
        SELECT 
          r.id,
          r.rating,
          r.title,
          r.content,
          r.is_anonymous,
          r.created_at,
          r.updated_at,
          CASE 
            WHEN r.is_anonymous THEN 'Anonymous'
            ELSE u.display_name
          END as reviewer_name,
          CASE 
            WHEN r.is_anonymous THEN NULL
            ELSE u.username
          END as reviewer_username,
          CASE 
            WHEN r.is_anonymous THEN NULL
            ELSE u.profile_picture
          END as reviewer_picture,
          rr.content as response_content,
          rr.created_at as response_created_at,
          CASE 
            WHEN rr.id IS NOT NULL THEN u2.display_name
            ELSE NULL
          END as responder_name
        FROM reviews r
        LEFT JOIN users u ON r.reviewer_id = u.id
        LEFT JOIN review_responses rr ON r.id = rr.review_id
        LEFT JOIN users u2 ON rr.responder_id = u2.id
        WHERE r.post_id = $1
        ORDER BY r.${sortBy} ${sortOrder.toUpperCase()}
        LIMIT $2 OFFSET $3
      `, [postId, limit, offset]);

      // Get total count
      const countResult = await query(`
        SELECT COUNT(*) as total FROM reviews WHERE post_id = $1
      `, [postId]);

      const total = parseInt(countResult.rows[0].total);

      return {
        reviews: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting post reviews:', error);
      throw error;
    }
  }

  /**
   * Add a response to a review (for post owners)
   * @param {number} reviewId - Review ID
   * @param {number} responderId - User ID of responder (post owner)
   * @param {string} content - Response content
   * @returns {Object} Created response
   */
  async addReviewResponse(reviewId, responderId, content) {
    try {
      // Verify the responder is the post owner
      const ownershipCheck = await query(`
        SELECT p.id 
        FROM posts p
        JOIN reviews r ON p.id = r.post_id
        WHERE r.id = $1 AND p.user_id = $2
      `, [reviewId, responderId]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('You can only respond to reviews on your own posts');
      }

      // Check if response already exists
      const existingResponse = await query(`
        SELECT id FROM review_responses WHERE review_id = $1
      `, [reviewId]);

      if (existingResponse.rows.length > 0) {
        throw new Error('A response already exists for this review');
      }

      // Create the response
      const result = await query(`
        INSERT INTO review_responses (review_id, responder_id, content)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [reviewId, responderId, content]);

      return result.rows[0];
    } catch (error) {
      console.error('Error adding review response:', error);
      throw error;
    }
  }

  /**
   * Update review response
   * @param {number} responseId - Response ID
   * @param {number} responderId - User ID of responder (for ownership verification)
   * @param {string} content - New response content
   * @returns {Object} Updated response
   */
  async updateReviewResponse(responseId, responderId, content) {
    try {
      // Verify ownership
      const ownershipCheck = await query(`
        SELECT id FROM review_responses WHERE id = $1 AND responder_id = $2
      `, [responseId, responderId]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('Response not found or you do not have permission to edit it');
      }

      // Update the response
      const result = await query(`
        UPDATE review_responses 
        SET content = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [content, responseId]);

      return result.rows[0];
    } catch (error) {
      console.error('Error updating review response:', error);
      throw error;
    }
  }

  /**
   * Update post review statistics (review count, average rating, review score bonus)
   * @param {number} postId - Post ID
   */
  async updatePostReviewStats(postId) {
    try {
      // Calculate review statistics
      const statsResult = await query(`
        SELECT 
          COUNT(*) as review_count,
          AVG(rating) as average_rating,
          COUNT(*) * 0.5 as review_score_bonus
        FROM reviews 
        WHERE post_id = $1
      `, [postId]);

      const stats = statsResult.rows[0];

      // Update post with new statistics
      await query(`
        UPDATE posts 
        SET review_count = $1,
            average_rating = COALESCE($2, 0.00),
            review_score_bonus = $3
        WHERE id = $4
      `, [
        parseInt(stats.review_count),
        parseFloat(stats.average_rating) || 0.00,
        parseFloat(stats.review_score_bonus) || 0.00,
        postId
      ]);

      return stats;
    } catch (error) {
      console.error('Error updating post review stats:', error);
      throw error;
    }
  }

  /**
   * Get review summary for a post
   * @param {number} postId - Post ID
   * @returns {Object} Review summary
   */
  async getReviewSummary(postId) {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
        FROM reviews 
        WHERE post_id = $1
      `, [postId]);

      const summary = result.rows[0];

      // Calculate percentage distributions
      const total = parseInt(summary.total_reviews);
      if (total > 0) {
        summary.rating_distribution = {
          five_star: Math.round((summary.five_star_count / total) * 100),
          four_star: Math.round((summary.four_star_count / total) * 100),
          three_star: Math.round((summary.three_star_count / total) * 100),
          two_star: Math.round((summary.two_star_count / total) * 100),
          one_star: Math.round((summary.one_star_count / total) * 100)
        };
      } else {
        summary.rating_distribution = {
          five_star: 0, four_star: 0, three_star: 0, two_star: 0, one_star: 0
        };
      }

      return summary;
    } catch (error) {
      console.error('Error getting review summary:', error);
      throw error;
    }
  }

  /**
   * Clear post cache when reviews change
   * @param {number} postId - Post ID
   */
  async clearPostCache(postId) {
    try {
      const cacheKey = generateCacheKey('post', postId);
      await redisDel(cacheKey);
    } catch (error) {
      console.error('Error clearing post cache:', error);
    }
  }

  /**
   * Verify if a user is a verified customer (has had a conversation about the post)
   * @param {number} postId - Post ID
   * @param {number} userId - User ID
   * @returns {boolean} Whether user is a verified customer
   */
  async verifyCustomerStatus(postId, userId) {
    try {
      const result = await query(`
        SELECT 1 
        FROM conversations 
        WHERE post_id = $1 AND (user1_id = $2 OR user2_id = $2)
        LIMIT 1
      `, [postId, userId]);

      return result.rows.length > 0;
    } catch (error) {
      console.error('Error verifying customer status:', error);
      return false;
    }
  }

  /**
   * Mark a review as verified customer
   * @param {number} reviewId - Review ID
   * @param {number} postOwnerId - Post owner ID (for verification)
   * @returns {boolean} Success status
   */
  async markReviewAsVerified(reviewId, postOwnerId) {
    try {
      // Verify the user is the post owner
      const ownershipCheck = await query(`
        SELECT p.id 
        FROM posts p
        JOIN reviews r ON p.id = r.post_id
        WHERE r.id = $1 AND p.user_id = $2
      `, [reviewId, postOwnerId]);

      if (ownershipCheck.rows.length === 0) {
        throw new Error('You can only verify reviews on your own posts');
      }

      // Mark review as verified
      await query(`
        UPDATE reviews 
        SET is_verified_customer = true
        WHERE id = $1
      `, [reviewId]);

      return true;
    } catch (error) {
      console.error('Error marking review as verified:', error);
      throw error;
    }
  }

  /**
   * Get reviews written by a specific user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Reviews per page
   * @returns {Object} Reviews with pagination
   */
  async getUserReviews(userId, options = {}) {
    const { page = 1, limit = 10 } = options;

    try {
      const offset = (page - 1) * limit;

      // Get user's reviews with post information
      const result = await query(`
        SELECT 
          r.id,
          r.rating,
          r.title,
          r.content,
          r.is_anonymous,
          r.is_verified_customer,
          r.created_at,
          p.id as post_id,
          p.title as post_title,
          p.post_type,
          p.duration_type
        FROM reviews r
        JOIN posts p ON r.post_id = p.id
        WHERE r.reviewer_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await query(`
        SELECT COUNT(*) as total FROM reviews WHERE reviewer_id = $1
      `, [userId]);

      const total = parseInt(countResult.rows[0].total);

      return {
        reviews: result.rows,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user reviews:', error);
      throw error;
    }
  }
}

module.exports = new ReviewService(); 