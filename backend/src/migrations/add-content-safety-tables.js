const { query } = require('../config/database');

/**
 * Migration: Add Content Safety Tables
 * Creates tables for content reporting and user blocking functionality
 * Required for App Store compliance with user-generated content guidelines
 */

const up = async () => {
  console.log('🔄 Running migration: Add Content Safety Tables...');

  try {
    // Create content_reports table
    await query(`
      CREATE TABLE IF NOT EXISTS content_reports (
        id SERIAL PRIMARY KEY,
        reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_id INTEGER NOT NULL,
        content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('post', 'message', 'user')),
        content_author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(50) NOT NULL CHECK (reason IN (
          'harassment', 'hate_speech', 'spam', 'inappropriate_content', 
          'scam', 'violence', 'sexual_content', 'false_information', 'other'
        )),
        details TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
        moderator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        moderator_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        
        -- Prevent duplicate reports from same user for same content
        UNIQUE(reporter_id, content_id, content_type)
      );
    `);
    console.log('✅ Created content_reports table');

    // Create user_blocks table
    await query(`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id SERIAL PRIMARY KEY,
        blocker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        blocked_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Prevent duplicate blocks and self-blocking
        UNIQUE(blocker_id, blocked_id),
        CHECK (blocker_id != blocked_id)
      );
    `);
    console.log('✅ Created user_blocks table');

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_content_reports_status 
      ON content_reports(status, created_at);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_content_reports_content 
      ON content_reports(content_type, content_id);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_content_reports_reporter 
      ON content_reports(reporter_id, created_at);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker 
      ON user_blocks(blocker_id);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked 
      ON user_blocks(blocked_id);
    `);
    console.log('✅ Created indexes for content safety tables');

    // Add content safety fields to posts table if they don't exist
    await query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(50),
      ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS content_safety_score INTEGER DEFAULT 100 CHECK (content_safety_score >= 0 AND content_safety_score <= 100);
    `);
    console.log('✅ Added content safety fields to posts table');

    // Add content safety fields to messages table if they don't exist
    await query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS flag_reason VARCHAR(50),
      ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS content_safety_score INTEGER DEFAULT 100 CHECK (content_safety_score >= 0 AND content_safety_score <= 100);
    `);
    console.log('✅ Added content safety fields to messages table');

    console.log('✅ Migration completed: Add Content Safety Tables');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const down = async () => {
  console.log('🔄 Rolling back migration: Add Content Safety Tables...');

  try {
    // Remove content safety fields from messages table
    await query(`
      ALTER TABLE messages 
      DROP COLUMN IF EXISTS is_flagged,
      DROP COLUMN IF EXISTS flag_reason,
      DROP COLUMN IF EXISTS flagged_at,
      DROP COLUMN IF EXISTS content_safety_score;
    `);

    // Remove content safety fields from posts table
    await query(`
      ALTER TABLE posts 
      DROP COLUMN IF EXISTS is_flagged,
      DROP COLUMN IF EXISTS flag_reason,
      DROP COLUMN IF EXISTS flagged_at,
      DROP COLUMN IF EXISTS content_safety_score;
    `);

    // Drop indexes
    await query('DROP INDEX IF EXISTS idx_user_blocks_blocked;');
    await query('DROP INDEX IF EXISTS idx_user_blocks_blocker;');
    await query('DROP INDEX IF EXISTS idx_content_reports_reporter;');
    await query('DROP INDEX IF EXISTS idx_content_reports_content;');
    await query('DROP INDEX IF EXISTS idx_content_reports_status;');

    // Drop tables
    await query('DROP TABLE IF EXISTS user_blocks;');
    await query('DROP TABLE IF EXISTS content_reports;');

    console.log('✅ Migration rollback completed: Add Content Safety Tables');

  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
};

module.exports = { up, down }; 