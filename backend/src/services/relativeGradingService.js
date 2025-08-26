const { query } = require('../config/database');
const { redisGet, redisSet, redisDel } = require('../config/redis');

/**
 * Relative Grading Service
 * Handles dynamic, performance-based grading of posts within each market
 * Grades are assigned based on relative performance, not fixed point thresholds
 */

class RelativeGradingService {
  /**
   * Calculate and assign relative grades for all posts in a market
   * @param {string} marketSize - Market size (small, medium, large, massive)
   * @returns {Object} Result of grade calculation
   */
  async calculateMarketGrades(marketSize) {
    try {
      console.log(`🔄 Calculating grades for ${marketSize} market...`);

      // Get all active posts in the market
      const postsQuery = `
        SELECT id, final_score, market_size
        FROM posts 
        WHERE market_size = $1 AND is_active = true
        ORDER BY final_score DESC
      `;
      
      const postsResult = await query(postsQuery, [marketSize]);
      const posts = postsResult.rows;

      if (posts.length === 0) {
        console.log(`ℹ️ No posts found for ${marketSize} market`);
        return { success: true, message: 'No posts to grade', updated: 0 };
      }

      // Calculate grade thresholds using percentiles
      const totalPosts = posts.length;
      const gradeAThreshold = posts[Math.floor(totalPosts * 0.8)]?.final_score || 0;
      const gradeBThreshold = posts[Math.floor(totalPosts * 0.5)]?.final_score || 0;
      const gradeCThreshold = posts[Math.floor(totalPosts * 0.2)]?.final_score || 0;

      console.log(`📊 Grade thresholds for ${marketSize} market:`);
      console.log(`   A-grade (top 20%): ${gradeAThreshold}+ points`);
      console.log(`   B-grade (next 30%): ${gradeBThreshold}+ points`);
      console.log(`   C-grade (next 30%): ${gradeCThreshold}+ points`);
      console.log(`   D-grade (bottom 20%): <${gradeCThreshold} points`);

      // Update grades for all posts in the market
      const updateQuery = `
        UPDATE posts 
        SET relative_grade = CASE 
          WHEN final_score >= $1 THEN 'A'
          WHEN final_score >= $2 THEN 'B'
          WHEN final_score >= $3 THEN 'C'
          ELSE 'D'
        END,
        updated_at = CURRENT_TIMESTAMP
        WHERE market_size = $4 AND is_active = true
      `;

      const updateResult = await query(updateQuery, [
        gradeAThreshold,
        gradeBThreshold,
        gradeCThreshold,
        marketSize
      ]);

      // Cache the grade thresholds for quick access
      const cacheKey = `grade_thresholds:${marketSize}`;
      const cacheData = {
        gradeAThreshold,
        gradeBThreshold,
        gradeCThreshold,
        totalPosts,
        lastUpdated: new Date().toISOString()
      };

      await redisSet(cacheKey, JSON.stringify(cacheData), 300); // Cache for 5 minutes

      console.log(`✅ Updated ${updateResult.rowCount} posts in ${marketSize} market`);
      
      return {
        success: true,
        message: `Grades calculated for ${marketSize} market`,
        updated: updateResult.rowCount,
        thresholds: cacheData
      };

    } catch (error) {
      console.error('❌ Error calculating market grades:', error);
      throw error;
    }
  }

