const { query } = require('../config/database');
const interactionWeightingService = require('./interactionWeightingService');

/**
 * Multi-University Scoring Service
 * 
 * This service ensures fair competition between single-university and multi-university posts
 * by normalizing engagement metrics based on the scope of universities targeted.
 * 
 * Key Principles:
 * 1. Multi-university posts get larger sample sizes (more potential users)
 * 2. Engagement should be normalized to account for this advantage
 * 3. Final scores should reflect content quality, not just reach
 */
class MultiUniversityScoringService {
  constructor() {
    // Normalization factors for different target scopes (as percentages)
    // Updated to give single-university posts advantages
    this.normalizationFactors = {
      single: 1.2,      // Single-university posts get 20% boost
      multi: 0.8,       // Multi-university posts get 20% penalty
      cluster: 0.6      // Cluster-wide posts get 40% penalty
    };
    
    // Engagement thresholds for different scopes (as percentage multipliers)
    // Updated to maintain fair competition
    this.engagementThresholds = {
      single: 0.8,      // Lower threshold for single-university (easier to achieve high scores)
      multi: 1.2,       // Higher threshold for multi-university (more users = higher expectations)
      cluster: 1.5      // Even higher threshold for cluster-wide posts
    };
    
    // Calculate effective multipliers (Factor ÷ Threshold) for transparency
    this.effectiveMultipliers = {
      single: this.normalizationFactors.single / this.engagementThresholds.single,
      multi: this.normalizationFactors.multi / this.engagementThresholds.multi,
      cluster: this.normalizationFactors.cluster / this.engagementThresholds.cluster
    };
  }

  /**
   * Determine the target scope of a post
   * @param {number} postId - The post ID
   * @returns {Object} Target scope information
   */
  async determinePostScope(postId) {
    try {
      // Check if post targets multiple universities
      const scopeQuery = `
        SELECT 
          p.target_scope,
          p.university_id as primary_university_id,
          COUNT(pu.university_id) as total_targeted_universities,
          ARRAY_AGG(pu.university_id) as targeted_university_ids,
          c.name as cluster_name
        FROM posts p
        LEFT JOIN post_universities pu ON p.id = pu.post_id
        LEFT JOIN universities u ON p.university_id = u.id
        LEFT JOIN clusters c ON u.cluster_id = c.id
        WHERE p.id = $1
        GROUP BY p.id, p.target_scope, p.university_id, c.name
      `;
      
      const result = await query(scopeQuery, [postId]);
      
      if (result.rows.length === 0) {
        return {
          scope: 'single',
          totalUniversities: 1,
          universityIds: [],
          clusterName: null,
          normalizationFactor: this.normalizationFactors.single,
          engagementThreshold: this.engagementThresholds.single
        };
      }
      
      const post = result.rows[0];
      const totalUniversities = Math.max(1, post.total_targeted_universities || 1);
      
      // Determine scope based on number of universities targeted
      let scope = 'single';
      if (totalUniversities > 1) {
        scope = totalUniversities <= 5 ? 'multi' : 'cluster';
      }
      
      return {
        scope,
        totalUniversities,
        universityIds: post.targeted_university_ids || [post.primary_university_id],
        clusterName: post.cluster_name,
        normalizationFactor: this.normalizationFactors[scope],
        engagementThreshold: this.engagementThresholds[scope]
      };
    } catch (error) {
      console.error('Error determining post scope:', error);
      return {
        scope: 'single',
        totalUniversities: 1,
        universityIds: [],
        clusterName: null,
        normalizationFactor: this.normalizationFactors.single,
        engagementThreshold: this.engagementThresholds.single
      };
    }
  }

