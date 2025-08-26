const cron = require('node-cron');
const { processRecurringPosts } = require('./recurringPostService');
const relativeGradingService = require('./relativeGradingService');
const marketSizeService = require('./marketSizeService');

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

// Update market sizes every day at 2:00 AM
const scheduleMarketSizeUpdates = () => {
  console.log('⏰ Scheduling market size updates for 2:00 AM daily...');
  
  cron.schedule('0 2 * * *', async () => {
    console.log('🕕 2:00 AM - Starting daily market size updates...');
    
    try {
      const result = await marketSizeService.updateAllMarketSizes();
      console.log(`✅ Daily market size updates completed: ${result.updated} universities updated`);
      
      // Update post market sizes after university updates
      const postResult = await marketSizeService.updatePostMarketSizes();
      console.log(`✅ Post market sizes updated: ${postResult.updated} posts updated`);
      
    } catch (error) {
      console.error('❌ Daily market size updates failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Los_Angeles"
  });
  
  console.log('✅ Market size updates scheduled successfully');
};

// Update relative grades every 5 minutes during active hours (8 AM - 10 PM)
const scheduleGradeUpdates = () => {
  console.log('⏰ Scheduling grade updates every 5 minutes during active hours...');
  
  cron.schedule('*/5 8-22 * * *', async () => {
    console.log('🔄 Running scheduled grade updates...');
    
    try {
      const result = await relativeGradingService.recalculateAllMarketGrades();
      console.log(`✅ Grade updates completed for all markets`);
      
    } catch (error) {
      console.error('❌ Scheduled grade updates failed:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Los_Angeles"
  });
  
  console.log('✅ Grade updates scheduled successfully');
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
    scheduleMarketSizeUpdates();
    scheduleGradeUpdates();
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