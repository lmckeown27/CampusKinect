const { query } = require('../config/database');

/**
 * Migration: Allow Multiple Report Reasons
 * Purpose: Allow users to select multiple reasons when reporting content
 * Changes:
 * - Remove CHECK constraint on reason column
 * - Change reason from VARCHAR(50) to TEXT to allow comma-separated values
 */

const up = async () => {
  console.log('🔄 Running migration: Allow Multiple Report Reasons...');

  try {
    // First, drop the CHECK constraint on the reason column
    // The constraint name should be "content_reports_reason_check"
    await query(`
      ALTER TABLE content_reports 
      DROP CONSTRAINT IF EXISTS content_reports_reason_check;
    `);
    console.log('✅ Dropped CHECK constraint on reason column');

    // Change the reason column from VARCHAR(50) to TEXT
    await query(`
      ALTER TABLE content_reports 
      ALTER COLUMN reason TYPE TEXT;
    `);
    console.log('✅ Changed reason column to TEXT type');

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const down = async () => {
  console.log('🔄 Rolling back migration: Allow Multiple Report Reasons...');

  try {
    // Restore VARCHAR(50) type
    await query(`
      ALTER TABLE content_reports 
      ALTER COLUMN reason TYPE VARCHAR(50);
    `);
    
    // Re-add the CHECK constraint
    await query(`
      ALTER TABLE content_reports 
      ADD CONSTRAINT content_reports_reason_check 
      CHECK (reason IN (
        'harassment', 'hate_speech', 'spam', 'inappropriate_content', 
        'scam', 'violence', 'sexual_content', 'false_information', 'other'
      ));
    `);
    
    console.log('✅ Rollback completed successfully');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

module.exports = { up, down }; 