  /**
   * Calculate normalized engagement impact for multi-university posts
   * @param {Object} postData - Post data including engagement metrics
   * @returns {Object} Normalized engagement impact
   */
  async calculateNormalizedEngagementImpact(postData) {
    try {
      const postId = postData.id;
      const scope = await this.determinePostScope(postId);
      
      // Get engagement data from all targeted universities
      const engagementQuery = `
        SELECT 
          pi.interaction_type,
          pi.created_at,
          EXTRACT(DAYS FROM NOW() - pi.created_at) as days_ago,
          u.name as university_name
        FROM post_interactions pi
        JOIN users u ON pi.user_id = u.id
        WHERE pi.post_id = $1
        ORDER BY pi.created_at DESC
      `;
      
      const engagementResult = await query(engagementQuery, [postId]);
      const interactions = engagementResult.rows;
      
      if (interactions.length === 0) {
        return {
          totalImpact: 0,
          normalizedImpact: 0,
          scope: scope,
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
      
      // Calculate engagement impact with time weighting
      let recentImpact = 0;      // Last 7 days
      let weekOldImpact = 0;     // 8-30 days
      let monthOldImpact = 0;    // 31-90 days
      let quarterOldImpact = 0;  // 91-180 days
      let halfYearImpact = 0;    // 181-365 days
      let olderImpact = 0;       // 365+ days
      
      let totalRawImpact = 0;
      
      interactions.forEach(interaction => {
        const daysAgo = interaction.days_ago;
        const baseWeight = interactionWeightingService.baseWeights[interaction.interaction_type] || 0;
        
        if (daysAgo <= 7) {
          recentImpact += baseWeight;
          totalRawImpact += baseWeight;
        } else if (daysAgo <= 30) {
          weekOldImpact += baseWeight * 0.8;
          totalRawImpact += baseWeight * 0.8;
        } else if (daysAgo <= 90) {
          monthOldImpact += baseWeight * 0.6;
          totalRawImpact += baseWeight * 0.6;
        } else if (daysAgo <= 180) {
          quarterOldImpact += baseWeight * 0.4;
          totalRawImpact += baseWeight * 0.4;
        } else if (daysAgo <= 365) {
          halfYearImpact += baseWeight * 0.2;
          totalRawImpact += baseWeight * 0.2;
        } else {
          olderImpact += baseWeight * 0.1;
          totalRawImpact += baseWeight * 0.1;
        }
      });
      
      // Apply scope-based normalization
      const normalizedImpact = totalRawImpact * scope.normalizationFactor;
      
      // Apply engagement threshold adjustment and cap at 25 points (for 0-50 scale)
      const thresholdAdjustedImpact = Math.min(25, normalizedImpact / scope.engagementThreshold);
      
      return {
        totalImpact: Math.round(totalRawImpact * 100) / 100,
        normalizedImpact: Math.round(normalizedImpact * 100) / 100,
        thresholdAdjustedImpact: Math.round(thresholdAdjustedImpact * 100) / 100,
        scope: scope,
        breakdown: {
          recent: { count: interactions.filter(i => i.days_ago <= 7).length, points: Math.round(recentImpact * 100) / 100 },
          weekOld: { count: interactions.filter(i => i.days_ago > 7 && i.days_ago <= 30).length, points: Math.round(weekOldImpact * 100) / 100 },
          monthOld: { count: interactions.filter(i => i.days_ago > 30 && i.days_ago <= 90).length, points: Math.round(monthOldImpact * 100) / 100 },
          quarterOld: { count: interactions.filter(i => i.days_ago > 90 && i.days_ago <= 180).length, points: Math.round(quarterOldImpact * 100) / 100 },
          halfYear: { count: interactions.filter(i => i.days_ago > 180 && i.days_ago <= 365).length, points: Math.round(halfYearImpact * 100) / 100 },
          older: { count: interactions.filter(i => i.days_ago > 365).length, points: Math.round(olderImpact * 100) / 100 }
        }
      };
      
    } catch (error) {
      console.error('Error calculating normalized engagement impact:', error);
      return {
        totalImpact: 0,
        normalizedImpact: 0,
        scope: { scope: 'single', totalUniversities: 1 },
        breakdown: {
          recent: { count: 0, points: 0 },
          weekOld: { count: 0, points: 0 },
          monthOld: { count: 0, points: 0 },
          quarterOld: { count: 0, points: 0 },
          halfYear: { count: 0, points: 0 },
          older: { count: 0, points: 0 }
        }
      };
    }
  }

  /**
   * Create or update multi-university post targeting
   * @param {number} postId - The post ID
   * @param {Array} universityIds - Array of university IDs to target
   * @param {number} primaryUniversityId - The primary university ID
   */
  async setPostUniversities(postId, universityIds, primaryUniversityId) {
    try {
      // Remove existing university associations
      await query('DELETE FROM post_universities WHERE post_id = $1', [postId]);
      
      // Insert new university associations
      for (const universityId of universityIds) {
        const isPrimary = universityId === primaryUniversityId;
        await query(`
          INSERT INTO post_universities (post_id, university_id, is_primary)
          VALUES ($1, $2, $3)
        `, [postId, universityId, isPrimary]);
      }
      
      // Update post target scope
      const scope = universityIds.length > 1 ? 'multi' : 'single';
      await query(`
        UPDATE posts 
        SET target_scope = $1, updated_at = NOW()
        WHERE id = $2
      `, [scope, postId]);
      
      return {
        success: true,
        postId,
        scope,
        totalUniversities: universityIds.length,
        universityIds
      };
      
    } catch (error) {
      console.error('Error setting post universities:', error);
      throw error;
    }
  }

  /**
   * Get all universities targeted by a post
   * @param {number} postId - The post ID
   * @returns {Array} Array of university information
   */
  async getPostUniversities(postId) {
    try {
      const query = `
        SELECT 
          pu.university_id,
          pu.is_primary,
          u.name as university_name,
          u.city,
          u.state,
          c.name as cluster_name
        FROM post_universities pu
        JOIN universities u ON pu.university_id = u.id
        LEFT JOIN clusters c ON u.cluster_id = c.id
        WHERE pu.post_id = $1
        ORDER BY pu.is_primary DESC, u.name ASC
      `;
      
      const result = await query(query, [postId]);
      return result.rows;
      
    } catch (error) {
      console.error('Error getting post universities:', error);
      return [];
    }
  }

  /**
   * Demonstrate fair scoring across different post scopes
   */
  demonstrateFairScoring() {
    console.log('🎯 DEMONSTRATING FAIR SCORING ACROSS POST SCOPES\n');
    
    // Example: Same engagement metrics, different scopes
    const exampleEngagement = {
      messages: 20,
      reposts: 10,
      shares: 15,
      bookmarks: 25
    };
    
    const totalRawImpact = (exampleEngagement.messages * 4) + 
                          (exampleEngagement.reposts * 3) + 
                          (exampleEngagement.shares * 2) + 
                          (exampleEngagement.bookmarks * 1);
    
    console.log('📊 Example Post: 20 messages, 10 reposts, 15 shares, 25 bookmarks\n');
    
    Object.entries(this.normalizationFactors).forEach(([scope, factor]) => {
      const normalizedImpact = totalRawImpact * factor;
      const threshold = this.engagementThresholds[scope];
      const finalScore = Math.min(50, normalizedImpact / threshold);
      
      console.log(`✅ ${scope.toUpperCase()} UNIVERSITY POST:`);
      console.log(`   • Raw Engagement Impact: ${totalRawImpact} points`);
      console.log(`   • Normalization Factor: ${factor}x (${(1-factor)*100}% penalty for larger reach)`);
      console.log(`   • Normalized Impact: ${normalizedImpact.toFixed(1)} points`);
      console.log(`   • Engagement Threshold: ${threshold}x (higher expectations)`);
      console.log(`   • Final Score: ${finalScore.toFixed(1)} points`);
      console.log(`   • Key Insight: Fair competition despite different sample sizes!`);
      console.log('');
    });
    
    console.log('🎯 WHY THIS WORKS:');
    console.log('   • Multi-university posts get larger sample sizes (more potential users)');
    console.log('   • Normalization factors penalize larger reach to maintain fairness');
    console.log('   • Higher engagement thresholds ensure quality standards');
    console.log('   • Final scores reflect content quality, not just reach advantage');
    console.log('');
  }
}

module.exports = new MultiUniversityScoringService(); 