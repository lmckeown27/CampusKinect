const migration = require('./src/migrations/fix-conversation-recreation');

async function runMigration() {
  try {
    console.log('🚀 Running conversation recreation migration...');
    await migration.up();
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 