  /**
   * Get current grade distribution for a market
   * @param {string} marketSize - Market size
   * @returns {Object} Grade distribution statistics
   */
  async getMarketGradeDistribution(marketSize) {
    try {
      const cacheKey = `grade_distribution:${marketSize}`;
      
      // Try to get from cache first
      const cached = await redisGet(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Calculate distribution from database
      const distributionQuery = `
        SELECT 
          relative_grade,
          COUNT(*) as count,
          ROUND(AVG(final_score), 2) as avg_score,
          MIN(final_score) as min_score,
          MAX(final_score) as max_score
        FROM posts 
        WHERE market_size = $1 AND is_active = true AND relative_grade IS NOT NULL
        GROUP BY relative_grade
        ORDER BY relative_grade
      `;

      const result = await query(distributionQuery, [marketSize]);
      
      const distribution = {
        marketSize,
        totalPosts: 0,
        grades: {},
        lastUpdated: new Date().toISOString()
      };

      result.rows.forEach(row => {
        distribution.grades[row.relative_grade] = {
          count: parseInt(row.count),
          avgScore: parseFloat(row.avg_score),
          minScore: parseFloat(row.min_score),
          maxScore: parseFloat(row.max_score)
        };
        distribution.totalPosts += parseInt(row.count);
      });

      // Cache the distribution
      await redisSet(cacheKey, JSON.stringify(distribution), 300);

      return distribution;

    } catch (error) {
      console.error('❌ Error getting market grade distribution:', error);
      throw error;
    }
  }

  /**
   * Update grades for a specific post and recalculate market grades if needed
   * @param {number} postId - Post ID to update
   * @returns {Object} Update result
   */
  async updatePostGrade(postId) {
    try {
      // Get the post's market size
      const postQuery = `
        SELECT market_size, final_score
        FROM posts 
        WHERE id = $1
      `;
      
      const postResult = await query(postQuery, [postId]);
      if (postResult.rows.length === 0) {
        throw new Error('Post not found');
      }

      const post = postResult.rows[0];
      const { market_size, final_score } = post;

      // Get current grade thresholds for the market
      const cacheKey = `grade_thresholds:${market_size}`;
      let thresholds = await redisGet(cacheKey);
      
      if (!thresholds) {
        // Recalculate grades for the market if cache is missing
        await this.calculateMarketGrades(market_size);
        thresholds = await redisGet(cacheKey);
      }

      const { gradeAThreshold, gradeBThreshold, gradeCThreshold } = JSON.parse(thresholds);

      // Calculate new grade for the post
      let newGrade;
      if (final_score >= gradeAThreshold) {
        newGrade = 'A';
      } else if (final_score >= gradeBThreshold) {
        newGrade = 'B';
      } else if (final_score >= gradeCThreshold) {
        newGrade = 'C';
      } else {
        newGrade = 'D';
      }

      // Update the post's grade
      const updateQuery = `
        UPDATE posts 
        SET relative_grade = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `;

      await query(updateQuery, [newGrade, postId]);

      // Clear cache to force refresh
      await redisDel(`grade_distribution:${market_size}`);

      return {
        success: true,
        postId,
        oldGrade: post.relative_grade,
        newGrade,
        finalScore: final_score
      };

    } catch (error) {
      console.error('❌ Error updating post grade:', error);
      throw error;
    }
  }

  /**
   * Recalculate grades for all markets
   * @returns {Object} Result of recalculation
   */
  async recalculateAllMarketGrades() {
    try {
      console.log('🔄 Recalculating grades for all markets...');

      const marketSizes = ['small', 'medium', 'large', 'massive'];
      const results = {};

      for (const marketSize of marketSizes) {
        try {
          results[marketSize] = await this.calculateMarketGrades(marketSize);
        } catch (error) {
          console.error(`❌ Error calculating grades for ${marketSize} market:`, error);
          results[marketSize] = { success: false, error: error.message };
        }
      }

      // Clear all grade-related caches
      const cacheKeys = [
        'grade_thresholds:small',
        'grade_thresholds:medium', 
        'grade_thresholds:large',
        'grade_thresholds:massive',
        'grade_distribution:small',
        'grade_distribution:medium',
        'grade_distribution:large',
        'grade_distribution:massive'
      ];

      for (const key of cacheKeys) {
        await redisDel(key);
      }

      return {
        success: true,
        message: 'All market grades recalculated',
        results
      };

    } catch (error) {
      console.error('❌ Error recalculating all market grades:', error);
      throw error;
    }
  }

  /**
   * Get grade statistics for a specific post
   * @param {number} postId - Post ID
   * @returns {Object} Post grade information
   */
  async getPostGradeInfo(postId) {
    try {
      const postQuery = `
        SELECT 
          p.id,
          p.final_score,
          p.relative_grade,
          p.market_size,
          p.created_at,
          p.last_interaction_at,
          p.interaction_count,
          -- Get market position
          (SELECT COUNT(*) FROM posts p2 
           WHERE p2.market_size = p.market_size 
           AND p2.is_active = true 
           AND p2.final_score > p.final_score) + 1 as market_rank,
          -- Get total posts in market
          (SELECT COUNT(*) FROM posts p3 
           WHERE p3.market_size = p.market_size 
           AND p3.is_active = true) as market_total
        FROM posts p
        WHERE p.id = $1
      `;

      const result = await query(postQuery, [postId]);
      
      if (result.rows.length === 0) {
        throw new Error('Post not found');
      }

      const post = result.rows[0];
      const marketRank = parseInt(post.market_rank);
      const marketTotal = parseInt(post.market_total);
      const marketPercentile = Math.round((marketRank / marketTotal) * 100);

      return {
        postId: post.id,
        finalScore: post.final_score,
        relativeGrade: post.relative_grade,
        marketSize: post.market_size,
        marketRank,
        marketTotal,
        marketPercentile,
        createdAt: post.created_at,
        lastInteractionAt: post.last_interaction_at,
        interactionCount: post.interaction_count
      };

    } catch (error) {
      console.error('❌ Error getting post grade info:', error);
      throw error;
    }
  }
}

module.exports = new RelativeGradingService(); 