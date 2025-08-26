const { query } = require('../config/database');
const { redisGet, redisSet, redisDel } = require('../config/redis');

/**
 * Market Size Service
 * Detects and classifies market sizes based on university clusters and post density
 * Determines whether a market is small, medium, large, or massive
 */

class MarketSizeService {
  /**
   * Determine market size for a university based on cluster and post density
   * @param {number} universityId - University ID
   * @returns {string} Market size classification
   */
  async determineMarketSize(universityId) {
    try {
      const cacheKey = `market_size:university:${universityId}`;
      
      // Try to get from cache first
      const cached = await redisGet(cacheKey);
      if (cached) {
        return cached;
      }

      // Get university cluster information
      const universityQuery = `
        SELECT 
          u.id,
          u.name,
          u.cluster_id,
          c.name as cluster_name,
          c.region
        FROM universities u
        LEFT JOIN clusters c ON u.cluster_id = c.id
        WHERE u.id = $1
      `;

      const universityResult = await query(universityQuery, [universityId]);
      if (universityResult.rows.length === 0) {
        throw new Error('University not found');
      }

      const university = universityResult.rows[0];

      // Count posts in this university
      const postCountQuery = `
        SELECT COUNT(*) as post_count
        FROM posts 
        WHERE university_id = $1 AND is_active = true
      `;

      const postCountResult = await query(postCountQuery, [universityId]);
      const postCount = parseInt(postCountResult.rows[0].post_count);

      // Count posts in the same cluster
      const clusterPostCountQuery = `
        SELECT COUNT(*) as cluster_post_count
        FROM posts p
        JOIN universities u ON p.university_id = u.id
        WHERE u.cluster_id = $1 AND p.is_active = true
      `;

      const clusterPostCountResult = await query(clusterPostCountQuery, [university.cluster_id]);
      const clusterPostCount = parseInt(clusterPostCountResult.rows[0].cluster_post_count);

      // Count universities in the same cluster
      const clusterUniversityCountQuery = `
        SELECT COUNT(*) as cluster_university_count
        FROM universities 
        WHERE cluster_id = $1
      `;

      const clusterUniversityCountResult = await query(clusterUniversityCountQuery, [university.cluster_id]);
      const clusterUniversityCount = parseInt(clusterUniversityCountResult.rows[0].cluster_university_count);

      // Determine market size based on cluster size and post density
      let marketSize;
      
      if (clusterUniversityCount === 1) {
        // Single university cluster
        if (postCount < 100) {
          marketSize = 'small';
        } else if (postCount < 500) {
          marketSize = 'medium';
        } else {
          marketSize = 'large';
        }
      } else if (clusterUniversityCount <= 5) {
        // Small cluster (2-5 universities)
        if (clusterPostCount < 500) {
          marketSize = 'small';
        } else if (clusterPostCount < 2000) {
          marketSize = 'medium';
        } else {
          marketSize = 'large';
        }
      } else if (clusterUniversityCount <= 15) {
        // Medium cluster (6-15 universities)
        if (clusterPostCount < 1000) {
          marketSize = 'medium';
        } else if (clusterPostCount < 5000) {
          marketSize = 'large';
        } else {
          marketSize = 'massive';
        }
      } else {
        // Large cluster (16+ universities)
        if (clusterPostCount < 2000) {
          marketSize = 'large';
        } else {
          marketSize = 'massive';
        }
      }

      // Cache the result
      await redisSet(cacheKey, marketSize, 3600); // Cache for 1 hour

      console.log(`🏫 University ${university.name} classified as ${marketSize} market`);
      console.log(`   Cluster: ${university.cluster_name || 'None'} (${clusterUniversityCount} universities)`);
      console.log(`   Posts: ${postCount} (university), ${clusterPostCount} (cluster)`);

      return marketSize;

    } catch (error) {
      console.error('❌ Error determining market size:', error);
      // Default to small market on error
      return 'small';
    }
  }

  /**
   * Update market size for all universities
   * @returns {Object} Result of market size updates
   */
  async updateAllMarketSizes() {
    try {
      console.log('🔄 Updating market sizes for all universities...');

      // Get all universities
      const universitiesQuery = `
        SELECT id, name, cluster_id
        FROM universities
        WHERE is_active = true
      `;

      const universitiesResult = await query(universitiesQuery);
      const universities = universitiesResult.rows;

      const results = {};
      let updated = 0;

      for (const university of universities) {
        try {
          const marketSize = await this.determineMarketSize(university.id);
          
          // Update the university's market size in the database
          const updateQuery = `
            UPDATE universities 
            SET market_size = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `;

          await query(updateQuery, [marketSize, university.id]);
          
          results[university.id] = {
            name: university.name,
            marketSize,
            success: true
          };
          
          updated++;

        } catch (error) {
          console.error(`❌ Error updating market size for university ${university.id}:`, error);
          results[university.id] = {
            name: university.name,
            error: error.message,
            success: false
          };
        }
      }

      // Clear all market size caches
      const cacheKeys = universities.map(u => `market_size:university:${u.id}`);
      for (const key of cacheKeys) {
        await redisDel(key);
      }

      console.log(`✅ Updated market sizes for ${updated} universities`);

      return {
        success: true,
        message: `Market sizes updated for ${updated} universities`,
        updated,
        results
      };

    } catch (error) {
      console.error('❌ Error updating all market sizes:', error);
      throw error;
    }
  }

