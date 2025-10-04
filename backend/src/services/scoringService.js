const { query } = require('../config/database');
const interactionWeightingService = require('./interactionWeightingService');
const multiUniversityScoringService = require('./multiUniversityScoringService');

// Updated scoring constants for 0-50 scale with 25 base points
const BASE_SCORES = {
  ONE_TIME: 25.0,
  EVENT: 25.0,
  RECURRING: 25.0
};

const TIME_URGENCY_MULTIPLIERS = {
  ONE_TIME: 0,
  EVENT: 0,
  RECURRING: 0
};

const SCORE_RANGES = {
  ONE_TIME: { MIN: 0.0, MAX: 50.0 },
  EVENT: { MIN: 0.0, MAX: 50.0 },
  RECURRING: { MIN: 0.0, MAX: 50.0 }
};

const ENGAGEMENT_DECAY = {
  ZERO_INTERACTION_PENALTY_PERCENTAGE: 0.04, // 4% daily penalty for zero interaction
  MAX_DAILY_DECAY_PERCENTAGE: 0.16, // Maximum 16% daily decay (4% × 4 days)
  DECAY_FACTOR: 0.1 // Percentage-based decay
};

const NEW_POST_BOOST = {
  BOOST_SCORE: 50.0, // Maximum score for new posts (updated for 0-50 scale)
  BOOST_DURATION_HOURS: 24
};

const REPOST_BOOST = {
  BASE_MULTIPLIER: 1.5,    // Base multiplier for posts with reposts
  PER_REPOST_BONUS: 0.3,   // Additional bonus per repost (diminishing returns)
  MAX_REPOST_BONUS: 10.0,  // Maximum additional points from reposts
  RECENT_REPOST_HOURS: 72  // Reposts within this timeframe get extra weight
};

// Calculate base score (now always 25.0)
const calculateBaseScore = (postData) => {
  return 25.0; // All posts start with 25 points
};

// Calculate time urgency bonus (now always 0)
const calculateTimeUrgencyBonus = (postData) => {
  return 0.0; // No time-based bonuses
};

// Calculate engagement impact on score with time weighting
const calculateEngagementImpact = (baseScore, engagementScore, daysSinceCreation) => {
  // Engagement can add up to 100% of base score (25 points = 100% of 25 base)
  const maxEngagementPercentage = 1.0; // 100%
  
  // Apply time-weighted engagement scoring
  // Recent engagement (last 7 days) gets full weight
  // Older engagement gets progressively reduced weight
  const timeWeight = calculateTimeWeight(daysSinceCreation);
  
  // Calculate engagement as a percentage of base score
  let engagementPercentage = Math.min(engagementScore / baseScore, maxEngagementPercentage);
  engagementPercentage *= timeWeight;
  
  // Convert percentage to points (25 base × percentage)
  const engagementImpact = baseScore * engagementPercentage;
  
  return Math.round(engagementImpact * 100) / 100;
};

// Calculate time weight for engagement scoring - MARKETPLACE SYSTEM
// Focus on content relevance and quality, not user popularity
// Fulfilled posts are permanently deleted, so no fulfillment status needed
const calculateTimeWeight = (daysSinceCreation, sustainedEngagementLevel = 'low') => {
  let baseWeight;
  
  if (daysSinceCreation <= 1) {
    // Posts 1 day old or newer get full weight (100%) - NEW POST BOOST
    baseWeight = 1.0;
  } else if (daysSinceCreation <= 7) {
    // Posts 2-7 days old get 90% weight - GRACE PERIOD
    baseWeight = 0.9;
  } else if (daysSinceCreation <= 30) {
    // Posts 8-30 days old get 80% weight - MUST MAINTAIN ENGAGEMENT
    baseWeight = 0.8;
  } else if (daysSinceCreation <= 90) {
    // Posts 31-90 days old get 70% weight - HIGHER ENGAGEMENT REQUIREMENTS
    baseWeight = 0.7;
  } else if (daysSinceCreation <= 180) {
    // Posts 91-180 days old get 60% weight - VERY HIGH ENGAGEMENT REQUIREMENTS
    baseWeight = 0.6;
  } else if (daysSinceCreation <= 365) {
    // Posts 181-365 days old get 50% weight - EXCEPTIONAL ENGAGEMENT REQUIRED
    baseWeight = 0.5;
  } else {
    // Posts older than 365 days get 40% weight - ONLY TOP PERFORMERS
    baseWeight = 0.4;
  }
  
  // Apply sustained engagement bonus (rewards content quality, not user popularity)
  const sustainedBonus = calculateSustainedEngagementBonus(daysSinceCreation, sustainedEngagementLevel);
  
  // Final weight: Base weight + sustained bonus (can exceed 1.0 for exceptional content)
  return Math.max(0.1, baseWeight + sustainedBonus);
};

