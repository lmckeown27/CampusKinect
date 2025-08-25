const { query } = require('../config/database');

/**
 * Personalized Feed Service
 * Handles user-specific feed filtering based on interactions and bookmarks
 * Implements fresh content prioritization and bookmark filtering
 */

class PersonalizedFeedService {
  /**
   * Get personalized feed posts for a specific user
   * @param {number} userId - User ID
   * @param {number} limit - Number of posts to return
   * @param {number} offset - Offset for pagination
   * @param {string} mainTab - Main tab filter (goods-services, events, combined)
   * @param {string} subTab - Sub tab filter
   * @param {Object} options - Additional options
   * @returns {Object} Personalized feed posts with metadata
   */
  async getPersonalizedFeed(userId, limit = 20, offset = 0, mainTab = 'combined', subTab = 'all', options = {}) {
    try {
      // Get user's bookmarked posts to exclude them
      const bookmarkedPosts = await this.getUserBookmarkedPosts(userId);
      const bookmarkedPostIds = bookmarkedPosts.map(post => post.post_id);

      // Get user's interaction history for fresh content prioritization
      const userInteractions = await this.getUserInteractionHistory(userId);

      // Build the personalized query
      const { query: personalizedQuery, params } = this.buildPersonalizedQuery(
        userId, 
        limit, 
        offset, 
        mainTab, 
        subTab, 
        bookmarkedPostIds,
        options
      );

      // Execute the query
      const result = await query(personalizedQuery, params);

      // Apply personalized scoring and filtering
      const personalizedPosts = await this.applyPersonalizedScoring(
        result.rows, 
        userInteractions, 
        bookmarkedPostIds
      );

      // Get total count for pagination
      const totalCount = await this.getPersonalizedFeedCount(
        userId, 
        mainTab, 
        subTab, 
        bookmarkedPostIds,
        options
      );

      return {
        posts: personalizedPosts,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + limit < totalCount
        },
        personalization: {
          bookmarkedPostsExcluded: bookmarkedPostIds.length,
          freshContentBoosted: personalizedPosts.filter(p => p.freshContentBoost).length,
          userInteractionCount: userInteractions.length
        }
      };

    } catch (error) {
      console.error('Error getting personalized feed:', error);
      throw error;
    }
  }

  /**
   * Build personalized query with bookmark filtering and fresh content prioritization
   */
  buildPersonalizedQuery(userId, limit, offset, mainTab, subTab, bookmarkedPostIds, options) {
    let baseQuery = `
      SELECT 
        p.id, p.user_id, p.university_id, p.title, p.description, p.post_type, 
        p.duration_type, p.repost_frequency, p.original_post_id, p.message_count,
        p.share_count, p.bookmark_count, p.repost_count, p.engagement_score,
        p.base_score, p.time_urgency_bonus, p.final_score, p.expires_at, 
        p.event_start, p.event_end, p.is_fulfilled, p.is_active, p.view_count,
        p.created_at, p.updated_at, p.review_count, p.average_rating, p.review_score_bonus,
        u.username, u.first_name, u.last_name, u.display_name, u.profile_picture,
        un.name as university_name, un.city as university_city, un.state as university_state,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        -- Check if user has interacted with this post
        CASE WHEN ui.post_id IS NOT NULL THEN true ELSE false END as user_has_interacted,
        -- Get user's last interaction timestamp
        MAX(ui.created_at) as last_user_interaction
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN post_interactions ui ON p.id = ui.post_id AND ui.user_id = $1
      WHERE p.is_active = true AND p.university_id = $2
    `;

    const params = [userId, 11]; // 11 is Cal Poly SLO university ID
    let paramCount = 2;

    // Exclude bookmarked posts
    if (bookmarkedPostIds.length > 0) {
      paramCount++;
      baseQuery += ` AND p.id NOT IN (SELECT unnest($${paramCount}::int[]))`;
      params.push(bookmarkedPostIds);
    }

    // Apply main tab filtering
    if (mainTab === 'events') {
      paramCount++;
      baseQuery += ` AND p.post_type = 'event'`;
    } else if (mainTab === 'goods-services') {
      paramCount++;
      baseQuery += ` AND p.post_type != 'event'`;
    }

    // Apply sub-tab specific tag filtering
    if (subTab !== 'all') {
      const subTabTags = this.getSubTabTags(subTab);
      if (subTabTags.length > 0) {
        paramCount++;
        baseQuery += ` AND EXISTS (
          SELECT 1 FROM post_tags pt2 
          JOIN tags t2 ON pt2.tag_id = t2.id 
          WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
        )`;
        params.push(subTabTags);
      }
    }

    // Apply offer/request filtering for goods/services
    if (mainTab === 'goods-services' && options.offers !== undefined && options.requests !== undefined) {
      if (options.offers === true && options.requests === false) {
        paramCount++;
        baseQuery += ` AND p.post_type = 'offer'`;
      } else if (options.offers === false && options.requests === true) {
        paramCount++;
        baseQuery += ` AND p.post_type = 'request'`;
      }
    }

    baseQuery += ` GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state, ui.post_id`;

    // Order by fresh content first, then by score
    baseQuery += ` ORDER BY 
      -- Fresh content boost: posts user hasn't interacted with get priority
      CASE WHEN ui.post_id IS NULL THEN 0 ELSE 1 END,
      -- New post boost for first 24 hours
      CASE WHEN p.created_at >= NOW() - INTERVAL '24 hours' THEN 0 ELSE 1 END,
      -- Final score for quality ranking
      p.final_score DESC,
      -- Creation date for recency
      p.created_at DESC`;

    baseQuery += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    return { query: baseQuery, params };
  }

  /**
   * Get total count for personalized feed pagination
   */
  async getPersonalizedFeedCount(userId, mainTab, subTab, bookmarkedPostIds, options) {
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      WHERE p.is_active = true AND p.university_id = $1
    `;

    const params = [11]; // Cal Poly SLO university ID
    let paramCount = 1;

    // Exclude bookmarked posts
    if (bookmarkedPostIds.length > 0) {
      paramCount++;
      countQuery += ` AND p.id NOT IN (SELECT unnest($${paramCount}::int[]))`;
      params.push(bookmarkedPostIds);
    }

    // Apply main tab filtering
    if (mainTab === 'events') {
      paramCount++;
      countQuery += ` AND p.post_type = 'event'`;
    } else if (mainTab === 'goods-services') {
      paramCount++;
      countQuery += ` AND p.post_type != 'event'`;
    }

    // Apply sub-tab filtering
    if (subTab !== 'all') {
      const subTabTags = this.getSubTabTags(subTab);
      if (subTabTags.length > 0) {
        paramCount++;
        countQuery += ` AND EXISTS (
          SELECT 1 FROM post_tags pt2 
          JOIN tags t2 ON pt2.tag_id = t2.id 
          WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
        )`;
        params.push(subTabTags);
      }
    }

    // Apply offer/request filtering
    if (mainTab === 'goods-services' && options.offers !== undefined && options.requests !== undefined) {
      if (options.offers === true && options.requests === false) {
        paramCount++;
        countQuery += ` AND p.post_type = 'offer'`;
      } else if (options.offers === false && options.requests === true) {
        paramCount++;
        countQuery += ` AND p.post_type = 'request'`;
      }
    }

    const result = await query(countQuery, params);
    return parseInt(result.rows[0].total);
  }

  /**
   * Apply personalized scoring to posts
   */
  async applyPersonalizedScoring(posts, userInteractions, bookmarkedPostIds) {
    return posts.map(post => {
      // Check if user has bookmarked this post
      const isBookmarked = bookmarkedPostIds.includes(post.id);
      
      // Check if user has interacted with this post
      const hasInteracted = post.user_has_interacted;
      
      // Calculate fresh content boost
      const freshContentBoost = !hasInteracted;
      
      // Calculate interaction recency bonus
      const interactionRecencyBonus = this.calculateInteractionRecencyBonus(post.last_user_interaction);
      
      // Calculate personalized score
      const personalizedScore = this.calculatePersonalizedScore(
        post.final_score,
        freshContentBoost,
        interactionRecencyBonus,
        post.created_at
      );

      return {
        ...post,
        personalization: {
          isBookmarked,
          hasInteracted,
          freshContentBoost,
          interactionRecencyBonus,
          personalizedScore
        }
      };
    });
  }

  /**
   * Calculate interaction recency bonus
   */
  calculateInteractionRecencyBonus(lastInteraction) {
    if (!lastInteraction) return 0;
    
    const now = new Date();
    const interactionTime = new Date(lastInteraction);
    const daysSinceInteraction = (now - interactionTime) / (1000 * 60 * 60 * 24);
    
    // Bonus decreases over time
    if (daysSinceInteraction <= 1) return 0.1;      // 10% bonus for recent interaction
    if (daysSinceInteraction <= 7) return 0.05;     // 5% bonus for week-old interaction
    if (daysSinceInteraction <= 30) return 0.02;    // 2% bonus for month-old interaction
    return 0;                                        // No bonus for old interactions
  }

  /**
   * Calculate personalized score
   */
  calculatePersonalizedScore(baseScore, freshContentBoost, interactionRecencyBonus, createdAt) {
    let personalizedScore = baseScore;
    
    // Fresh content gets significant boost
    if (freshContentBoost) {
      personalizedScore *= 1.3; // 30% boost for fresh content
    }
    
    // Add interaction recency bonus
    personalizedScore += interactionRecencyBonus;
    
    // New post boost (first 24 hours)
    const now = new Date();
    const postAge = (now - new Date(createdAt)) / (1000 * 60 * 60 * 24);
    if (postAge <= 1) {
      personalizedScore *= 1.2; // 20% boost for new posts
    }
    
    return Math.round(personalizedScore * 100) / 100;
  }

  /**
   * Get user's bookmarked posts
   */
  async getUserBookmarkedPosts(userId) {
    try {
      const result = await query(`
        SELECT post_id, created_at
        FROM post_interactions
        WHERE user_id = $1 AND interaction_type = 'bookmark'
        ORDER BY created_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user bookmarked posts:', error);
      return [];
    }
  }

  /**
   * Get user's interaction history
   */
  async getUserInteractionHistory(userId) {
    try {
      const result = await query(`
        SELECT post_id, interaction_type, created_at
        FROM post_interactions
        WHERE user_id = $1
        ORDER BY created_at DESC
      `, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user interaction history:', error);
      return [];
    }
  }

  /**
   * Get sub-tab tags for filtering
   */
  getSubTabTags(subTab) {
    const subTabConfig = {
      'leasing': ['housing', 'apartment', 'lease', 'roommate', 'sublet'],
      'tutoring': ['tutoring', 'homework', 'study', 'academic', 'math', 'science', 'english'],
      'books': ['textbook', 'book', 'reading', 'course', 'education'],
      'rides': ['ride', 'carpool', 'transport', 'drive', 'travel'],
      'food': ['food', 'dining', 'meal', 'cooking', 'restaurant'],
      'sport': ['event', 'sport', 'athletic', 'game', 'tournament', 'fitness'],
      'rush': ['event', 'rush', 'greek', 'fraternity', 'sorority', 'recruitment'],
      'philanthropy': ['event', 'philanthropy', 'charity', 'community', 'service', 'volunteer'],
      'academic': ['event', 'academic', 'lecture', 'workshop', 'seminar', 'conference'],
      'social': ['event', 'social', 'party', 'club', 'entertainment', 'music'],
      'cultural': ['event', 'cultural', 'diversity', 'heritage', 'international', 'celebration']
    };
    
    return subTabConfig[subTab] || [];
  }

  /**
   * Get personalized feed metadata
   */
  async getPersonalizedFeedMetadata(userId) {
    try {
      const bookmarkedPosts = await this.getUserBookmarkedPosts(userId);
      const userInteractions = await this.getUserInteractionHistory(userId);
      
      return {
        bookmarkedPostsCount: bookmarkedPosts.length,
        totalInteractions: userInteractions.length,
        interactionBreakdown: {
          messages: userInteractions.filter(i => i.interaction_type === 'message').length,
          shares: userInteractions.filter(i => i.interaction_type === 'share').length,
          bookmarks: userInteractions.filter(i => i.interaction_type === 'bookmark').length,
          reposts: userInteractions.filter(i => i.interaction_type === 'repost').length
        },
        lastActivity: userInteractions.length > 0 ? userInteractions[0].created_at : null
      };
    } catch (error) {
      console.error('Error getting personalized feed metadata:', error);
      return {
        bookmarkedPostsCount: 0,
        totalInteractions: 0,
        interactionBreakdown: { messages: 0, shares: 0, bookmarks: 0, reposts: 0 },
        lastActivity: null
      };
    }
  }
}

module.exports = new PersonalizedFeedService(); 