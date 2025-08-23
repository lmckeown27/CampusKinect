const { query } = require('../config/database');

/**
 * Smart Scoring Service
 * Calculates base scores, time urgency bonuses, and final scores for posts
 */

// Base score constants - all posts start equal
const BASE_SCORES = {
  ONE_TIME: 5.0,         // All posts start with same base score
  EVENT: 5.0,            // All posts start with same base score
  RECURRING: 5.0         // All posts start with same base score
};

// Time urgency bonus multipliers (no longer used - focus on engagement)
const TIME_URGENCY_MULTIPLIERS = {
  EXPIRES_SOON: 0,        // No time bonuses
  EXPIRES_TODAY: 0,       // No time bonuses
  EXPIRES_WEEK: 0,        // No time bonuses
  NO_EXPIRATION: 0        // No time bonuses
};

// Score range constants - all posts have same range
const SCORE_RANGES = {
  ONE_TIME: {
    MIN: 0.0,    // Can go down to 0 with no engagement
    MAX: 20.0    // Can go up to 20 with high engagement
  },
  EVENT: {
    MIN: 0.0,    // Can go down to 0 with no engagement
    MAX: 20.0    // Can go up to 20 with high engagement
  },
  RECURRING: {
    MIN: 0.0,    // Can go down to 0 with no engagement
    MAX: 20.0    // Can go up to 20 with high engagement
  }
};

// Engagement score thresholds
const ENGAGEMENT_DECAY = {
  POSITIVE_THRESHOLD: 5.0,   // Score above this gets engagement boost
  NEGATIVE_THRESHOLD: 2.0,   // Score below this gets engagement penalty
  DECAY_RATE: 0.1,           // Daily decay rate for low engagement
  BOOST_RATE: 0.05           // Daily boost rate for high engagement
};

/**
 * Calculate base score for a new post
 */
const calculateBaseScore = (postData) => {
  // All posts start with the same base score - no arbitrary bonuses
  return BASE_SCORES.ONE_TIME; // 5.0 for all post types
};

/**
 * Calculate time urgency bonus
 */
const calculateTimeUrgencyBonus = (postData) => {
  // No time urgency bonuses - focus purely on engagement
  return 0;
};

/**
 * Calculate engagement impact on score
 */
const calculateEngagementImpact = (currentScore, engagementScore, daysSinceCreation) => {
  let impact = 0;

  if (engagementScore >= ENGAGEMENT_DECAY.POSITIVE_THRESHOLD) {
    // High engagement = positive impact
    impact = engagementScore * ENGAGEMENT_DECAY.BOOST_RATE * daysSinceCreation;
  } else if (engagementScore <= ENGAGEMENT_DECAY.NEGATIVE_THRESHOLD) {
    // Low engagement = negative impact (decay)
    impact = -(ENGAGEMENT_DECAY.DECAY_RATE * daysSinceCreation);
  }

  return Math.round(impact * 100) / 100;
};

/**
 * Calculate final score for a post - purely based on engagement
 */
const calculateFinalScore = (postData) => {
  const baseScore = postData.base_score || calculateBaseScore(postData);
  
  // Calculate days since creation for engagement impact
  const createdAt = new Date(postData.created_at);
  const now = new Date();
  const daysSinceCreation = Math.max((now - createdAt) / (1000 * 60 * 60 * 24), 0);
  
  // Engagement impact (can be positive or negative)
  const engagementImpact = calculateEngagementImpact(
    baseScore, 
    postData.engagement_score || 0, 
    daysSinceCreation
  );

  // Final score calculation - base + engagement only
  let finalScore = baseScore + engagementImpact;

  // Apply universal range limits (0-20 for all post types)
  finalScore = Math.max(0, Math.min(20, finalScore));

  return Math.round(finalScore * 100) / 100;
};

/**
 * Update post scores (base, time urgency, and final)
 */
const updatePostScores = async (postId) => {
  try {
    // Get post data
    const result = await query(`
      SELECT 
        p.*,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM posts p
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = $1
      GROUP BY p.id
    `, [postId]);

    if (result.rows.length === 0) {
      throw new Error('Post not found');
    }

    const post = result.rows[0];

    // Calculate scores
    const baseScore = calculateBaseScore(post);
    const timeUrgencyBonus = calculateTimeUrgencyBonus(post);
    const finalScore = calculateFinalScore({
      ...post,
      base_score: baseScore,
      time_urgency_bonus: timeUrgencyBonus
    });

    // Update post with new scores
    await query(`
      UPDATE posts 
      SET 
        base_score = $1,
        time_urgency_bonus = $2,
        final_score = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [baseScore, timeUrgencyBonus, finalScore, postId]);

    console.log(`✅ Updated scores for post ${postId}: base=${baseScore}, urgency=${timeUrgencyBonus}, final=${finalScore}`);

    return { baseScore, timeUrgencyBonus, finalScore };

  } catch (error) {
    console.error('Error updating post scores:', error);
    throw error;
  }
};

/**
 * Get posts organized by final score (smart feed)
 */
const getScoreOrganizedPosts = async (limit = 20, offset = 0) => {
  try {
    const result = await query(`
      SELECT 
        p.id,
        p.user_id,
        p.university_id,
        p.title,
        p.description,
        p.post_type,
        p.duration_type,
        p.repost_frequency,
        p.original_post_id,
        p.message_count,
        p.share_count,
        p.bookmark_count,
        p.repost_count,
        p.engagement_score,
        p.base_score,
        p.time_urgency_bonus,
        p.final_score,
        p.expires_at,
        p.event_start,
        p.event_end,
        p.is_fulfilled,
        p.is_active,
        p.view_count,
        p.created_at,
        p.updated_at,
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
        p.final_score DESC,
        p.time_urgency_bonus DESC,
        p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [process.env.UNIVERSITY_ID || 11, limit, offset]);

    return result.rows;

  } catch (error) {
    console.error('Error getting score organized posts:', error);
    throw error;
  }
};

/**
 * Recalculate scores for all posts (maintenance function)
 */
const recalculateAllScores = async () => {
  try {
    console.log('🔄 Starting score recalculation for all posts...');
    
    const posts = await query(`
      SELECT id FROM posts WHERE is_active = true
    `);

    let updated = 0;
    for (const post of posts.rows) {
      await updatePostScores(post.id);
      updated++;
    }

    console.log(`✅ Score recalculation complete. Updated ${updated} posts.`);
    return updated;

  } catch (error) {
    console.error('Error recalculating all scores:', error);
    throw error;
  }
};

/**
 * Get scoring statistics for dashboard
 */
const getScoringStats = async () => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_posts,
        AVG(base_score) as avg_base_score,
        AVG(time_urgency_bonus) as avg_urgency_bonus,
        AVG(final_score) as avg_final_score,
        AVG(engagement_score) as avg_engagement_score,
        MIN(final_score) as min_score,
        MAX(final_score) as max_score
      FROM posts 
      WHERE is_active = true
    `);

    return result.rows[0];

  } catch (error) {
    console.error('Error getting scoring stats:', error);
    throw error;
  }
};

module.exports = {
  BASE_SCORES,
  TIME_URGENCY_MULTIPLIERS,
  SCORE_RANGES,
  calculateBaseScore,
  calculateTimeUrgencyBonus,
  calculateEngagementImpact,
  calculateFinalScore,
  updatePostScores,
  getScoreOrganizedPosts,
  recalculateAllScores,
  getScoringStats
}; 