// Calculate sustained engagement bonus for posts that maintain high interest over time
// For marketplace: rewards content quality and relevance, not user popularity
const calculateSustainedEngagementBonus = (daysSinceCreation, sustainedEngagementLevel) => {
  if (daysSinceCreation < 7) {
    // Need at least 7 days to establish sustained pattern
    return 0;
  }
  
  // Bonus multipliers based purely on content engagement quality
  // Higher bonuses to help quality content remain discoverable until fulfilled
  const bonusMultipliers = {
    'exceptional': 1.0,  // +100% bonus for exceptional content (was +120%)
    'high': 0.7,         // +70% bonus for high-quality content (was +90%)
    'moderate': 0.5,     // +50% bonus for moderate-quality content (was +60%)
    'low': 0.0           // No bonus for low-quality content
  };
  
  return bonusMultipliers[sustainedEngagementLevel] || 0;
};

// Determine sustained engagement level based purely on content performance
// For marketplace: recognizes content quality and relevance, not user popularity
const determineSustainedEngagementLevel = (recentEngagement, historicalEngagement, daysSinceCreation, engagementThreshold = 1.0) => {
  if (daysSinceCreation < 7) {
    return 'low'; // Need at least 7 days to determine content engagement pattern
  }
  
  // Calculate engagement ratio (recent vs. historical)
  const totalEngagement = recentEngagement + historicalEngagement;
  if (totalEngagement === 0) {
    return 'low';
  }
  
  const recentRatio = recentEngagement / totalEngagement;
  const historicalRatio = historicalEngagement / totalEngagement;
  
  // Calculate engagement velocity (engagement per day) with context-aware threshold
  const engagementVelocity = totalEngagement / daysSinceCreation;
  const adjustedThreshold = engagementThreshold;
  
  // Balanced thresholds for marketplace: content quality over user popularity
  if (engagementVelocity >= (1.6 * adjustedThreshold) && historicalRatio >= 0.5) {
    // High velocity + balanced engagement = exceptional content quality
    return 'exceptional';
  } else if (engagementVelocity >= (1.3 * adjustedThreshold) && historicalRatio >= 0.4) {
    // Good velocity + some historical engagement = high content quality
    return 'high';
  } else if (engagementVelocity >= (1.0 * adjustedThreshold) && historicalRatio >= 0.3) {
    // Moderate velocity + minimal historical engagement = moderate content quality
    return 'moderate';
  } else {
    // Low velocity or mostly recent engagement = low content quality
    return 'low';
  }
};

