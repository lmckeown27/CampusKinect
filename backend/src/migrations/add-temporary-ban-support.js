const { query } = require('../config/database');

async function up() {
  console.log('📦 Running migration: add-temporary-ban-support');
  
  try {
    // Add ban_until column to users table
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS ban_until TIMESTAMP
    `);
    
    console.log('✅ Added ban_until column to users table');
    
    // Update auth middleware logic (handled in code, not migration)
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function down() {
  console.log('📦 Rolling back migration: add-temporary-ban-support');
  
  try {
    await query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS ban_until
    `);
    
    console.log('✅ Rollback completed successfully');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 