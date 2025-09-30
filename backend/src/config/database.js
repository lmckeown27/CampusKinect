const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 8, // Further reduced to prevent connection exhaustion
  min: 1,  // Reduce minimum connections
  idleTimeoutMillis: 30000, // Reduce idle timeout to free connections faster
  connectionTimeoutMillis: 10000, // Increase connection timeout
  acquireTimeoutMillis: 15000, // Reduce acquire timeout to fail faster
  statement_timeout: 30000, // Add statement timeout (30 seconds)
  query_timeout: 30000, // Add query timeout (30 seconds)
});

// Test initial connection (only log once)
let connectionTested = false;
pool.on('connect', (client) => {
  if (!connectionTested) {
    console.log('✅ Connected to PostgreSQL database');
    connectionTested = true;
  }
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
  // Don't exit process - let the app continue with degraded functionality
});

// Add connection pool monitoring
pool.on('acquire', () => {
  // Optionally log connection acquisition in debug mode
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('🔗 Database connection acquired');
  }
});

pool.on('release', () => {
  // Optionally log connection release in debug mode
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('🔓 Database connection released');
  }
});

// Database query function with better error handling
const query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

// Create tables function
const createTables = async () => {
  try {
    // Existing tables creation...
    
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        display_name VARCHAR(200),
        profile_picture TEXT,
        year INTEGER,
        major VARCHAR(100),
        hometown VARCHAR(100),
        bio TEXT,
        university_id INTEGER REFERENCES universities(id),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        notification_preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Universities table
    await query(`
      CREATE TABLE IF NOT EXISTS universities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE NOT NULL,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'US',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Posts table
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        category VARCHAR(50),
        subcategory VARCHAR(50),
        location VARCHAR(255),
        duration_type VARCHAR(20) DEFAULT 'permanent',
        camera_metadata JSONB DEFAULT '{}',
        engagement_score DECIMAL(10,2) DEFAULT 0.0,
        message_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        bookmark_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Post images table
    await query(`
      CREATE TABLE IF NOT EXISTS post_images (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        image_order INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tags table
    await query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Post tags junction table
    await query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      )
    `);

    // Post interactions table
    await query(`
      CREATE TABLE IF NOT EXISTS post_interactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'bookmark', 'repost', 'share', 'message')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id, interaction_type)
      )
    `);

    // Conversations table
    await query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id)
      )
    `);

    // Messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Message requests table
    await query(`
      CREATE TABLE IF NOT EXISTS message_requests (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(from_user_id, to_user_id)
      )
    `);

    // **NEW MOBILE-SPECIFIC TABLES**

    // Mobile devices table for push notifications
    await query(`
      CREATE TABLE IF NOT EXISTS mobile_devices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_token TEXT NOT NULL,
        platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
        app_version VARCHAR(20),
        os_version VARCHAR(20),
        device_model VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, device_token)
      )
    `);

    // Notification logs table
    await query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        results JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Offline sync queue table
    await query(`
      CREATE TABLE IF NOT EXISTS offline_sync_queue (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        action_data JSONB NOT NULL,
        client_timestamp TIMESTAMP NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        failed BOOLEAN DEFAULT FALSE,
        retry_count INTEGER DEFAULT 0,
        last_error TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // App analytics table for mobile usage tracking
    await query(`
      CREATE TABLE IF NOT EXISTS mobile_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB DEFAULT '{}',
        platform VARCHAR(10) NOT NULL,
        app_version VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Camera uploads metadata table
    await query(`
      CREATE TABLE IF NOT EXISTS camera_uploads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        camera_metadata JSONB DEFAULT '{}',
        location_data JSONB DEFAULT '{}',
        processing_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User preferences for mobile app
    await query(`
      CREATE TABLE IF NOT EXISTS mobile_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        preference_key VARCHAR(100) NOT NULL,
        preference_value JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, preference_key)
      )
    `);

    // Biometric authentication tokens
    await query(`
      CREATE TABLE IF NOT EXISTS biometric_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        encrypted_token TEXT NOT NULL,
        biometric_type VARCHAR(20) NOT NULL CHECK (biometric_type IN ('touchid', 'faceid', 'fingerprint')),
        is_active BOOLEAN DEFAULT TRUE,
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        revoked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, device_id)
      )
    `);

    // Biometric audit log
    await query(`
      CREATE TABLE IF NOT EXISTS biometric_audit_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        device_id VARCHAR(255) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}',
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Deep links table
    await query(`
      CREATE TABLE IF NOT EXISTS deep_links (
        id SERIAL PRIMARY KEY,
        link_id VARCHAR(32) UNIQUE NOT NULL,
        link_type VARCHAR(50) NOT NULL,
        link_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    // Deep link analytics
    await query(`
      CREATE TABLE IF NOT EXISTS deep_link_analytics (
        id SERIAL PRIMARY KEY,
        link_id VARCHAR(32) REFERENCES deep_links(link_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        device_info JSONB DEFAULT '{}',
        clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        share_clicked BOOLEAN DEFAULT FALSE,
        share_clicked_at TIMESTAMP
      )
    `);

    // User referrals table
    await query(`
      CREATE TABLE IF NOT EXISTS user_referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        referred_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        referral_type VARCHAR(50) DEFAULT 'general',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(referrer_id, referred_id)
      )
    `);

    // Campus locations table
    await query(`
      CREATE TABLE IF NOT EXISTS campus_locations (
        id SERIAL PRIMARY KEY,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        keywords TEXT[] DEFAULT '{}',
        coordinates POINT,
        metadata JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(university_id, name)
      )
    `);

    // Create indexes for mobile optimization
    await query(`CREATE INDEX IF NOT EXISTS idx_mobile_devices_user_id ON mobile_devices(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_mobile_devices_token ON mobile_devices(device_token)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_offline_sync_user_processed ON offline_sync_queue(user_id, processed)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_offline_sync_retry ON offline_sync_queue(retry_count, processed)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_mobile_analytics_user_event ON mobile_analytics(user_id, event_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_mobile_analytics_created_at ON mobile_analytics(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_camera_uploads_user_id ON camera_uploads(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_camera_uploads_post_id ON camera_uploads(post_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_mobile_preferences_user_key ON mobile_preferences(user_id, preference_key)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_biometric_tokens_user_device ON biometric_tokens(user_id, device_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_biometric_tokens_expires ON biometric_tokens(expires_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_biometric_audit_user_event ON biometric_audit_log(user_id, event_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_deep_links_id ON deep_links(link_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_deep_links_expires ON deep_links(expires_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_deep_link_analytics_link ON deep_link_analytics(link_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_deep_link_analytics_user ON deep_link_analytics(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_referrals_referrer ON user_referrals(referrer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_referrals_referred ON user_referrals(referred_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_campus_locations_university ON campus_locations(university_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_campus_locations_category ON campus_locations(category)`);

    // Create indexes for existing tables to optimize mobile queries
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_posts_engagement_score ON posts(engagement_score DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_post_interactions_user_post ON post_interactions(user_id, post_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_post_interactions_post_type ON post_interactions(post_id, interaction_type)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id)`);

    console.log('✅ All database tables and indexes created successfully');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Add columns to existing tables for mobile support
const addMobileColumns = async () => {
  try {
    // Add notification preferences to users table if not exists
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}'
    `);

    // Add camera metadata to posts table if not exists
    await query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS camera_metadata JSONB DEFAULT '{}'
    `);

    // Add engagement metrics to posts table if not exists
    await query(`
      ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bookmark_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS repost_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS engagement_score DECIMAL(10,2) DEFAULT 0.0
    `);

    // Add metadata to post_images table if not exists
    await query(`
      ALTER TABLE post_images 
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'
    `);

    console.log('✅ Mobile columns added successfully');

  } catch (error) {
    console.error('❌ Error adding mobile columns:', error);
    // Don't throw error as columns might already exist
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    // Skip table creation in production since tables already exist
    if (process.env.NODE_ENV === 'production') {
      console.log('🏗️ Skipping table creation - using existing production database');
      console.log('✅ Database initialization complete (production mode)');
    } else {
      // Only create tables in development/test environments
      await createTables();
      await addMobileColumns();
      console.log('✅ Database initialization complete');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

module.exports = { 
  query, 
  pool, 
  createTables, 
  addMobileColumns, 
  initializeDatabase 
};