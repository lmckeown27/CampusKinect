const { query } = require('../config/database');

async function up() {
  console.log('📱 Creating notification_logs table...');
  
  await query(`
    CREATE TABLE IF NOT EXISTS notification_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'general',
      results JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster lookups
  await query(`
    CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
  `);

  console.log('✅ notification_logs table created successfully');
}

async function down() {
  console.log('📱 Dropping notification_logs table...');
  
  await query('DROP TABLE IF EXISTS notification_logs CASCADE');
  
  console.log('✅ notification_logs table dropped successfully');
}

module.exports = { up, down }; 