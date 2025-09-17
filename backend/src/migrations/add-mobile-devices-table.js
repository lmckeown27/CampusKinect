const { query } = require('../config/database');

async function up() {
  console.log('📱 Creating mobile_devices table...');
  
  await query(`
    CREATE TABLE IF NOT EXISTS mobile_devices (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device_token VARCHAR(255) NOT NULL,
      platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android')),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, device_token)
    )
  `);

  // Create index for faster lookups
  await query(`
    CREATE INDEX IF NOT EXISTS idx_mobile_devices_user_id ON mobile_devices(user_id);
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_mobile_devices_active ON mobile_devices(is_active) WHERE is_active = true;
  `);

  console.log('✅ mobile_devices table created successfully');
}

async function down() {
  console.log('📱 Dropping mobile_devices table...');
  
  await query('DROP TABLE IF EXISTS mobile_devices CASCADE');
  
  console.log('✅ mobile_devices table dropped successfully');
}

module.exports = { up, down }; 