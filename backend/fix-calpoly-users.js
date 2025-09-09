// Load environment variables
require('dotenv').config();

const { query } = require('./src/config/database');
const { UNIVERSITY_CONFIG } = require('./src/config/university');

/**
 * Fix existing Cal Poly users who were assigned to wrong university
 * This script corrects users with @calpoly.edu emails to have the correct university ID
 */

async function fixCalPolyUsers() {
  try {
    console.log('🔧 Starting Cal Poly user university assignment fix...');
    
    // Test database connection first
    console.log('🔌 Testing database connection...');
    await query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // First, let's see what we're working with
    console.log('📊 Checking current Cal Poly users...');
    const currentCalPolyUsers = await query(`
      SELECT id, username, email, university_id, first_name, last_name
      FROM users 
      WHERE email LIKE '%@calpoly.edu'
      ORDER BY id
    `);
    
    console.log(`Found ${currentCalPolyUsers.rows.length} users with @calpoly.edu emails:`);
    currentCalPolyUsers.rows.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - University ID: ${user.university_id}`);
    });
    
    // Check what Cal Poly's ID should be
    const calPolyUniversity = await query(`
      SELECT id, name, domain FROM universities WHERE domain = 'calpoly.edu'
    `);
    
    let calPolyId;
    if (calPolyUniversity.rows.length > 0) {
      calPolyId = calPolyUniversity.rows[0].id;
      console.log(`✅ Found Cal Poly in database: ID ${calPolyId} - ${calPolyUniversity.rows[0].name}`);
    } else {
      calPolyId = UNIVERSITY_CONFIG.primaryUniversityId;
      console.log(`⚠️  Cal Poly not found in database, using fallback ID: ${calPolyId}`);
    }
    
    // Find users that need to be updated
    const usersToUpdate = currentCalPolyUsers.rows.filter(user => user.university_id !== calPolyId);
    
    if (usersToUpdate.length === 0) {
      console.log('✅ All Cal Poly users already have correct university assignment!');
      return;
    }
    
    console.log(`🔄 Need to update ${usersToUpdate.length} users from various universities to Cal Poly (ID ${calPolyId}):`);
    usersToUpdate.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email}): ${user.university_id} → ${calPolyId}`);
    });
    
    // Ask for confirmation (in production, you might want to remove this)
    console.log('\n⚠️  READY TO UPDATE USERS. Continue? This will:');
    console.log('   1. Update university_id for Cal Poly users');
    console.log('   2. This affects which posts/messages they can see');
    console.log('   3. This will fix university isolation issues');
    
    // Update the users
    console.log('\n🔄 Updating users...');
    
    for (const user of usersToUpdate) {
      console.log(`  Updating ${user.first_name} ${user.last_name} (ID: ${user.id})...`);
      
      await query(`
        UPDATE users 
        SET university_id = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [calPolyId, user.id]);
      
      console.log(`  ✅ Updated user ${user.id}: university_id ${user.university_id} → ${calPolyId}`);
    }
    
    // Verify the updates
    console.log('\n📊 Verification - Cal Poly users after update:');
    const updatedCalPolyUsers = await query(`
      SELECT id, username, email, university_id, first_name, last_name
      FROM users 
      WHERE email LIKE '%@calpoly.edu'
      ORDER BY id
    `);
    
    updatedCalPolyUsers.rows.forEach(user => {
      const status = user.university_id === calPolyId ? '✅' : '❌';
      console.log(`  ${status} ${user.first_name} ${user.last_name} (${user.email}) - University ID: ${user.university_id}`);
    });
    
    console.log(`\n🎉 Successfully updated ${usersToUpdate.length} Cal Poly users!`);
    console.log('📧 All @calpoly.edu users should now have correct university assignment.');
    console.log('🔒 University isolation should now work properly for messaging and posts.');
    
  } catch (error) {
    console.error('❌ Error fixing Cal Poly users:', error);
    
    // Provide more specific error information
    if (error.message.includes('SASL') || error.message.includes('password')) {
      console.error('💡 Database connection issue. Make sure:');
      console.error('   1. DATABASE_URL environment variable is set correctly');
      console.error('   2. Database credentials are valid');
      console.error('   3. Database server is accessible');
      console.error('   4. Try running: export DATABASE_URL="your_database_url_here"');
    }
    
    throw error;
  }
}

// Run the fix
if (require.main === module) {
  fixCalPolyUsers()
    .then(() => {
      console.log('\n✅ Cal Poly user fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cal Poly user fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixCalPolyUsers }; 