// Calculate engagement impact with detailed time breakdown and sustained engagement analysis
// Now uses dynamic, population-aware interaction weighting with score normalization
// AND multi-university fair scoring to prevent unfair advantages
const calculateDetailedEngagementImpact = async (postData) => {
  const postId = postData.id;
  const universityId = postData.university_id;
  
  try {
    // Check if this is a multi-university post
    const postScope = await multiUniversityScoringService.determinePostScope(postId);
    
    if (postScope.scope !== 'single') {
      // Use multi-university scoring for fair competition
      return await multiUniversityScoringService.calculateNormalizedEngagementImpact(postData);
    }
    
    // Original single-university scoring logic for backward compatibility
    // Get engagement data with timestamps
    const engagementQuery = `
      SELECT 
        pi.interaction_type,
        pi.created_at,
        EXTRACT(DAYS FROM NOW() - pi.created_at) as days_ago
      FROM post_interactions pi
      WHERE pi.post_id = $1
      ORDER BY pi.created_at DESC
    `;
    
    const engagementResult = await query(engagementQuery, [postId]);
    const interactions = engagementResult.rows;
    
    if (interactions.length === 0) {
      return {
        totalImpact: 0,
        weightedImpact: 0,
        recentImpact: 0,
        historicalImpact: 0,
        timeWeight: 1.0,
        sustainedEngagementLevel: 'low',
        sustainedBonus: 0,
        context: null,
        normalizationRatio: 1.0,
        breakdown: {
          recent: { count: 0, points: 0 },
          weekOld: { count: 0, points: 0 },
          monthOld: { count: 0, points: 0 },
          quarterOld: { count: 0, points: 0 },
          halfYearOld: { count: 0, points: 0 },
          older: { count: 0, points: 0 }
        }
      };
    }
    
    // Get dynamic interaction weights based on university context
    const dynamicWeights = await interactionWeightingService.getDynamicWeights(universityId);
    const { weights, context } = dynamicWeights;
    
    // Categorize interactions by age with dynamic weighting
    let recentImpact = 0;      // Last 7 days
    let weekOldImpact = 0;     // 8-30 days
    let monthOldImpact = 0;    // 31-90 days
    let quarterOldImpact = 0;  // 91-180 days
    let halfYearOldImpact = 0; // 181-365 days
    let olderImpact = 0;       // 365+ days
    
    let totalRawImpact = 0;
    let totalWeightedImpact = 0;
    
    interactions.forEach(interaction => {
      const daysAgo = interaction.days_ago;
      const weight = weights[interaction.interaction_type] || 0;
      const baseWeight = interactionWeightingService.baseWeights[interaction.interaction_type] || 0;
      
      // Calculate both raw and weighted impacts
      const rawImpact = baseWeight;
      const weightedImpact = weight;
      
      if (daysAgo <= 7) {
        recentImpact += weightedImpact;
        totalRawImpact += rawImpact;
        totalWeightedImpact += weightedImpact;
      } else if (daysAgo <= 30) {
        weekOldImpact += weightedImpact;
        totalRawImpact += rawImpact * 0.8;
        totalWeightedImpact += weightedImpact * 0.8;
      } else if (daysAgo <= 90) {
        monthOldImpact += weightedImpact;
        totalRawImpact += rawImpact * 0.6;
        totalWeightedImpact += weightedImpact * 0.6;
      } else if (daysAgo <= 180) {
        quarterOldImpact += weightedImpact;
        totalRawImpact += rawImpact * 0.4;
        totalWeightedImpact += weightedImpact * 0.4;
      } else if (daysAgo <= 365) {
        halfYearOldImpact += weightedImpact;
        totalRawImpact += rawImpact * 0.2;
        totalWeightedImpact += weightedImpact * 0.2;
      } else {
        olderImpact += weightedImpact;
        totalRawImpact += rawImpact * 0.1;
        totalWeightedImpact += weightedImpact * 0.1;
      }
    });
    
    // Calculate historical engagement (everything older than 7 days)
    const historicalEngagement = totalWeightedImpact - recentImpact;
    
    // Determine sustained engagement level using context-aware thresholds
    const sustainedEngagementLevel = determineSustainedEngagementLevel(
      recentImpact, 
      historicalEngagement, 
      postData.daysSinceCreation || 0,
      context.engagementThreshold
    );
    
    // Calculate time weight with sustained engagement bonus
    const timeWeight = calculateTimeWeight(
      postData.daysSinceCreation || 0, 
      sustainedEngagementLevel
    );
    
    // Calculate sustained engagement bonus
    const sustainedBonus = calculateSustainedEngagementBonus(
      postData.daysSinceCreation || 0, 
      sustainedEngagementLevel
    );
    
    // FIXED: Normalize the weighted impact to maintain score consistency across universities
    // Calculate the ratio between weighted and raw impact, then normalize
    const normalizationRatio = totalRawImpact > 0 ? totalRawImpact / totalWeightedImpact : 1.0;
    const normalizedImpact = totalWeightedImpact * normalizationRatio;
    
    // Apply context multiplier (now always 1.0 to maintain consistency)
    const finalImpact = Math.min(normalizedImpact * timeWeight * context.multiplier, 25.0);
    
    return {
      totalImpact: Math.round(totalRawImpact * 100) / 100,
      weightedImpact: Math.round(finalImpact * 100) / 100,
      recentImpact: Math.round(recentImpact * 100) / 100,
      historicalImpact: Math.round(historicalEngagement * 100) / 100,
      timeWeight: Math.round(timeWeight * 100) / 100,
      sustainedEngagementLevel,
      sustainedBonus: Math.round(sustainedBonus * 100) / 100,
      context: context,
      normalizationRatio: Math.round(normalizationRatio * 1000) / 1000,
      breakdown: {
        recent: { count: interactions.filter(i => i.days_ago <= 7).length, points: Math.round(recentImpact * 100) / 100 },
        weekOld: { count: interactions.filter(i => i.days_ago > 7 && i.days_ago <= 30).length, points: Math.round(weekOldImpact * 0.8 * 100) / 100 },
        monthOld: { count: interactions.filter(i => i.days_ago > 30 && i.days_ago <= 90).length, points: Math.round(monthOldImpact * 0.6 * 100) / 100 },
        quarterOld: { count: interactions.filter(i => i.days_ago > 90 && i.days_ago <= 180).length, points: Math.round(quarterOldImpact * 0.4 * 100) / 100 },
        halfYearOld: { count: interactions.filter(i => i.days_ago > 180 && i.days_ago <= 365).length, points: Math.round(halfYearOldImpact * 0.2 * 100) / 100 },
        older: { count: interactions.filter(i => i.days_ago > 365).length, points: Math.round(olderImpact * 0.1 * 100) / 100 }
      }
    };
    
  } catch (error) {
    console.error('Error calculating detailed engagement impact:', error);
    // Fallback to simple calculation
    return {
      totalImpact: 0,
      weightedImpact: 0,
      recentImpact: 0,
      historicalImpact: 0,
      timeWeight: 1.0,
      sustainedEngagementLevel: 'low',
      sustainedBonus: 0,
      context: null,
      normalizationRatio: 1.0,
      breakdown: {
        recent: { count: 0, points: 0 },
        weekOld: { count: 0, points: 0 },
        monthOld: { count: 0, points: 0 },
        quarterOld: { count: 0, points: 0 },
        halfYearOld: { count: 0, points: 0 },
        older: { count: 0, points: 0 }
      }
    };
  }
};

