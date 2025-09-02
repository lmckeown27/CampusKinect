const { query } = require('../config/database');

/**
 * Migration script to add timezone support to universities
 * Run this after adding the timezone column to update existing data
 */
const addTimezoneSupport = async () => {
  try {
    console.log('🕐 Starting timezone migration...');

    // Step 1: Ensure timezone column exists
    await query(`
      ALTER TABLE universities 
      ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Los_Angeles'
    `);
    console.log('✅ Timezone column ensured in universities table');

    // Step 2: Update existing universities with timezone based on their state/location
    const timezoneUpdates = [
      // Pacific Time (PST/PDT)
      { states: ['CA', 'WA', 'OR', 'NV'], timezone: 'America/Los_Angeles' },
      
      // Mountain Time (MST/MDT) 
      { states: ['CO', 'UT', 'AZ', 'NM', 'WY', 'MT', 'ID'], timezone: 'America/Denver' },
      
      // Central Time (CST/CDT)
      { states: ['TX', 'IL', 'MO', 'LA', 'AR', 'OK', 'KS', 'NE', 'IA', 'MN', 'WI', 'IN', 'MI', 'OH', 'KY', 'TN', 'MS', 'AL'], timezone: 'America/Chicago' },
      
      // Eastern Time (EST/EDT)
      { states: ['NY', 'MA', 'CT', 'RI', 'NH', 'VT', 'ME', 'NJ', 'PA', 'DE', 'MD', 'DC', 'VA', 'WV', 'NC', 'SC', 'GA', 'FL'], timezone: 'America/New_York' },
      
      // Alaska Time
      { states: ['AK'], timezone: 'America/Anchorage' },
      
      // Hawaii Time
      { states: ['HI'], timezone: 'Pacific/Honolulu' }
    ];

    // Apply timezone updates
    for (const update of timezoneUpdates) {
      const result = await query(`
        UPDATE universities 
        SET timezone = $1 
        WHERE state = ANY($2) AND (timezone IS NULL OR timezone = 'America/Los_Angeles')
      `, [update.timezone, update.states]);
      
      console.log(`✅ Updated ${result.rowCount} universities to ${update.timezone} timezone`);
    }

    // Step 3: Update Cal Poly specifically (primary university)
    await query(`
      UPDATE universities 
      SET timezone = 'America/Los_Angeles' 
      WHERE domain = 'calpoly.edu'
    `);
    console.log('✅ Updated Cal Poly SLO timezone');

    // Step 4: Verify the updates
    const universities = await query(`
      SELECT name, city, state, timezone 
      FROM universities 
      WHERE is_active = true 
      ORDER BY name
    `);
    
    console.log('\n🏫 University timezones updated:');
    universities.rows.forEach(uni => {
      console.log(`   ${uni.name} (${uni.city}, ${uni.state}): ${uni.timezone}`);
    });

    console.log('\n✅ Timezone migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Timezone migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  addTimezoneSupport()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addTimezoneSupport }; 