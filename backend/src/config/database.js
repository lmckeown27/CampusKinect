const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Create tables if they don't exist
const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        display_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
        profile_picture VARCHAR(500),
        year INTEGER,
        major VARCHAR(200),
        hometown VARCHAR(200),
        bio TEXT,
        university_id INTEGER NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        verification_code VARCHAR(10),
        verification_code_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add verification code columns to existing users table if they don't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10),
        ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP
      `);
      console.log('✅ Verification code columns added to users table');
    } catch (error) {
      console.log('ℹ️ Verification code columns already exist or could not be added:', error.message);
    }

    // Add bio column to existing users table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS bio TEXT
      `);
      console.log('✅ Bio column added to users table');
    } catch (error) {
      console.log('ℹ️ Bio column already exists or could not be added:', error.message);
    }

    // Universities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS universities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'US',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',
        cluster_id INTEGER,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add timezone column to existing universities table if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE universities 
        ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Los_Angeles'
      `);
      console.log('✅ Timezone column added to universities table');
    } catch (error) {
      console.log('ℹ️ Timezone column already exists or could not be added:', error.message);
    }

    // Clusters table (geographic clusters)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clusters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('goods', 'services', 'housing', 'events')),
        duration_type VARCHAR(20) NOT NULL CHECK (duration_type IN ('one-time', 'recurring', 'event')),
        location VARCHAR(255),
        expires_at TIMESTAMP,
        event_start TIMESTAMP,
        event_end TIMESTAMP,
        is_fulfilled BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post universities junction table for multi-university posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_universities (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, university_id)
      );
    `);

    // Tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post tags junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );
    `);

    // Post images table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_images (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        image_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post drafts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_drafts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        content TEXT DEFAULT '',
        post_type VARCHAR(20),
        primary_tags TEXT[] DEFAULT '{}',
        secondary_tags TEXT[] DEFAULT '{}',
        images TEXT[] DEFAULT '{}',
        event_details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, university_id)
      );
    `);

    // Conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id, post_id),
        CHECK (user1_id != user2_id)
      );
    `);

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'contact', 'location', 'file')),
        media_url VARCHAR(500),
        is_read BOOLEAN DEFAULT FALSE,
        is_deleted BOOLEAN DEFAULT FALSE,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Message requests table for users who haven't been contacted yet
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_requests (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ignored')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_user_id, to_user_id, post_id)
        -- Temporarily disabled for testing: CHECK (from_user_id != to_user_id)
      );
    `);

    // User sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        refresh_token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reviews table for recurring posts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(200),
        content TEXT NOT NULL,
        is_verified_customer BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, reviewer_id)
      );
    `);

    // Review responses table for post owners to respond to reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_responses (
        id SERIAL PRIMARY KEY,
        review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
        responder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Deleted reviews table for tracking deleted reviews with reasons
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deleted_reviews (
        id SERIAL PRIMARY KEY,
        original_review_id INTEGER, -- Keep reference to original review ID
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        title VARCHAR(200),
        content TEXT NOT NULL,
        is_verified_customer BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Post owner who deleted it
        deletion_reason TEXT NOT NULL, -- Required reason for deletion
        deletion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        original_created_at TIMESTAMP, -- When the review was originally created
        original_updated_at TIMESTAMP -- When the review was last updated
      );
    `);

    // Post interactions table for tracking user interactions (messages, shares, bookmarks, reposts)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_interactions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('message', 'share', 'bookmark', 'repost')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id, interaction_type)
      );
    `);

    // Add scoring system fields
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS base_score DECIMAL(10, 2) DEFAULT 50.00;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS time_urgency_bonus DECIMAL(10, 2) DEFAULT 0.00;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS final_score DECIMAL(10, 2) DEFAULT 50.00;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS target_scope VARCHAR(20) DEFAULT 'single' CHECK (target_scope IN ('single', 'multi'));
    `);

    // Add review system fields to posts
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0.00;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS review_score_bonus DECIMAL(10, 2) DEFAULT 0.00;
    `);

    // Add engagement tracking columns to posts
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS engagement_score DECIMAL(10, 2) DEFAULT 0.00;
    `);

    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_university_id ON posts(university_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_expires_at ON posts(expires_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active)');
    
    // Message system indexes
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_post_id ON conversations(post_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_message_requests_from_user_id ON message_requests(from_user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_message_requests_to_user_id ON message_requests(to_user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_message_requests_status ON message_requests(status)');

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Initialize database
const initDatabase = async () => {
  try {
    await createTables();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization if this file is run directly
if (require.main === module) {
  initDatabase();
}

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase
}; 