// Calculate zero interaction decay penalty
const calculateZeroInteractionDecay = async (postData) => {
  const postId = postData.id;
  
  // Get the last interaction date
  const lastInteractionQuery = `
    SELECT 
      GREATEST(
        COALESCE(MAX(pi.created_at), p.created_at),
        p.created_at
      ) as last_interaction
    FROM posts p
    LEFT JOIN post_interactions pi ON p.id = pi.post_id
    WHERE p.id = $1
    GROUP BY p.id, p.created_at
  `;
  
  const lastInteractionResult = await query(lastInteractionQuery, [postId]);
  const lastInteraction = new Date(lastInteractionResult.rows[0].last_interaction);
  const now = new Date();
  
  // Calculate days since last interaction
  const daysSinceLastInteraction = Math.max((now - lastInteraction) / (1000 * 60 * 60 * 24), 0);
  
  // Apply percentage-based decay
  let decayPenalty = 0;
  if (daysSinceLastInteraction >= 1) {
    // Daily decay: 2% of current score, capped at 8 points per day
    const dailyDecayRate = ENGAGEMENT_DECAY.DECAY_FACTOR; // 10%
    const currentScore = postData.final_score || 50.0;
    
    decayPenalty = Math.min(
      currentScore * dailyDecayRate * Math.floor(daysSinceLastInteraction),
      ENGAGEMENT_DECAY.MAX_DAILY_DECAY
    );
  }
  
  return {
    hasDecay: decayPenalty > 0,
    decayPenalty: Math.round(decayPenalty * 100) / 100,
    daysSinceLastInteraction: Math.floor(daysSinceLastInteraction),
    dailyDecayRate: ENGAGEMENT_DECAY.DECAY_FACTOR * 100 + '%'
  };
};