  /**
   * Get market size statistics across all markets
   * @returns {Object} Market size statistics
   */
  async getMarketSizeStatistics() {
    try {
      const cacheKey = 'market_size_statistics';
      
      // Try to get from cache first
      const cached = await redisGet(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get statistics from database
      const statsQuery = `
        SELECT 
          u.market_size,
          COUNT(DISTINCT u.id) as university_count,
          COUNT(p.id) as post_count,
          ROUND(AVG(p.final_score), 2) as avg_post_score,
          ROUND(MIN(p.final_score), 2) as min_post_score,
          ROUND(MAX(p.final_score), 2) as max_post_score
        FROM universities u
        LEFT JOIN posts p ON u.id = p.university_id AND p.is_active = true
        WHERE u.is_active = true
        GROUP BY u.market_size
        ORDER BY 
          CASE u.market_size
            WHEN 'small' THEN 1
            WHEN 'medium' THEN 2
            WHEN 'large' THEN 3
            WHEN 'massive' THEN 4
            ELSE 5
          END
      `;

      const result = await query(statsQuery);
      
      const statistics = {
        totalUniversities: 0,
        totalPosts: 0,
        markets: {},
        lastUpdated: new Date().toISOString()
      };

      result.rows.forEach(row => {
        const marketSize = row.market_size || 'unknown';
        statistics.markets[marketSize] = {
          universityCount: parseInt(row.university_count),
          postCount: parseInt(row.post_count),
          avgPostScore: parseFloat(row.avg_post_score),
          minPostScore: parseFloat(row.min_post_score),
          maxPostScore: parseFloat(row.max_post_score)
        };
        
        statistics.totalUniversities += parseInt(row.university_count);
        statistics.totalPosts += parseInt(row.post_count);
      });

      // Cache the statistics
      await redisSet(cacheKey, JSON.stringify(statistics), 1800); // Cache for 30 minutes

      return statistics;

    } catch (error) {
      console.error('❌ Error getting market size statistics:', error);
      throw error;
    }
  }

  /**
   * Update market size for posts based on their university's market size
   * @returns {Object} Result of post market size updates
   */
  async updatePostMarketSizes() {
    try {
      console.log('🔄 Updating market sizes for all posts...');

      const updateQuery = `
        UPDATE posts 
        SET market_size = u.market_size
        FROM universities u
        WHERE posts.university_id = u.id
        AND posts.is_active = true
        AND u.market_size IS NOT NULL
      `;

      const result = await query(updateQuery);

      console.log(`✅ Updated market sizes for ${result.rowCount} posts`);

      // Clear post-related caches
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
        message: `Market sizes updated for ${result.rowCount} posts`,
        updated: result.rowCount
      };

    } catch (error) {
      console.error('❌ Error updating post market sizes:', error);
      throw error;
    }
  }

  /**
   * Get market size for a specific university
   * @param {number} universityId - University ID
   * @returns {Object} University market size information
   */
  async getUniversityMarketSize(universityId) {
    try {
      const query = `
        SELECT 
          u.id,
          u.name,
          u.market_size,
          u.cluster_id,
          c.name as cluster_name,
          c.region,
          COUNT(p.id) as post_count
        FROM universities u
        LEFT JOIN clusters c ON u.cluster_id = c.id
        LEFT JOIN posts p ON u.id = p.university_id AND p.is_active = true
        WHERE u.id = $1
        GROUP BY u.id, u.name, u.market_size, u.cluster_id, c.name, c.region
      `;

      const result = await query(query, [universityId]);
      
      if (result.rows.length === 0) {
        throw new Error('University not found');
      }

      const university = result.rows[0];

      return {
        id: university.id,
        name: university.name,
        marketSize: university.market_size,
        clusterId: university.cluster_id,
        clusterName: university.cluster_name,
        region: university.region,
        postCount: parseInt(university.post_count)
      };

    } catch (error) {
      console.error('❌ Error getting university market size:', error);
      throw error;
    }
  }
}

module.exports = new MarketSizeService(); 