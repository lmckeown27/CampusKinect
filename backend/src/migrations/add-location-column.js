const { pool } = require('../config/database');

async function addLocationColumn() {
  try {
    // Add location column to posts table if it doesn't exist
    await pool.query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS location VARCHAR(255)
    `);
    
    console.log('✅ Location column added to posts table');
  } catch (error) {
    console.error('❌ Error adding location column:', error);
    throw error;
  }
}

module.exports = { addLocationColumn };

// Run migration if this file is executed directly
if (require.main === module) {
  addLocationColumn()
    .then(() => {
      console.log('Location column migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Location column migration failed:', error);
      process.exit(1);
    });
} 