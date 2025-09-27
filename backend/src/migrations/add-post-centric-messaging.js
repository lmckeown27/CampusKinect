const { query } = require('../config/database');

async function up() {
  console.log('🚀 Starting post-centric messaging migration...');

  try {
    // 1. Make post_id NOT NULL in conversations table (it's already there but optional)
    await query(`
      -- First, update any existing conversations without post_id to have a default post
      UPDATE conversations 
      SET post_id = (
        SELECT p.id 
        FROM posts p 
        WHERE p.user_id = conversations.user1_id OR p.user_id = conversations.user2_id 
        ORDER BY p.created_at DESC 
        LIMIT 1
      )
      WHERE post_id IS NULL;
    `);

    // 2. Add constraint to make post_id required for new conversations
    await query(`
      ALTER TABLE conversations 
      ALTER COLUMN post_id SET NOT NULL;
    `);

    // 3. Add post context fields to conversations table
    await query(`
      ALTER TABLE conversations 
      ADD COLUMN IF NOT EXISTS post_title VARCHAR(500),
      ADD COLUMN IF NOT EXISTS post_description TEXT,
      ADD COLUMN IF NOT EXISTS post_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS post_author_id INTEGER REFERENCES users(id);
    `);

    // 4. Update existing conversations with post context
    await query(`
      UPDATE conversations 
      SET 
        post_title = p.title,
        post_description = p.description,
        post_type = p.post_type,
        post_author_id = p.user_id
      FROM posts p 
      WHERE conversations.post_id = p.id;
    `);

    // 5. Add indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_post_id ON conversations(post_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_post_author ON conversations(post_author_id);
    `);

    // 6. Add a unique constraint to prevent duplicate conversations for the same post between same users
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_post_users 
      ON conversations(post_id, LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id));
    `);

    console.log('✅ Post-centric messaging migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  console.log('🔄 Rolling back post-centric messaging migration...');

  try {
    // Remove the unique constraint
    await query(`DROP INDEX IF EXISTS idx_conversations_unique_post_users;`);
    
    // Remove indexes
    await query(`DROP INDEX IF EXISTS idx_conversations_post_id;`);
    await query(`DROP INDEX IF EXISTS idx_conversations_post_author;`);
    
    // Remove new columns
    await query(`
      ALTER TABLE conversations 
      DROP COLUMN IF EXISTS post_title,
      DROP COLUMN IF EXISTS post_description,
      DROP COLUMN IF EXISTS post_type,
      DROP COLUMN IF EXISTS post_author_id;
    `);
    
    // Make post_id nullable again
    await query(`
      ALTER TABLE conversations 
      ALTER COLUMN post_id DROP NOT NULL;
    `);

    console.log('✅ Migration rollback completed');

  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 