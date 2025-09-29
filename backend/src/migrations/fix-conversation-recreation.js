const { query } = require('../config/database');

const up = async () => {
  console.log('🔄 Fixing conversation recreation constraint...');
  
  try {
    // Drop the existing unique constraint
    await query(`
      ALTER TABLE conversations 
      DROP CONSTRAINT IF EXISTS conversations_user1_id_user2_id_post_id_key
    `);
    console.log('✅ Dropped old unique constraint');
    
    // Create a new partial unique constraint that only applies to active conversations
    await query(`
      CREATE UNIQUE INDEX conversations_active_unique 
      ON conversations (user1_id, user2_id, post_id) 
      WHERE is_active = true
    `);
    console.log('✅ Created new partial unique constraint for active conversations only');
    
    console.log('🎉 Conversation recreation fix completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const down = async () => {
  console.log('🔄 Reverting conversation recreation fix...');
  
  try {
    // Drop the partial unique index
    await query(`
      DROP INDEX IF EXISTS conversations_active_unique
    `);
    console.log('✅ Dropped partial unique constraint');
    
    // Recreate the original unique constraint
    await query(`
      ALTER TABLE conversations 
      ADD CONSTRAINT conversations_user1_id_user2_id_post_id_key 
      UNIQUE (user1_id, user2_id, post_id)
    `);
    console.log('✅ Restored original unique constraint');
    
    console.log('🎉 Migration rollback completed successfully');
    
  } catch (error) {
    console.error('❌ Migration rollback failed:', error);
    throw error;
  }
};

module.exports = { up, down }; 