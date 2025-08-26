#!/usr/bin/env node

/**
 * Migration Script for Relative Grading System
 * Adds missing fields to existing database for the new grading system
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

// Add missing columns to posts table
const addMissingColumns = async () => {
  try {
    console.log('\n🏗️ Adding missing columns to posts table...');
    
    // Check if columns already exist
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'posts' 
      AND column_name IN ('relative_grade', 'market_size', 'message_count', 'share_count', 'bookmark_count', 'repost_count', 'engagement_score', 'base_score', 'time_urgency_bonus', 'final_score', 'review_count', 'average_rating', 'review_score_bonus', 'last_interaction_at', 'interaction_count')
    `;
    
    const existingColumns = await pool.query(checkColumnsQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    
    console.log('📋 Existing columns:', existingColumnNames);
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'message_count', type: 'INTEGER DEFAULT 0' },
      { name: 'share_count', type: 'INTEGER DEFAULT 0' },
      { name: 'bookmark_count', type: 'INTEGER DEFAULT 0' },
      { name: 'repost_count', type: 'INTEGER DEFAULT 0' },
      { name: 'engagement_score', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'base_score', type: 'DECIMAL(10,2) DEFAULT 25.00' },
      { name: 'time_urgency_bonus', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'final_score', type: 'DECIMAL(10,2) DEFAULT 25.00' },
      { name: 'review_count', type: 'INTEGER DEFAULT 0' },
      { name: 'average_rating', type: 'DECIMAL(3,2) DEFAULT 0.00' },
      { name: 'review_score_bonus', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'relative_grade', type: 'CHAR(1) CHECK (relative_grade IN (\'A\', \'B\', \'C\', \'D\'))' },
      { name: 'market_size', type: 'VARCHAR(20) DEFAULT \'small\'' },
      { name: 'last_interaction_at', type: 'TIMESTAMP' },
      { name: 'interaction_count', type: 'INTEGER DEFAULT 0' }
    ];
    
    let addedCount = 0;
    
    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          const addColumnQuery = `ALTER TABLE posts ADD COLUMN ${column.name} ${column.type}`;
          await pool.query(addColumnQuery);
          console.log(`✅ Added column: ${column.name}`);
          addedCount++;
        } catch (error) {
          console.error(`❌ Failed to add column ${column.name}:`, error.message);
        }
      } else {
        console.log(`ℹ️ Column ${column.name} already exists`);
      }
    }
    
    console.log(`✅ Added ${addedCount} new columns to posts table`);
    
  } catch (error) {
    console.error('❌ Error adding missing columns:', error);
    throw error;
  }
};

// Create post_interactions table if it doesn't exist
const createPostInteractionsTable = async () => {
  try {
    console.log('\n🏗️ Creating post_interactions table...');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS post_interactions (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('message', 'share', 'bookmark', 'repost', 'view')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(post_id, user_id, interaction_type)
      );
    `;
    
    await pool.query(createTableQuery);
    console.log('✅ post_interactions table created/verified');
    
  } catch (error) {
    console.error('❌ Error creating post_interactions table:', error);
    throw error;
  }
};

// Create indexes for the grading system
const createGradingIndexes = async () => {
  try {
    console.log('\n🏗️ Creating grading system indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_posts_relative_grade ON posts(relative_grade)',
      'CREATE INDEX IF NOT EXISTS idx_posts_market_grade ON posts(market_size, relative_grade, final_score)',
      'CREATE INDEX IF NOT EXISTS idx_posts_interaction_tracking ON posts(last_interaction_at, interaction_count)',
      'CREATE INDEX IF NOT EXISTS idx_post_interactions_user_post ON post_interactions(user_id, post_id)',
      'CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await pool.query(indexQuery);
        console.log(`✅ Created index: ${indexQuery.split('idx_')[1].split(' ')[0]}`);
      } catch (error) {
        console.error(`❌ Failed to create index:`, error.message);
      }
    }
    
    console.log('✅ Grading system indexes created');
    
  } catch (error) {
    console.error('❌ Error creating grading indexes:', error);
    throw error;
  }
};

// Initialize default values for existing posts
const initializeDefaultValues = async () => {
  try {
    console.log('\n🏗️ Initializing default values for existing posts...');
    
    // Set default scores for posts without them
    const updateScoresQuery = `
      UPDATE posts 
      SET 
        message_count = COALESCE(message_count, 0),
        share_count = COALESCE(share_count, 0),
        bookmark_count = COALESCE(bookmark_count, 0),
        repost_count = COALESCE(repost_count, 0),
        engagement_score = COALESCE(engagement_score, 0.00),
        base_score = COALESCE(base_score, 25.00),
        time_urgency_bonus = COALESCE(time_urgency_bonus, 0.00),
        final_score = COALESCE(final_score, 25.00),
        review_count = COALESCE(review_count, 0),
        average_rating = COALESCE(average_rating, 0.00),
        review_score_bonus = COALESCE(review_score_bonus, 0.00),
        market_size = COALESCE(market_size, 'small'),
        interaction_count = COALESCE(interaction_count, 0)
      WHERE id > 0
    `;
    
    const result = await pool.query(updateScoresQuery);
    console.log(`✅ Updated ${result.rowCount} posts with default values`);
    
  } catch (error) {
    console.error('❌ Error initializing default values:', error);
    throw error;
  }
};

// Run the migration
const runMigration = async () => {
  try {
    console.log('🚀 Starting Relative Grading System Migration...\n');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Run migration steps
    await addMissingColumns();
    await createPostInteractionsTable();
    await createGradingIndexes();
    await initializeDefaultValues();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the market size detection service');
    console.log('2. Calculate initial grades for all markets');
    console.log('3. Test the new API endpoints');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  addMissingColumns,
  createPostInteractionsTable,
  createGradingIndexes,
  initializeDefaultValues
}; 