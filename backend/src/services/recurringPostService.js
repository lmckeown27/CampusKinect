const { query } = require('../config/database');

/**
 * Recurring Post Service
 * Handles automatic reposting of recurring posts to keep them at the top of the feed
 */

// Repost frequency options
const REPOST_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
};

/**
 * Calculate the next repost date based on frequency
 */
const calculateNextRepostDate = (frequency, currentDate = new Date()) => {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case REPOST_FREQUENCIES.DAILY:
      date.setDate(date.getDate() + 1);
      break;
    case REPOST_FREQUENCIES.WEEKLY:
      date.setDate(date.getDate() + 7);
      break;
    case REPOST_FREQUENCIES.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      date.setDate(date.getDate() + 1); // Default to daily
  }
  
  return date;
};

/**
 * Get all recurring posts that need to be reposted today
 */
const getPostsToRepost = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const result = await query(`
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.description,
        p.post_type,
        p.duration_type,
        p.event_start,
        p.event_end,
        p.university_id,
        p.repost_frequency,
        p.original_post_id,
        p.created_at,
        p.updated_at
      FROM posts p
      WHERE p.duration_type = 'recurring'
        AND p.is_active = true
        AND p.next_repost_date <= $1
        AND (p.event_end IS NULL OR p.event_end >= $1)
    `, [today]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting posts to repost:', error);
    throw error;
  }
};

/**
 * Create a repost of an existing post
 */
const createRepost = async (originalPost) => {
  try {
    const nextRepostDate = calculateNextRepostDate(originalPost.repost_frequency);
    
          const result = await query(`
        INSERT INTO posts (
          user_id, title, description, post_type, duration_type,
          event_start, event_end, university_id, repost_frequency,
          original_post_id, next_repost_date, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, created_at
      `, [
        originalPost.user_id,
        originalPost.title,
        originalPost.description,
        originalPost.post_type,
        originalPost.duration_type,
        originalPost.event_start,
        originalPost.event_end,
        originalPost.university_id,
        originalPost.repost_frequency,
        originalPost.original_post_id || originalPost.id, // Link to original
        nextRepostDate,
        true
      ]);
    
    // Update the original post's next repost date
    await query(`
      UPDATE posts 
      SET next_repost_date = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [nextRepostDate, originalPost.original_post_id || originalPost.id]);
    
    console.log(`✅ Reposted recurring post ID ${originalPost.id} -> New post ID ${result.rows[0].id}`);
    return result.rows[0];
    
  } catch (error) {
    console.error('Error creating repost:', error);
    throw error;
  }
};

/**
 * Process all recurring posts that need reposting
 */
const processRecurringPosts = async () => {
  try {
    console.log('🔄 Processing recurring posts...');
    
    const postsToRepost = await getPostsToRepost();
    
    if (postsToRepost.length === 0) {
      console.log('ℹ️ No recurring posts need reposting today');
      return { processed: 0, reposted: 0 };
    }
    
    console.log(`📝 Found ${postsToRepost.length} recurring posts to repost`);
    
    let repostedCount = 0;
    const errors = [];
    
    for (const post of postsToRepost) {
      try {
        await createRepost(post);
        repostedCount++;
      } catch (error) {
        console.error(`❌ Failed to repost post ID ${post.id}:`, error);
        errors.push({ postId: post.id, error: error.message });
      }
    }
    
    console.log(`✅ Successfully reposted ${repostedCount}/${postsToRepost.length} recurring posts`);
    
    if (errors.length > 0) {
      console.error(`❌ ${errors.length} posts failed to repost:`, errors);
    }
    
    return {
      processed: postsToRepost.length,
      reposted: repostedCount,
      errors: errors
    };
    
  } catch (error) {
    console.error('❌ Error processing recurring posts:', error);
    throw error;
  }
};

/**
 * Get repost history for a post
 */
const getRepostHistory = async (originalPostId) => {
  try {
    const result = await query(`
      SELECT 
        id, created_at, updated_at, is_active
      FROM posts 
      WHERE original_post_id = $1 OR id = $1
      ORDER BY created_at DESC
    `, [originalPostId]);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting repost history:', error);
    throw error;
  }
};

/**
 * Stop recurring posts (set end date to today)
 */
const stopRecurringPost = async (postId, userId) => {
  try {
    const result = await query(`
      UPDATE posts 
      SET event_end = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2 AND duration_type = 'recurring'
      RETURNING id
    `, [postId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Post not found or not a recurring post');
    }
    
    console.log(`🛑 Stopped recurring post ID ${postId}`);
    return result.rows[0];
    
  } catch (error) {
    console.error('Error stopping recurring post:', error);
    throw error;
  }
};

module.exports = {
  REPOST_FREQUENCIES,
  calculateNextRepostDate,
  getPostsToRepost,
  createRepost,
  processRecurringPosts,
  getRepostHistory,
  stopRecurringPost
}; 