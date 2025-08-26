const { query } = require('../config/database');
const { redisDel } = require('../config/redis');

/**
 * Reshuffle Service
 * Handles resetting user interaction history to allow rediscovery of content
 * Only available when user reaches end of "All" posts tab
 */

class ReshuffleService {
  /**
   * Reshuffle all posts for a user (reset interaction history)
   * @param {number} userId - User ID
   * @returns {Object} Reshuffle result
   */
  async reshuffleAllPosts(userId) {
    try {
      console.log(`🔄 Reshuffling all posts for user ${userId}...`);

      // Verify user exists
      const userQuery = `
        SELECT id, username, email
        FROM users 
        WHERE id = $1 AND is_active = true
      `;
      
      const userResult = await query(userQuery, [userId]);
      if (userResult.rows.length === 0) {
        throw new Error('User not found or inactive');
      }

      // Delete all user interactions (except bookmarks)
      const deleteInteractionsQuery = `
        DELETE FROM post_interactions 
        WHERE user_id = $1 AND interaction_type != 'bookmark'
      `;

      const deleteResult = await query(deleteInteractionsQuery, [userId]);
      const deletedInteractions = deleteResult.rowCount;

      // Reset user's last activity timestamp
      const resetUserQuery = `
        UPDATE users 
        SET last_activity_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;

      await query(resetUserQuery, [userId]);

      // Clear all user-related caches
      await this.clearUserCaches(userId);

      console.log(`✅ Reshuffled ${deletedInteractions} interactions for user ${userId}`);

      return {
        success: true,
        message: 'All posts reshuffled successfully',
        userId,
        deletedInteractions,
        reshuffledAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error reshuffling posts:', error);
      throw error;
    }
  }

  /**
   * Reshuffle posts for a specific tag/category
   * @param {number} userId - User ID
   * @param {string} mainTab - Main tab (goods-services, events, combined)
   * @param {string} subTab - Sub tab (specific tag)
   * @returns {Object} Reshuffle result
   */
  async reshuffleTagPosts(userId, mainTab, subTab) {
    try {
      console.log(`🔄 Reshuffling ${subTab} posts for user ${userId}...`);

      // Get posts in the specified tag/category
      const postsQuery = `
        SELECT DISTINCT p.id
        FROM posts p
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.is_active = true
      `;

      const params = [];
      let paramCount = 0;

      // Add main tab filter
      if (mainTab === 'goods-services') {
        paramCount++;
        postsQuery += ` AND p.post_type IN ('offer', 'request')`;
      } else if (mainTab === 'events') {
        paramCount++;
        postsQuery += ` AND p.post_type = 'event'`;
      }

      // Add sub tab filter
      if (subTab && subTab !== 'all') {
        const subTabTags = this.getSubTabTags(subTab);
        if (subTabTags.length > 0) {
          paramCount++;
          postsQuery += ` AND t.name = ANY($${paramCount})`;
          params.push(subTabTags);
        }
      }

      const postsResult = await query(postsQuery, params);
      const postIds = postsResult.rows.map(row => row.id);

      if (postIds.length === 0) {
        return {
          success: true,
          message: `No posts found for ${subTab}`,
          deletedInteractions: 0
        };
      }

      // Delete interactions for posts in this tag/category
      const deleteTagInteractionsQuery = `
        DELETE FROM post_interactions 
        WHERE user_id = $1 AND post_id = ANY($2) AND interaction_type != 'bookmark'
      `;

      const deleteResult = await query(deleteTagInteractionsQuery, [userId, postIds]);
      const deletedInteractions = deleteResult.rowCount;

      // Clear user caches
      await this.clearUserCaches(userId);

      console.log(`✅ Reshuffled ${deletedInteractions} interactions for ${subTab} posts`);

      return {
        success: true,
        message: `${subTab} posts reshuffled successfully`,
        userId,
        subTab,
        deletedInteractions,
        reshuffledAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error reshuffling tag posts:', error);
      throw error;
    }
  }

  /**
   * Check if user is eligible for reshuffle (has seen all posts)
   * @param {number} userId - User ID
   * @param {string} mainTab - Main tab filter
   * @returns {Object} Eligibility status
   */
  async checkReshuffleEligibility(userId, mainTab = 'combined') {
    try {
      // Get total available posts
      let totalPostsQuery = `
        SELECT COUNT(*) as total_posts
        FROM posts 
        WHERE is_active = true
      `;

      const params = [];
      let paramCount = 0;

      // Add main tab filter
      if (mainTab === 'goods-services') {
        paramCount++;
        totalPostsQuery += ` AND post_type IN ('offer', 'request')`;
      } else if (mainTab === 'events') {
        paramCount++;
        totalPostsQuery += ` AND post_type = 'event'`;
      }

      const totalPostsResult = await query(totalPostsQuery, params);
      const totalPosts = parseInt(totalPostsResult.rows[0].total_posts);

      // Get user's interaction count
      let userInteractionsQuery = `
        SELECT COUNT(DISTINCT pi.post_id) as interacted_posts
        FROM post_interactions pi
        JOIN posts p ON pi.post_id = p.id
        WHERE pi.user_id = $1 AND pi.interaction_type != 'bookmark'
      `;

      if (mainTab === 'goods-services') {
        userInteractionsQuery += ` AND p.post_type IN ('offer', 'request')`;
      } else if (mainTab === 'events') {
        userInteractionsQuery += ` AND p.post_type = 'event'`;
      }

      const userInteractionsResult = await query(userInteractionsQuery, [userId]);
      const interactedPosts = parseInt(userInteractionsResult.rows[0].interacted_posts);

      const remainingPosts = totalPosts - interactedPosts;
      const eligibleForReshuffle = remainingPosts === 0;

      return {
        eligible: eligibleForReshuffle,
        totalPosts,
        interactedPosts,
        remainingPosts,
        message: eligibleForReshuffle 
          ? 'You have seen all available posts. Reshuffle to see them again!'
          : `You have ${remainingPosts} posts remaining to discover.`
      };

    } catch (error) {
      console.error('❌ Error checking reshuffle eligibility:', error);
      throw error;
    }
  }

  /**
   * Get reshuffle statistics for a user
   * @param {number} userId - User ID
   * @returns {Object} Reshuffle statistics
   */
  async getReshuffleStatistics(userId) {
    try {
      // Get interaction counts by type
      const interactionStatsQuery = `
        SELECT 
          interaction_type,
          COUNT(*) as count,
          MAX(created_at) as last_interaction
        FROM post_interactions 
        WHERE user_id = $1
        GROUP BY interaction_type
        ORDER BY count DESC
      `;

      const interactionStatsResult = await query(interactionStatsQuery, [userId]);

      // Get post counts by main tab
      const postStatsQuery = `
        SELECT 
          CASE 
            WHEN post_type IN ('offer', 'request') THEN 'goods-services'
            WHEN post_type = 'event' THEN 'events'
            ELSE 'other'
          END as main_tab,
          COUNT(*) as total_posts,
          COUNT(CASE WHEN id IN (
            SELECT DISTINCT post_id FROM post_interactions WHERE user_id = $1
          ) THEN 1 END) as interacted_posts
        FROM posts 
        WHERE is_active = true
        GROUP BY 
          CASE 
            WHEN post_type IN ('offer', 'request') THEN 'goods-services'
            WHEN post_type = 'event' THEN 'events'
            ELSE 'other'
          END
      `;

      const postStatsResult = await query(postStatsQuery, [userId]);

      // Calculate reshuffle recommendations
      const recommendations = [];
      postStatsResult.rows.forEach(row => {
        if (row.main_tab !== 'other') {
          const remaining = row.total_posts - row.interacted_posts;
          if (remaining === 0) {
            recommendations.push({
              type: 'reshuffle',
              mainTab: row.main_tab,
              message: `You've seen all ${row.main_tab} posts. Consider reshuffling!`
            });
          } else if (remaining < 10) {
            recommendations.push({
              type: 'warning',
              mainTab: row.main_tab,
              message: `Only ${remaining} ${row.main_tab} posts remaining.`
            });
          }
        }
      });

      return {
        userId,
        interactionStats: interactionStatsResult.rows,
        postStats: postStatsResult.rows,
        recommendations,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Error getting reshuffle statistics:', error);
      throw error;
    }
  }

  /**
   * Clear all user-related caches
   * @param {number} userId - User ID
   */
  async clearUserCaches(userId) {
    try {
      const cacheKeys = [
        `user_interactions:${userId}`,
        `user_bookmarks:${userId}`,
        `personalized_feed:${userId}`,
        `feed_metadata:${userId}`
      ];

      for (const key of cacheKeys) {
        await redisDel(key);
      }

      console.log(`🧹 Cleared caches for user ${userId}`);

    } catch (error) {
      console.error('❌ Error clearing user caches:', error);
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
}

module.exports = new ReshuffleService(); 