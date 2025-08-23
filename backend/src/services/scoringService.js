const { query } = require('../config/database');

/**
 * Smart Scoring Service
 * Calculates base scores, time urgency bonuses, and final scores for posts
 */

// Base score constants
const BASE_SCORES = {
  ONE_TIME: 10.0,        // One-time posts get moderate base score (urgency but limited range)
  EVENT: 7.0,            // Event posts get moderate base score (time-sensitive)
  RECURRING: 5.0         // Recurring posts get lowest base score (no urgency, wide range)
};

// Time urgency bonus multipliers
const TIME_URGENCY_MULTIPLIERS = {
  EXPIRES_SOON: 1.5,     // Posts expiring within 24 hours
  EXPIRES_TODAY: 2.0,    // Posts expiring today
  EXPIRES_WEEK: 1.3,     // Posts expiring within a week
  NO_EXPIRATION: 0.8     // Posts with no expiration (recurring)
};

// Score range constants for each post type
const SCORE_RANGES = {
  ONE_TIME: {
    MIN: 8.0,    // Low engagement can bring down to 8
    MAX: 12.0    // High engagement can bring up to 12
  },
  EVENT: {
    MIN: 2.0,    // Low engagement can bring down to 2
    MAX: 13.0    // High engagement can bring up to 13
  },
  RECURRING: {
    MIN: 0.0,    // Low engagement can bring down to 0
    MAX: 15.0    // High engagement can bring up to 15
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
  let baseScore = 0;

  // Duration type base score
  switch (postData.durationType) {
    case 'one-time':
      baseScore = BASE_SCORES.ONE_TIME;
      break;
    case 'event':
      baseScore = BASE_SCORES.EVENT;
      break;
    case 'recurring':
      baseScore = BASE_SCORES.RECURRING;
      break;
    default:
      baseScore = BASE_SCORES.ONE_TIME;
  }

  // Post type bonus (offers and requests are more valuable than general posts)
  if (postData.postType === 'offer' || postData.postType === 'request') {
    baseScore += 5.0;
  }

  // Tag bonus (posts with relevant tags get slight boost)
  if (postData.tags && postData.tags.length > 0) {
    baseScore += Math.min(postData.tags.length * 0.5, 3.0);
  }

  return Math.round(baseScore * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate time urgency bonus
 */
const calculateTimeUrgencyBonus = (postData) => {
  let urgencyBonus = 0;
  const now = new Date();

  if (postData.expiresAt) {
    const expiresAt = new Date(postData.expiresAt);
    const timeUntilExpiry = expiresAt - now;
    const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);

    if (hoursUntilExpiry <= 0) {
      // Already expired
      urgencyBonus = 0;
    } else if (hoursUntilExpiry <= 24) {
      // Expires within 24 hours
      urgencyBonus = BASE_SCORES.ONE_TIME * TIME_URGENCY_MULTIPLIERS.EXPIRES_SOON;
    } else if (hoursUntilExpiry <= 168) { // 7 days
      // Expires within a week
      urgencyBonus = BASE_SCORES.ONE_TIME * TIME_URGENCY_MULTIPLIERS.EXPIRES_WEEK;
    }
  } else if (postData.eventStart && postData.eventEnd) {
    // Event posts get urgency based on how soon they start
    const eventStart = new Date(postData.eventStart);
    const timeUntilEvent = eventStart - now;
    const daysUntilEvent = timeUntilEvent / (1000 * 60 * 60 * 24);

    if (daysUntilEvent <= 1) {
      // Event is today or tomorrow
      urgencyBonus = BASE_SCORES.EVENT * TIME_URGENCY_MULTIPLIERS.EXPIRES_TODAY;
    } else if (daysUntilEvent <= 7) {
      // Event is within a week
      urgencyBonus = BASE_SCORES.EVENT * TIME_URGENCY_MULTIPLIERS.EXPIRES_WEEK;
    }
  } else if (postData.durationType === 'recurring') {
    // Recurring posts get no urgency bonus (they're always available)
    urgencyBonus = 0;
  }

  return Math.round(urgencyBonus * 100) / 100;
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
 * Calculate final score for a post with type-specific range limits
 */
const calculateFinalScore = (postData) => {
  const baseScore = postData.base_score || calculateBaseScore(postData);
  const timeUrgencyBonus = postData.time_urgency_bonus || calculateTimeUrgencyBonus(postData);
  
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

  // Final score calculation
  let finalScore = baseScore + timeUrgencyBonus + engagementImpact;

  // Apply type-specific range limits
  const postType = postData.duration_type || 'one-time';
  const ranges = SCORE_RANGES[postType.toUpperCase()] || SCORE_RANGES.ONE_TIME;
  
  // Clamp score within the allowed range for this post type
  finalScore = Math.max(ranges.MIN, Math.min(ranges.MAX, finalScore));

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