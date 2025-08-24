const { query } = require('../config/database');
const { updatePostScores } = require('./scoringService');

/**
 * Engagement Service
 * Manages post interactions and calculates engagement scores
 */

// Interaction types and their weights
const INTERACTION_TYPES = { 
  MESSAGE: 'message', 
  SHARE: 'share', 
  BOOKMARK: 'bookmark', 
  REPOST: 'repost' 
};

const INTERACTION_WEIGHTS = {
  [INTERACTION_TYPES.MESSAGE]: 4.0,    // Messages get the most points
  [INTERACTION_TYPES.REPOST]: 3.0,     // Reposts get second most points
  [INTERACTION_TYPES.SHARE]: 2.0,      // Shares get third most points
  [INTERACTION_TYPES.BOOKMARK]: 1.0    // Bookmarks get least points
};

/**
 * Record a user interaction with a post
 * Updates engagement counts and triggers score recalculation
 */
const recordInteraction = async (postId, userId, interactionType) => {
  try {
    // Check if interaction already exists
    const existingInteraction = await query(`
      SELECT id FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3
    `, [postId, userId, interactionType]);

    if (existingInteraction.rows.length > 0) {
      throw new Error('Interaction already exists');
    }

    // Record the interaction
    await query(`
      INSERT INTO post_interactions (post_id, user_id, interaction_type, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [postId, userId, interactionType]);

    // Update post engagement counts
    await updatePostEngagement(postId);
    
    // Recalculate post scores and feed positioning
    await updatePostScores(postId);

    console.log(`✅ Recorded ${interactionType} interaction for post ${postId} by user ${userId}`);
    
    return {
      success: true,
      interactionType,
      postId,
      userId,
      message: `${interactionType} interaction recorded successfully`
    };

  } catch (error) {
    console.error(`❌ Failed to record ${interactionType} interaction:`, error);
    throw error;
  }
};

/**
 * Remove a user interaction with a post
 * Updates engagement counts and triggers score recalculation
 */
const removeInteraction = async (postId, userId, interactionType) => {
  try {
    // Check if interaction exists
    const existingInteraction = await query(`
      SELECT id FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3
    `, [postId, userId, interactionType]);

    if (existingInteraction.rows.length === 0) {
      throw new Error('Interaction does not exist');
    }

    // Remove the interaction
    await query(`
      DELETE FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2 AND interaction_type = $3
    `, [postId, userId, interactionType]);

    // Update post engagement counts
    await updatePostEngagement(postId);
    
    // Recalculate post scores and feed positioning
    await updatePostScores(postId);

    console.log(`✅ Removed ${interactionType} interaction for post ${postId} by user ${userId}`);
    
    return {
      success: true,
      interactionType,
      postId,
      userId,
      message: `${interactionType} interaction removed successfully`
    };

  } catch (error) {
    console.error(`❌ Failed to remove ${interactionType} interaction:`, error);
    throw error;
  }
};

/**
 * Update engagement counts for a post based on current interactions
 */
const updatePostEngagement = async (postId) => {
  try {
    // Get current interaction counts
    const result = await query(`
      SELECT 
        interaction_type,
        COUNT(*) as count
      FROM post_interactions 
      WHERE post_id = $1
      GROUP BY interaction_type
    `, [postId]);

    // Initialize counts
    let messageCount = 0;
    let shareCount = 0;
    let bookmarkCount = 0;
    let repostCount = 0;

    // Calculate counts from results
    result.rows.forEach(row => {
      switch (row.interaction_type) {
        case 'message':
          messageCount = parseInt(row.count);
          break;
        case 'share':
          shareCount = parseInt(row.count);
          break;
        case 'bookmark':
          bookmarkCount = parseInt(row.count);
          break;
        case 'repost':
          repostCount = parseInt(row.count);
          break;
      }
    });

    // Calculate engagement score
    const engagementScore = (
      messageCount * INTERACTION_WEIGHTS[INTERACTION_TYPES.MESSAGE] +
      repostCount * INTERACTION_WEIGHTS[INTERACTION_TYPES.REPOST] +
      shareCount * INTERACTION_WEIGHTS[INTERACTION_TYPES.SHARE] +
      bookmarkCount * INTERACTION_WEIGHTS[INTERACTION_TYPES.BOOKMARK]
    );

    // Update post with new engagement data
    await query(`
      UPDATE posts 
      SET 
        message_count = $1,
        share_count = $2,
        bookmark_count = $3,
        repost_count = $4,
        engagement_score = $5,
        updated_at = NOW()
      WHERE id = $6
    `, [messageCount, shareCount, bookmarkCount, repostCount, engagementScore, postId]);

    console.log(`✅ Updated engagement for post ${postId}: messages=${messageCount}, shares=${shareCount}, bookmarks=${bookmarkCount}, reposts=${repostCount}, score=${engagementScore}`);

    return {
      messageCount,
      shareCount,
      bookmarkCount,
      repostCount,
      engagementScore
    };

  } catch (error) {
    console.error('❌ Failed to update post engagement:', error);
    throw error;
  }
};

/**
 * Get engagement statistics for a specific post
 */
const getPostEngagement = async (postId) => {
  try {
    const result = await query(`
      SELECT 
        p.message_count,
        p.share_count,
        p.bookmark_count,
        p.repost_count,
        p.engagement_score,
        p.final_score,
        COUNT(pi.id) as total_interactions
      FROM posts p
      LEFT JOIN post_interactions pi ON p.id = pi.post_id
      WHERE p.id = $1
      GROUP BY p.id, p.message_count, p.share_count, p.bookmark_count, p.repost_count, p.engagement_score, p.final_score
    `, [postId]);

    if (result.rows.length === 0) {
      throw new Error('Post not found');
    }

    const post = result.rows[0];
    
    return {
      postId,
      engagement: {
        messageCount: post.message_count || 0,
        shareCount: post.share_count || 0,
        bookmarkCount: post.bookmark_count || 0,
        repostCount: post.repost_count || 0,
        engagementScore: parseFloat(post.engagement_score || 0).toFixed(2),
        totalInteractions: parseInt(post.total_interactions || 0)
      },
      scoring: {
        finalScore: parseFloat(post.final_score || 0).toFixed(2)
      }
    };

  } catch (error) {
    console.error('❌ Failed to get post engagement:', error);
    throw error;
  }
};

/**
 * Get all interactions for a specific user on a specific post
 */
const getUserInteractions = async (postId, userId) => {
  try {
    const result = await query(`
      SELECT interaction_type, created_at
      FROM post_interactions 
      WHERE post_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `, [postId, userId]);

    return result.rows.map(row => ({
      type: row.interaction_type,
      createdAt: row.created_at
    }));

  } catch (error) {
    console.error('❌ Failed to get user interactions:', error);
    throw error;
  }
};

/**
 * Get engagement analytics for dashboard
 */
const getEngagementAnalytics = async () => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_posts,
        AVG(engagement_score) as avg_engagement,
        SUM(message_count) as total_messages,
        SUM(share_count) as total_shares,
        SUM(bookmark_count) as total_bookmarks,
        SUM(repost_count) as total_reposts,
        COUNT(CASE WHEN engagement_score >= 10 THEN 1 END) as high_engagement_posts,
        COUNT(CASE WHEN engagement_score <= 2 THEN 1 END) as low_engagement_posts
      FROM posts
      WHERE university_id = 1
    `);

    const stats = result.rows[0];
    
    return {
      totalPosts: parseInt(stats.total_posts || 0),
      averageEngagement: parseFloat(stats.avg_engagement || 0).toFixed(2),
      totalInteractions: {
        messages: parseInt(stats.total_messages || 0),
        shares: parseInt(stats.total_shares || 0),
        bookmarks: parseInt(stats.total_bookmarks || 0),
        reposts: parseInt(stats.total_reposts || 0)
      },
      engagementDistribution: {
        high: parseInt(stats.high_engagement_posts || 0),
        low: parseInt(stats.low_engagement_posts || 0)
      }
    };

  } catch (error) {
    console.error('❌ Failed to get engagement analytics:', error);
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
  getEngagementAnalytics,
  calculateEngagementPriority,
  getEngagementOrganizedPosts
}; 