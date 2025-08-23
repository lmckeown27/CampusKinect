const { query } = require('../config/database');
const { updatePostScores } = require('./scoringService');

/**
 * Engagement Service
 * Manages post interactions and calculates engagement scores
 */

// Interaction types
const INTERACTION_TYPES = {
  MESSAGE: 'message',
  SHARE: 'share',
  BOOKMARK: 'bookmark',
  REPOST: 'repost'
};

// Weight multipliers for different interactions
const INTERACTION_WEIGHTS = {
  [INTERACTION_TYPES.MESSAGE]: 4.0,    // Messages get the most points (direct interest)
  [INTERACTION_TYPES.REPOST]: 3.0,     // Reposts get second most points (community value)
  [INTERACTION_TYPES.SHARE]: 2.0,      // Shares get third most points (basic interest)
  [INTERACTION_TYPES.BOOKMARK]: 1.0    // Bookmarks get least points (personal interest)
};

/**
 * Record a user interaction with a post
 */
const recordInteraction = async (postId, userId, interactionType) => {
  try {
    // Check if interaction already exists
    const existing = await query(`
      SELECT id FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3
    `, [postId, userId, interactionType]);

    if (existing.rows.length > 0) {
      // Interaction already exists, don't duplicate
      return { success: false, message: 'Interaction already recorded' };
    }

    // Record new interaction
    await query(`
      INSERT INTO post_interactions (post_id, user_id, interaction_type)
      VALUES ($1, $2, $3)
    `, [postId, userId, interactionType]);

    // Update post counts and recalculate engagement score
    await updatePostEngagement(postId);
    
    // Update post scores (base, urgency, final)
    await updatePostScores(postId);

    console.log(`✅ Recorded ${interactionType} interaction for post ${postId} by user ${userId}`);
    return { success: true, message: 'Interaction recorded successfully' };

  } catch (error) {
    console.error('Error recording interaction:', error);
    throw error;
  }
};

/**
 * Remove a user interaction with a post
 */
const removeInteraction = async (postId, userId, interactionType) => {
  try {
    // Remove interaction
    const result = await query(`
      DELETE FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3
    `, [postId, userId, interactionType]);

    if (result.rowCount > 0) {
      // Update post counts and recalculate engagement score
      await updatePostEngagement(postId);
      
      // Update post scores (base, urgency, final)
      await updatePostScores(postId);
      
      console.log(`✅ Removed ${interactionType} interaction for post ${postId} by user ${userId}`);
      return { success: true, message: 'Interaction removed successfully' };
    }

    return { success: false, message: 'Interaction not found' };

  } catch (error) {
    console.error('Error removing interaction:', error);
    throw error;
  }
};

/**
 * Update post engagement counts and score
 */
const updatePostEngagement = async (postId) => {
  try {
    // Get current interaction counts
    const counts = await query(`
      SELECT 
        interaction_type,
        COUNT(*) as count
      FROM post_interactions 
      WHERE post_id = $1
      GROUP BY interaction_type
    `, [postId]);

    // Initialize counts
    const interactionCounts = {
      message: 0,
      share: 0,
      bookmark: 0,
      repost: 0
    };

    // Populate counts from query results
    counts.rows.forEach(row => {
      interactionCounts[row.interaction_type] = parseInt(row.count);
    });

    // Calculate weighted engagement score
    let engagementScore = 0;
    Object.keys(interactionCounts).forEach(type => {
      engagementScore += interactionCounts[type] * INTERACTION_WEIGHTS[type];
    });

    // Update post with new counts and score
    await query(`
      UPDATE posts 
      SET 
        message_count = $1,
        share_count = $2,
        bookmark_count = $3,
        repost_count = $4,
        engagement_score = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `, [
      interactionCounts.message,
      interactionCounts.share,
      interactionCounts.bookmark,
      interactionCounts.repost,
      engagementScore,
      postId
    ]);

    console.log(`✅ Updated engagement for post ${postId}: score ${engagementScore.toFixed(2)}`);

  } catch (error) {
    console.error('Error updating post engagement:', error);
    throw error;
  }
};

/**
 * Get engagement statistics for a post
 */
const getPostEngagement = async (postId) => {
  try {
    const result = await query(`
      SELECT 
        message_count,
        share_count,
        bookmark_count,
        repost_count,
        engagement_score
      FROM posts 
      WHERE id = $1
    `, [postId]);

    if (result.rows.length === 0) {
      throw new Error('Post not found');
    }

    return result.rows[0];

  } catch (error) {
    console.error('Error getting post engagement:', error);
    throw error;
  }
};

/**
 * Get user interactions with a post
 */
const getUserInteractions = async (postId, userId) => {
  try {
    const result = await query(`
      SELECT interaction_type
      FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2
    `, [postId, userId]);

    return result.rows.map(row => row.interaction_type);

  } catch (error) {
    console.error('Error getting user interactions:', error);
    throw error;
  }
};

/**
 * Calculate engagement-based priority for feed organization
 */
const calculateEngagementPriority = (post) => {
  let priority = 0;
  
  // Base priority by duration type
  if (post.duration_type === 'recurring') {
    priority += 10;
  } else if (post.duration_type === 'event') {
    priority += 8;
  } else {
    priority += 5;
  }

  // Engagement boost (can make low-engagement recurring posts fall below one-time posts)
  const engagementBoost = Math.min(post.engagement_score * 0.5, 20); // Max 20 point boost
  priority += engagementBoost;

  // Age penalty for recurring posts (older = less priority)
  if (post.duration_type === 'recurring') {
    const daysOld = (Date.now() - new Date(post.created_at)) / (1000 * 60 * 60 * 24);
    const agePenalty = Math.min(daysOld * 0.1, 5); // Max 5 point penalty
    priority -= agePenalty;
  }

  return priority;
};

/**
 * Get posts organized by engagement priority
 */
const getEngagementOrganizedPosts = async (limit = 20, offset = 0) => {
  try {
    const result = await query(`
      SELECT 
        p.*,
        u.username,
        u.first_name,
        u.last_name,
        u.display_name,
        u.profile_picture,
        un.name as university_name,
        un.city as university_city,
        un.state as university_state
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      WHERE p.is_active = true AND p.university_id = $1
      ORDER BY 
        CASE 
          WHEN p.duration_type = 'recurring' AND p.engagement_score >= 5.0 THEN 0
          WHEN p.duration_type = 'event' THEN 1
          WHEN p.duration_type = 'recurring' AND p.engagement_score < 5.0 THEN 2
          ELSE 3
        END,
        p.engagement_score DESC,
        p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [process.env.UNIVERSITY_ID || 11, limit, offset]);

    return result.rows;

  } catch (error) {
    console.error('Error getting engagement organized posts:', error);
    throw error;
  }
};

module.exports = {
  INTERACTION_TYPES,
  INTERACTION_WEIGHTS,
  recordInteraction,
  removeInteraction,
  updatePostEngagement,
  getPostEngagement,
  getUserInteractions,
  calculateEngagementPriority,
  getEngagementOrganizedPosts
}; 