// Check if post is eligible for new post boost
const isEligibleForNewPostBoost = (postData) => {
  const createdAt = new Date(postData.created_at);
  const now = new Date();
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
  
  return hoursSinceCreation < NEW_POST_BOOST.BOOST_DURATION_HOURS;
};

// Calculate new post boost
const calculateNewPostBoost = (postData) => {
  const hasBoost = isEligibleForNewPostBoost(postData);
  
  return {
    hasBoost,
    boostScore: hasBoost ? NEW_POST_BOOST.BOOST_SCORE : 0,
    boostDuration: NEW_POST_BOOST.BOOST_DURATION_HOURS,
    hoursRemaining: hasBoost ? Math.max(0, NEW_POST_BOOST.BOOST_DURATION_HOURS - ((new Date() - new Date(postData.created_at)) / (1000 * 60 * 60))) : 0
  };
};

// Calculate repost boost - gives reposted content higher visibility in feeds
const calculateRepostBoost = async (postData) => {
  try {
    // Get repost count and recent repost activity
    const repostQuery = `
      SELECT 
        COUNT(*) as total_reposts,
        COUNT(CASE WHEN pi.created_at >= NOW() - INTERVAL '${REPOST_BOOST.RECENT_REPOST_HOURS} hours' THEN 1 END) as recent_reposts
      FROM post_interactions pi
      WHERE pi.post_id = $1 AND pi.interaction_type = 'repost'
    `;
    
    const result = await query(repostQuery, [postData.id]);
    const totalReposts = parseInt(result.rows[0]?.total_reposts || 0);
    const recentReposts = parseInt(result.rows[0]?.recent_reposts || 0);
    
    if (totalReposts === 0) {
      return {
        hasRepostBoost: false,
        repostMultiplier: 1.0,
        repostBonus: 0,
        totalReposts: 0,
        recentReposts: 0
      };
    }
    
    // Calculate boost: base multiplier + diminishing returns bonus
    let repostMultiplier = REPOST_BOOST.BASE_MULTIPLIER;
    
    // Add bonus for each repost with diminishing returns
    const logarithmicBonus = Math.log(totalReposts + 1) * REPOST_BOOST.PER_REPOST_BONUS;
    
    // Recent reposts get extra weight (20% bonus for recent activity)
    const recentBonus = recentReposts > 0 ? (recentReposts / totalReposts) * 0.2 : 0;
    
    // Calculate final bonus points (capped at MAX_REPOST_BONUS)
    const repostBonus = Math.min(
      logarithmicBonus + recentBonus * 5, // Recent activity bonus
      REPOST_BOOST.MAX_REPOST_BONUS
    );
    
    return {
      hasRepostBoost: true,
      repostMultiplier,
      repostBonus,
      totalReposts,
      recentReposts,
      explanation: `Post has ${totalReposts} reposts (${recentReposts} recent). Boost: ${repostMultiplier}x multiplier + ${Math.round(repostBonus * 100) / 100} bonus points`
    };
    
  } catch (error) {
    console.error('Error calculating repost boost:', error);
    return {
      hasRepostBoost: false,
      repostMultiplier: 1.0,
      repostBonus: 0,
      totalReposts: 0,
      recentReposts: 0
    };
  }
};

