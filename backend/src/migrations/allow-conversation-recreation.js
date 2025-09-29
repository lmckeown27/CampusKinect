const { query } = require('../config/database');

/**
 * Migration: Allow conversation recreation for same post
 * 
 * This migration:
 * 1. Adds is_active column if it doesn't exist
 * 2. Removes the unique constraint that prevents recreation
 * 3. Adds proper columns for post-centric conversations
 */

async function up() {
  try {
    console.log('🔄 Starting conversation recreation migration...');

    // Add is_active column if it doesn't exist
    await query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE
    `);
    console.log('✅ Added is_active column');

    // Add post-related columns if they don't exist
    await query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS post_title VARCHAR(500),
      ADD COLUMN IF NOT EXISTS post_description TEXT,
      ADD COLUMN IF NOT EXISTS post_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS post_author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('✅ Added post-centric columns');

    // Drop the unique constraint that prevents recreation
    // First check if the constraint exists
    const constraintCheck = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'conversations' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%user%'
    `);

    if (constraintCheck.rows.length > 0) {
      for (const constraint of constraintCheck.rows) {
        await query(`ALTER TABLE conversations DROP CONSTRAINT IF EXISTS ${constraint.constraint_name}`);
        console.log(`✅ Dropped constraint: ${constraint.constraint_name}`);
      }
    }

    // Create a new unique constraint that allows recreation when is_active = false
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS conversations_active_unique 
      ON conversations (post_id, user1_id, user2_id) 
      WHERE is_active = true
    `);
    console.log('✅ Created partial unique index for active conversations');

    // Update existing conversations to be active
    await query(`
      UPDATE conversations 
      SET is_active = true 
      WHERE is_active IS NULL
    `);
    console.log('✅ Updated existing conversations to active');

    console.log('🎉 Conversation recreation migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  try {
    console.log('🔄 Rolling back conversation recreation migration...');

    // Drop the partial unique index
    await query(`DROP INDEX IF EXISTS conversations_active_unique`);
    console.log('✅ Dropped partial unique index');

    // Recreate the original unique constraint (if needed)
    await query(`
      ALTER TABLE conversations 
      ADD CONSTRAINT conversations_user1_user2_key 
      UNIQUE (user1_id, user2_id)
    `);
    console.log('✅ Recreated original unique constraint');

    console.log('🎉 Migration rollback completed!');

  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down };

// Run migration if called directly
if (require.main === module) {
  up().then(() => {
    console.log('Migration completed');
    process.exit(0);
  }).catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
} 