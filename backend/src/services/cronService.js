const cron = require('node-cron');
const { processRecurringPosts } = require('./recurringPostService');

/**
 * Cron Service
 * Handles scheduled tasks like processing recurring posts
 */

// Process recurring posts every day at 6:00 AM
const scheduleRecurringPostProcessing = () => {
  console.log('⏰ Scheduling recurring post processing for 6:00 AM daily...');
  
  cron.schedule('0 6 * * *', async () => {
    console.log('🕕 6:00 AM - Starting daily recurring post processing...');
    
    try {
      const result = await processRecurringPosts();
      console.log(`✅ Daily recurring post processing completed: ${result.reposted}/${result.processed} posts reposted`);
      
      if (result.errors.length > 0) {
        console.error(`❌ ${result.errors.length} posts failed to repost:`, result.errors);
      }
      
    } catch (error) {
      console.error('❌ Daily recurring post processing failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Los_Angeles" // Pacific Time
  });
  
  console.log('✅ Recurring post processing scheduled successfully');
};

// Process recurring posts every hour for testing (can be removed in production)
const scheduleHourlyProcessing = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode: Scheduling hourly recurring post processing...');
    
    cron.schedule('0 * * * *', async () => {
      console.log('🕐 Hourly recurring post processing (development mode)...');
      
      try {
        const result = await processRecurringPosts();
        console.log(`✅ Hourly processing completed: ${result.reposted}/${result.processed} posts reposted`);
        
      } catch (error) {
        console.error('❌ Hourly processing failed:', error);
      }
    });
    
    console.log('✅ Hourly processing scheduled for development');
  }
};

// Initialize all cron jobs
const initializeCronJobs = () => {
  try {
    scheduleRecurringPostProcessing();
    scheduleHourlyProcessing();
    
    console.log('🎯 All cron jobs initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
  }
};

// Manual trigger for testing
const triggerRecurringPostProcessing = async () => {
  console.log('🔧 Manually triggering recurring post processing...');
  
  try {
    const result = await processRecurringPosts();
    console.log(`✅ Manual processing completed: ${result.reposted}/${result.processed} posts reposted`);
    return result;
    
  } catch (error) {
    console.error('❌ Manual processing failed:', error);
    throw error;
  }
};

module.exports = {
  initializeCronJobs,
  triggerRecurringPostProcessing
}; 