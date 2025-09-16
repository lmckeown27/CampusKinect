const { Pool } = require('pg');

// Database connection - uses same config as main app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

async function deleteUserByEmail(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // First, find the user
    const findUserQuery = `
      SELECT id, username, email, first_name, last_name, created_at
      FROM users 
      WHERE email = $1
    `;
    
    const userResult = await pool.query(findUserQuery, [email]);
    
    if (userResult.rows.length === 0) {
      console.log(`❌ No user found with email: ${email}`);
      return false;
    }
    
    const user = userResult.rows[0];
    console.log(`✅ Found user:`, {
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      created_at: user.created_at
    });
    
    // Delete the user (this will cascade delete related records)
    const deleteQuery = `
      DELETE FROM users 
      WHERE email = $1
      RETURNING id, username, email
    `;
    
    const deleteResult = await pool.query(deleteQuery, [email]);
    
    if (deleteResult.rows.length > 0) {
      console.log(`🗑️  Successfully deleted user:`, deleteResult.rows[0]);
      return true;
    } else {
      console.log(`❌ Failed to delete user with email: ${email}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address');
  console.log('Usage: node delete-user.js user@example.com');
  process.exit(1);
}

// Run the deletion
deleteUserByEmail(email).then((success) => {
  if (success) {
    console.log('✅ User deletion completed successfully');
  } else {
    console.log('❌ User deletion failed');
  }
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}); 