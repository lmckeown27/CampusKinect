const cron = require('node-cron');
const { processRecurringPosts, cleanupInvalidPosts, getRecurringPostsSummary } = require('./recurringPostService');
const relativeGradingService = require('./relativeGradingService');
const marketSizeService = require('./marketSizeService');

/**
 * Cron Service
 * Handles scheduled tasks like processing recurring posts
 */

// Clean up invalid posts once when system starts
const performInitialCleanup = async () => {
  console.log('🧹 Performing initial cleanup of invalid posts...');
  
  try {
    const result = await cleanupInvalidPosts();
    console.log(`✅ Initial cleanup completed: ${result.cleaned} posts cleaned up`);
  } catch (error) {
    console.error('❌ Initial cleanup failed:', error);
  }
};

// Process recurring posts every day at 6:00 AM
const scheduleRecurringPostProcessing = () => {
  console.log('⏰ Scheduling recurring post processing for 6:00 AM daily...');
  
  cron.schedule('0 6 * * *', async () => {
    console.log('🕕 6:00 AM - Starting daily recurring post processing...');
    
    try {
      // Get summary before processing
      const summary = await getRecurringPostsSummary();
      
      if (summary.total === 0) {
        console.log('ℹ️ No recurring posts exist - skipping processing');
        return;
      }
      
      if (summary.valid === 0) {
        console.log('ℹ️ No valid recurring posts exist - skipping processing');
        return;
      }
      
      if (summary.needsReposting === 0) {
        console.log('ℹ️ No posts need reposting today - skipping processing');
        return;
      }
      
      console.log(`🔄 Processing ${summary.needsReposting} posts that need reposting...`);
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

// Process recurring posts daily for testing (reduced from hourly to save processing power)
const scheduleHourlyProcessing = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Development mode: Scheduling daily recurring post processing...');
    
    cron.schedule('0 12 * * *', async () => {
      console.log('🕐 Daily recurring post processing (development mode)...');
      
      try {
        // Get summary before processing
        const summary = await getRecurringPostsSummary();
        
        if (summary.total === 0) {
          console.log('ℹ️ No recurring posts exist - skipping development processing');
          return;
        }
        
        if (summary.valid === 0) {
          console.log('ℹ️ No valid recurring posts exist - skipping development processing');
          return;
        }
        
        if (summary.needsReposting === 0) {
          console.log('ℹ️ No posts need reposting today - skipping development processing');
          return;
        }
        
        console.log(`🔄 Development processing: ${summary.needsReposting} posts need reposting...`);
        const result = await processRecurringPosts();
        console.log(`✅ Daily processing completed: ${result.reposted}/${result.processed} posts reposted, ${result.skipped} skipped`);
        
      } catch (error) {
        console.error('❌ Daily processing failed:', error);
      }
    });
    
    console.log('✅ Daily processing scheduled for development (12:00 PM)');
  }
};

// Initialize all cron jobs
const initializeCronJobs = () => {
  try {
    // TEMPORARILY DISABLED: These services are creating phantom posts
    // performInitialCleanup(); // Call the new function here
    // scheduleRecurringPostProcessing();
    // scheduleMarketSizeUpdates();
    // scheduleGradeUpdates();
    // scheduleHourlyProcessing();
    
    console.log('🎯 Cron jobs initialized (phantom post services DISABLED)');
    
  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
  }
};

// Manual trigger for testing
const triggerRecurringPostProcessing = async () => {
  console.log('🔧 Manually triggering recurring post processing...');
  
  try {
    // Get summary before processing
    const summary = await getRecurringPostsSummary();
    
    if (summary.total === 0) {
      console.log('ℹ️ No recurring posts exist - nothing to process');
      return { processed: 0, reposted: 0, skipped: 0, errors: [] };
    }
    
    if (summary.valid === 0) {
      console.log('ℹ️ No valid recurring posts exist - nothing to process');
      return { processed: 0, reposted: 0, skipped: 0, errors: [] };
    }
    
    if (summary.needsReposting === 0) {
      console.log('ℹ️ No posts need reposting today - nothing to process');
      return { processed: 0, reposted: 0, skipped: 0, errors: [] };
    }
    
    console.log(`🔄 Manual processing: ${summary.needsReposting} posts need reposting...`);
    const result = await processRecurringPosts();
    console.log(`✅ Manual processing completed: ${result.reposted}/${result.processed} posts reposted, ${result.skipped} skipped`);
    return result;
    
  } catch (error) {
    console.error('❌ Manual processing failed:', error);
    throw error;
  }
};

// Manual cleanup trigger for testing
const triggerCleanup = async () => {
  console.log('🔧 Manually triggering cleanup of invalid posts...');
  
  try {
    const result = await cleanupInvalidPosts();
    console.log(`✅ Manual cleanup completed: ${result.cleaned} posts cleaned up`);
    return result;
    
  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
    throw error;
  }
};

module.exports = {
  initializeCronJobs,
  triggerRecurringPostProcessing,
  triggerCleanup
}; 