// Calculate final score with new 0-100 scale and time-weighted engagement
const calculateFinalScore = async (postData) => {
  const baseScore = postData.base_score || calculateBaseScore(postData);
  const createdAt = new Date(postData.created_at);
  const now = new Date();
  const daysSinceCreation = Math.max((now - createdAt) / (1000 * 60 * 60 * 24), 0);

  // Use detailed time-weighted engagement calculation
  const engagementImpact = await calculateDetailedEngagementImpact({
    ...postData,
    daysSinceCreation
  });
  
  const zeroInteractionDecay = await calculateZeroInteractionDecay(postData);
  const newPostBoost = calculateNewPostBoost(postData);
  const repostBoost = await calculateRepostBoost(postData);

  // Include review score bonus for recurring posts
  const reviewScoreBonus = postData.review_score_bonus || 0;
  const isRecurring = postData.duration_type === 'recurring';
  
  let finalScore = baseScore + engagementImpact.weightedImpact - zeroInteractionDecay.decayPenalty;

  // Add review bonus for recurring posts (up to 5 additional points)
  if (isRecurring && reviewScoreBonus > 0) {
    const maxReviewBonus = 5.0; // Cap review bonus at 5 points
    const cappedReviewBonus = Math.min(reviewScoreBonus, maxReviewBonus);
    finalScore += cappedReviewBonus;
  }

  // Apply repost boost - multiply engagement and add bonus points
  if (repostBoost.hasRepostBoost) {
    // Multiply the engagement impact by the repost multiplier
    finalScore = (baseScore + (engagementImpact.weightedImpact * repostBoost.repostMultiplier)) - zeroInteractionDecay.decayPenalty;
    
    // Add the repost bonus points
    finalScore += repostBoost.repostBonus;
    
    // Re-add review bonus if applicable
    if (isRecurring && reviewScoreBonus > 0) {
      const maxReviewBonus = 5.0;
      const cappedReviewBonus = Math.min(reviewScoreBonus, maxReviewBonus);
      finalScore += cappedReviewBonus;
    }
    
    console.log(`🚀 Repost boost applied to post ${postData.id}: ${repostBoost.explanation}`);
  }

  if (newPostBoost.hasBoost) {
    finalScore = newPostBoost.boostScore;
  } else {
    // Apply 0-50 range limits (penalties can bring score down to 0)
    finalScore = Math.max(0, Math.min(50, finalScore));
  }

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    engagementImpact,
    zeroInteractionDecay,
    newPostBoost,
    repostBoost,
    reviewScoreBonus: isRecurring ? Math.min(reviewScoreBonus, 5.0) : 0
  };
};

// Calculate feed positioning probability (updated for 0-50 scale)
const calculateFeedProbability = (score) => {
  // Convert score to probability: 0-50 score maps to 5-95% probability
  let probability = (score / 50) * 90 + 5; // 0 points = 5%, 50 points = 95%
  
  // Apply caps: minimum 5%, maximum 95%
  probability = Math.max(5, Math.min(95, probability));
  
  // Calculate expected rank based on probability
  const expectedRank = Math.max(1, Math.ceil(100 / probability));
  
  return {
    probability: Math.round(probability * 100) / 100,
    expectedRank,
    description: `This post has a ${Math.round(probability)}% chance of appearing in the top ${expectedRank} positions`
  };
};

// Update post scores in database
const updatePostScores = async (postId) => {
  try {
    // Get post data
    const postQuery = `
      SELECT 
        p.*,
        COALESCE(p.engagement_score, 0) as engagement_score
      FROM posts p
      WHERE p.id = $1
    `;
    
    const postResult = await query(postQuery, [postId]);
    if (postResult.rows.length === 0) {
      throw new Error('Post not found');
    }
    
    const postData = postResult.rows[0];
    
    // Calculate new scores
    const scoreData = await calculateFinalScore(postData);
    const feedPosition = calculateFeedProbability(scoreData.finalScore);
    
    // Update database
    const updateQuery = `
      UPDATE posts 
      SET 
        base_score = $1,
        time_urgency_bonus = $2,
        final_score = $3,
        updated_at = NOW()
      WHERE id = $4
    `;
    
    await query(updateQuery, [
      calculateBaseScore(postData),
      calculateTimeUrgencyBonus(postData),
      scoreData.finalScore,
      postId
    ]);
    
    return {
      success: true,
      postId,
      scores: {
        baseScore: calculateBaseScore(postData),
        timeUrgencyBonus: calculateTimeUrgencyBonus(postData),
        finalScore: scoreData.finalScore
      },
      feedPosition,
      engagementImpact: scoreData.engagementImpact,
      zeroInteractionDecay: scoreData.zeroInteractionDecay,
      newPostBoost: scoreData.newPostBoost
    };
    
  } catch (error) {
    console.error('Error updating post scores:', error);
    throw error;
  }
};

