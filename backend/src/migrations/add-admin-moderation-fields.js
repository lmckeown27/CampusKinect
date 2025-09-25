const { query } = require('../config/database');

/**
 * Migration: Add Admin and Moderation Fields
 * Purpose: Support Apple Guideline 1.2 compliance with admin moderation system
 * Date: 2024-01-XX
 */

const addAdminModerationFields = async () => {
  try {
    console.log('🔧 Starting admin moderation fields migration...');

    // Add admin fields to users table
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS ban_reason TEXT
    `);
    console.log('✅ Added admin fields to users table');

    // Add moderation fields to content_reports table
    await query(`
      ALTER TABLE content_reports 
      ADD COLUMN IF NOT EXISTS moderator_id INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS moderator_notes TEXT,
      ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP
    `);
    console.log('✅ Added moderation fields to content_reports table');

    // Add flagged content fields to posts table (if not already exists)
    await query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS flag_reason TEXT,
      ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS content_safety_score DECIMAL(3,2)
    `);
    console.log('✅ Added content safety fields to posts table');

    // Add flagged content fields to messages table
    await query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS deleted_reason TEXT,
      ADD COLUMN IF NOT EXISTS content_safety_score DECIMAL(3,2)
    `);
    console.log('✅ Added content safety fields to messages table');

    // Create indexes for performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_banned_at ON users(banned_at);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_content_reports_created_at ON content_reports(created_at);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_posts_is_flagged ON posts(is_flagged);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_messages_is_deleted ON messages(is_deleted);
    `);
    console.log('✅ Created performance indexes');

    // Note: Admin access is now restricted to specific user (lmckeown@calpoly.edu / liam_mckeown38)
    console.log('ℹ️ Admin access restricted to: lmckeown@calpoly.edu (liam_mckeown38)');

    console.log('🎉 Admin moderation fields migration completed successfully!');
    
    return {
      success: true,
      message: 'Admin moderation fields added successfully',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error in admin moderation fields migration:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  addAdminModerationFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addAdminModerationFields }; 