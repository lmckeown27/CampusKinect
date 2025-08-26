#!/usr/bin/env node

/**
 * Database Setup Script for CampusConnect
 * Creates all required tables and initializes the database
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/campus_connect',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗄️ Database version:', result.rows[0].db_version.split(' ')[0]);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Create all tables
const createTables = async () => {
  try {
    console.log('\n🏗️ Creating database tables...');
    
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
        university_id INTEGER NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Universities table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS universities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) UNIQUE NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        country VARCHAR(100) DEFAULT 'USA',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        cluster_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Universities table created');

    // Clusters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clusters (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Clusters table created');

    // Posts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('offer', 'request', 'event')),
        duration_type VARCHAR(20) NOT NULL CHECK (duration_type IN ('one-time', 'recurring', 'event')),
        expires_at TIMESTAMP,
        event_start TIMESTAMP,
        event_end TIMESTAMP,
        is_fulfilled BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- Scoring fields
        message_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        bookmark_count INTEGER DEFAULT 0,
        repost_count INTEGER DEFAULT 0,
        engagement_score DECIMAL(10,2) DEFAULT 0.00,
        base_score DECIMAL(10,2) DEFAULT 25.00,
        time_urgency_bonus DECIMAL(10,2) DEFAULT 0.00,
        final_score DECIMAL(10,2) DEFAULT 25.00,
        review_count INTEGER DEFAULT 0,
        average_rating DECIMAL(3,2) DEFAULT 0.00,
        review_score_bonus DECIMAL(10,2) DEFAULT 0.00,
        -- Relative grading fields
        relative_grade CHAR(1) CHECK (relative_grade IN ('A', 'B', 'C', 'D')),
        market_size VARCHAR(20) DEFAULT 'small',
        -- Interaction tracking
        last_interaction_at TIMESTAMP,
        interaction_count INTEGER DEFAULT 0
      );
    `);
    console.log('✅ Posts table created');

    // Post universities junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_universities (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, university_id)
      );
    `);
    console.log('✅ Post universities table created');

    // Tags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tags table created');

    // Post tags junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, tag_id)
      );
    `);
    console.log('✅ Post tags table created');

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
    console.log('✅ Post images table created');

    // Conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        initiator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        participant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, initiator_id, participant_id)
      );
    `);
    console.log('✅ Conversations table created');

    // Messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Post interactions table for tracking user interactions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_interactions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('message', 'share', 'bookmark', 'repost', 'view')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id, interaction_type)
      );
    `);
    console.log('✅ Messages table created');

    // Create indexes for relative grading system
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_relative_grade ON posts(relative_grade);
      CREATE INDEX IF NOT EXISTS idx_posts_market_grade ON posts(market_size, relative_grade, final_score);
      CREATE INDEX IF NOT EXISTS idx_posts_interaction_tracking ON posts(last_interaction_at, interaction_count);
      CREATE INDEX IF NOT EXISTS idx_post_interactions_user_post ON post_interactions(user_id, post_id);
      CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);
    `);
    console.log('✅ Relative grading indexes created');

    // User sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User sessions table created');

    // Reviews table
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
    console.log('✅ Reviews table created');

    // Review responses table
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
    console.log('✅ Review responses table created');

    // Deleted reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deleted_reviews (
        id SERIAL PRIMARY KEY,
        original_review_id INTEGER,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        title VARCHAR(200),
        content TEXT NOT NULL,
        is_verified_customer BOOLEAN DEFAULT FALSE,
        is_anonymous BOOLEAN DEFAULT FALSE,
        deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        deletion_reason TEXT NOT NULL,
        deletion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        original_created_at TIMESTAMP,
        original_updated_at TIMESTAMP
      );
    `);
    console.log('✅ Deleted reviews table created');

    // Post interactions table (NEW - for personalized feed)
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
    console.log('✅ Post interactions table created');

    console.log('\n🎉 All tables created successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    return false;
  }
};

// Add scoring system fields to posts table
const addScoringFields = async () => {
  try {
    console.log('\n📊 Adding scoring system fields...');
    
    // Check if fields already exist
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' AND column_name IN ('base_score', 'time_urgency_bonus', 'final_score', 'target_scope', 'message_count', 'share_count', 'bookmark_count', 'repost_count', 'engagement_score', 'review_count', 'average_rating', 'review_score_bonus')
    `);
    
    const existingColumns = checkResult.rows.map(row => row.column_name);
    const requiredColumns = [
      'base_score', 'time_urgency_bonus', 'final_score', 'target_scope',
      'message_count', 'share_count', 'bookmark_count', 'repost_count', 'engagement_score',
      'review_count', 'average_rating', 'review_score_bonus'
    ];
    
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All scoring fields already exist');
      return true;
    }
    
    // Add missing columns
    for (const column of missingColumns) {
      let columnDefinition = '';
      
      switch (column) {
        case 'base_score':
          columnDefinition = 'ADD COLUMN base_score DECIMAL(5,2) DEFAULT 25.0';
          break;
        case 'time_urgency_bonus':
          columnDefinition = 'ADD COLUMN time_urgency_bonus DECIMAL(5,2) DEFAULT 0.0';
          break;
        case 'final_score':
          columnDefinition = 'ADD COLUMN final_score DECIMAL(5,2) DEFAULT 25.0';
          break;
        case 'target_scope':
          columnDefinition = 'ADD COLUMN target_scope VARCHAR(20) DEFAULT \'single\' CHECK (target_scope IN (\'single\', \'multi\', \'cluster\'))';
          break;
        case 'message_count':
          columnDefinition = 'ADD COLUMN message_count INTEGER DEFAULT 0';
          break;
        case 'share_count':
          columnDefinition = 'ADD COLUMN share_count INTEGER DEFAULT 0';
          break;
        case 'bookmark_count':
          columnDefinition = 'ADD COLUMN bookmark_count INTEGER DEFAULT 0';
          break;
        case 'repost_count':
          columnDefinition = 'ADD COLUMN repost_count INTEGER DEFAULT 0';
          break;
        case 'engagement_score':
          columnDefinition = 'ADD COLUMN engagement_score DECIMAL(5,2) DEFAULT 0.0';
          break;
        case 'review_count':
          columnDefinition = 'ADD COLUMN review_count INTEGER DEFAULT 0';
          break;
        case 'average_rating':
          columnDefinition = 'ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.0';
          break;
        case 'review_score_bonus':
          columnDefinition = 'ADD COLUMN review_score_bonus DECIMAL(5,2) DEFAULT 0.0';
          break;
      }
      
      if (columnDefinition) {
        await pool.query(`ALTER TABLE posts ${columnDefinition}`);
        console.log(`✅ Added column: ${column}`);
      }
    }
    
    console.log('🎉 All scoring fields added successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error adding scoring fields:', error);
    return false;
  }
};

// Create indexes for performance
const createIndexes = async () => {
  try {
    console.log('\n🚀 Creating database indexes...');
    
    const indexes = [
      // Users table indexes
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
      'CREATE INDEX IF NOT EXISTS idx_users_university_id ON users(university_id)',
      
      // Posts table indexes
      'CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_posts_university_id ON posts(university_id)',
      'CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type)',
      'CREATE INDEX IF NOT EXISTS idx_posts_duration_type ON posts(duration_type)',
      'CREATE INDEX IF NOT EXISTS idx_posts_is_active ON posts(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_posts_final_score ON posts(final_score)',
      'CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_posts_target_scope ON posts(target_scope)',
      
      // Post interactions table indexes (NEW)
      'CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type)',
      'CREATE INDEX IF NOT EXISTS idx_post_interactions_created_at ON post_interactions(created_at)',
      
      // Reviews table indexes
      'CREATE INDEX IF NOT EXISTS idx_reviews_post_id ON reviews(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id)',
      'CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)',
      
      // Deleted reviews table indexes
      'CREATE INDEX IF NOT EXISTS idx_deleted_reviews_post_id ON deleted_reviews(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_deleted_reviews_deleted_by ON deleted_reviews(deleted_by)',
      'CREATE INDEX IF NOT EXISTS idx_deleted_reviews_deletion_timestamp ON deleted_reviews(deletion_timestamp)',
      
      // Other table indexes
      'CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_post_id ON conversations(post_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_initiator_id ON conversations(initiator_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_participant_id ON conversations(participant_id)'
    ];
    
    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }
    
    console.log('✅ All indexes created successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    return false;
  }
};

// Insert sample data for testing
const insertSampleData = async () => {
  try {
    console.log('\n📝 Inserting sample data...');
    
    // Check if sample data already exists
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('✅ Sample data already exists, skipping...');
      return true;
    }
    
    // Insert sample university
    const universityResult = await pool.query(`
      INSERT INTO universities (name, domain, city, state, country) 
      VALUES ('Cal Poly San Luis Obispo', 'calpoly.edu', 'San Luis Obispo', 'CA', 'USA')
      RETURNING id
    `);
    const universityId = universityResult.rows[0].id;
    console.log('✅ Sample university created (ID:', universityId, ')');
    
    // Insert sample user
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, university_id, is_verified)
      VALUES ('testuser', 'test@calpoly.edu', '$2b$12$test.hash.for.testing', 'Test', 'User', $1, true)
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    console.log('✅ Sample user created (ID:', userId, ')');
    
    // Insert sample tags
    const tags = [
      'housing', 'apartment', 'lease', 'roommate', 'sublet',
      'tutoring', 'homework', 'study', 'academic', 'math',
      'textbook', 'book', 'reading', 'course', 'education',
      'ride', 'carpool', 'transport', 'drive', 'travel',
      'food', 'dining', 'meal', 'cooking', 'restaurant',
      'sport', 'athletic', 'game', 'tournament', 'fitness',
      'rush', 'greek', 'fraternity', 'sorority', 'recruitment',
      'philanthropy', 'charity', 'community', 'service', 'volunteer',
      'lecture', 'workshop', 'seminar', 'conference',
      'party', 'club', 'entertainment', 'music',
      'cultural', 'diversity', 'heritage', 'international', 'celebration'
    ];
    
    for (const tagName of tags) {
      await pool.query(`
        INSERT INTO tags (name, category) 
        VALUES ($1, CASE 
          WHEN $1 IN ('housing', 'apartment', 'lease', 'roommate', 'sublet') THEN 'leasing'
          WHEN $1 IN ('tutoring', 'homework', 'study', 'academic', 'math', 'science', 'english') THEN 'tutoring'
          WHEN $1 IN ('textbook', 'book', 'reading', 'course', 'education') THEN 'books'
          WHEN $1 IN ('ride', 'carpool', 'transport', 'drive', 'travel') THEN 'rides'
          WHEN $1 IN ('food', 'dining', 'meal', 'cooking', 'restaurant') THEN 'food'
          WHEN $1 IN ('sport', 'athletic', 'game', 'tournament', 'fitness') THEN 'sport'
          WHEN $1 IN ('rush', 'greek', 'fraternity', 'sorority', 'recruitment') THEN 'rush'
          WHEN $1 IN ('philanthropy', 'charity', 'community', 'service', 'volunteer') THEN 'philanthropy'
          WHEN $1 IN ('lecture', 'workshop', 'seminar', 'conference') THEN 'academic'
          WHEN $1 IN ('party', 'club', 'entertainment', 'music') THEN 'social'
          WHEN $1 IN ('cultural', 'diversity', 'heritage', 'international', 'celebration') THEN 'cultural'
          ELSE 'general'
        END)
        ON CONFLICT (name) DO NOTHING
      `, [tagName]);
    }
    console.log('✅ Sample tags created');
    
    console.log('🎉 Sample data inserted successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error inserting sample data:', error);
    return false;
  }
};

// Main setup function
const setupDatabase = async () => {
  try {
    console.log('🚀 CampusConnect Database Setup\n');
    
    // Test connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Create tables
    const tablesOk = await createTables();
    if (!tablesOk) {
      console.error('❌ Failed to create tables');
      process.exit(1);
    }
    
    // Add scoring fields
    const scoringOk = await addScoringFields();
    if (!scoringOk) {
      console.error('❌ Failed to add scoring fields');
      process.exit(1);
    }
    
    // Create indexes
    const indexesOk = await createIndexes();
    if (!indexesOk) {
      console.error('❌ Failed to create indexes');
      process.exit(1);
    }
    
    // Insert sample data
    const sampleDataOk = await insertSampleData();
    if (!sampleDataOk) {
      console.error('❌ Failed to insert sample data');
      process.exit(1);
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test the personalized feed endpoint');
    console.log('   2. Verify bookmark functionality');
    console.log('   3. Test fresh content prioritization');
    console.log('   4. Deploy to production');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, testConnection }; 