// Get posts with feed positioning data
const getFeedPositionedPosts = async (limit = 20, offset = 0) => {
  try {
    const query = `
      SELECT 
        p.*,
        u.username, u.first_name, u.last_name, u.display_name, u.profile_picture,
        un.name as university_name, un.city as university_city, un.state as university_state,
        COALESCE(
          ARRAY_AGG(DISTINCT CASE 
            WHEN t.name IS NOT NULL AND LOWER(t.name) NOT IN ('recurring', 'limited', 'one-time', 'onetime', 'permanent', 'offer', 'request') 
            THEN t.name 
            ELSE NULL 
          END),
          ARRAY[]::text[]
        ) || 
        CASE 
          WHEN p.post_type = 'offer' THEN ARRAY['Offer']
          WHEN p.post_type = 'request' THEN ARRAY['Request']
          ELSE ARRAY[]::text[]
        END as tags
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = true
      GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state
      ORDER BY 
        p.final_score DESC,
        p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(query, [limit, offset]);
    
    // Process each post to include feed positioning
    const postsWithPositioning = await Promise.all(
      result.rows.map(async (post) => {
        const scoreData = await calculateFinalScore(post);
        const feedPosition = calculateFeedProbability(scoreData.finalScore);
        
        return {
          ...post,
          scoring: {
            baseScore: post.base_score,
            timeUrgencyBonus: post.time_urgency_bonus,
            finalScore: post.final_score,
            feedPosition
          },
          zeroInteractionDecay: scoreData.zeroInteractionDecay,
          newPostBoost: scoreData.newPostBoost
        };
      })
    );
    
    return postsWithPositioning;
    
  } catch (error) {
    console.error('Error getting feed positioned posts:', error);
    throw error;
  }
};

// Get smart feed with positioning metadata
const getSmartFeedWithPositioning = async (limit = 20, offset = 0) => {
  try {
    const posts = await getFeedPositionedPosts(limit, offset);
    
    // Calculate metadata
    const totalPosts = posts.length;
    const averageScore = posts.reduce((sum, post) => sum + post.scoring.finalScore, 0) / totalPosts;
    const scoreDistribution = {
      '0-10': posts.filter(p => p.scoring.finalScore >= 0 && p.scoring.finalScore <= 10).length,
      '11-20': posts.filter(p => p.scoring.finalScore >= 11 && p.scoring.finalScore <= 20).length,
      '21-30': posts.filter(p => p.scoring.finalScore >= 21 && p.scoring.finalScore <= 30).length,
      '31-40': posts.filter(p => p.scoring.finalScore >= 31 && p.scoring.finalScore <= 40).length,
      '41-50': posts.filter(p => p.scoring.finalScore >= 41 && p.scoring.finalScore <= 50).length
    };
    
    return {
      posts,
      metadata: {
        totalPosts,
        averageScore: Math.round(averageScore * 100) / 100,
        scoreDistribution,
        scoringSystem: {
          baseScore: '25.0 points',
          maxScore: '50.0 points',
          scoreRange: '0-50 scale (penalties can reduce to 0)',
          newPostBoost: '50.0 points for 24 hours',
          decaySystem: '4% daily decay for inactive posts, capped at 16% total',
          probabilityRange: '5-95% chance of top positioning',
          engagementSystem: 'Percentage-based rewards and penalties',
          marketplaceFocus: 'Content-focused, not user-focused',
          fulfillmentAction: 'Fulfilled posts are permanently deleted',
          contentDiscovery: 'Quality content remains discoverable until fulfilled',
          noCelebrity: 'No user popularity bonuses or celebrity creation'
        }
      }
    };
    
  } catch (error) {
    console.error('Error getting smart feed with positioning:', error);
    throw error;
  }
};

module.exports = {
  BASE_SCORES,
  TIME_URGENCY_MULTIPLIERS,
  SCORE_RANGES,
  ENGAGEMENT_DECAY,
  NEW_POST_BOOST,
  REPOST_BOOST,
  calculateBaseScore,
  calculateTimeUrgencyBonus,
  calculateEngagementImpact,
  calculateTimeWeight,
  calculateSustainedEngagementBonus,
  determineSustainedEngagementLevel,
  calculateDetailedEngagementImpact,
  calculateZeroInteractionDecay,
  calculateNewPostBoost,
  calculateRepostBoost,
  calculateFinalScore,
  calculateFeedProbability,
  updatePostScores,
  getFeedPositionedPosts,
  getSmartFeedWithPositioning
}; 