const { query } = require('../config/database');
const { redisGet, redisSet } = require('../config/redis');

class MobileAnalyticsService {
  constructor() {
    this.batchSize = parseInt(process.env.MOBILE_ANALYTICS_BATCH_SIZE) || 100;
    this.isEnabled = process.env.MOBILE_ANALYTICS_ENABLED === 'true';
    this.eventQueue = [];
    this.flushInterval = 30000; // 30 seconds
    
    if (this.isEnabled) {
      this.startBatchProcessor();
    }
  }

  async trackEvent(userId, eventType, eventData = {}, platform = 'ios', appVersion = null) {
    if (!this.isEnabled) return;

    const event = {
      userId,
      eventType,
      eventData: JSON.stringify(eventData),
      platform,
      appVersion,
      timestamp: new Date()
    };

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // If queue is full, flush immediately
    if (this.eventQueue.length >= this.batchSize) {
      await this.flushEvents();
    }
  }

  async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Batch insert events
      const values = events.map((event, index) => {
        const offset = index * 6;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
      }).join(', ');

      const params = events.flatMap(event => [
        event.userId,
        event.eventType,
        event.eventData,
        event.platform,
        event.appVersion,
        event.timestamp
      ]);

      await query(`
        INSERT INTO mobile_analytics (user_id, event_type, event_data, platform, app_version, created_at)
        VALUES ${values}
      `, params);

      console.log(`📊 Flushed ${events.length} mobile analytics events`);

    } catch (error) {
      console.error('❌ Error flushing mobile analytics events:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...events);
    }
  }

  startBatchProcessor() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  // Predefined event tracking methods
  async trackAppLaunch(userId, platform, appVersion, deviceInfo = {}) {
    await this.trackEvent(userId, 'app_launch', {
      deviceInfo,
      launchTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackAppBackground(userId, sessionDuration, platform, appVersion) {
    await this.trackEvent(userId, 'app_background', {
      sessionDuration,
      backgroundTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackScreenView(userId, screenName, platform, appVersion, metadata = {}) {
    await this.trackEvent(userId, 'screen_view', {
      screenName,
      metadata,
      viewTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackPostCreate(userId, postId, category, hasImages, platform, appVersion) {
    await this.trackEvent(userId, 'post_create', {
      postId,
      category,
      hasImages,
      imageCount: hasImages ? (Array.isArray(hasImages) ? hasImages.length : 1) : 0
    }, platform, appVersion);
  }

  async trackPostView(userId, postId, viewDuration, platform, appVersion) {
    await this.trackEvent(userId, 'post_view', {
      postId,
      viewDuration,
      viewTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackPostInteraction(userId, postId, interactionType, platform, appVersion) {
    await this.trackEvent(userId, 'post_interaction', {
      postId,
      interactionType, // like, bookmark, repost, share
      interactionTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackMessageSent(userId, conversationId, messageLength, platform, appVersion) {
    await this.trackEvent(userId, 'message_sent', {
      conversationId,
      messageLength,
      sentTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackSearch(userId, searchQuery, resultCount, platform, appVersion) {
    await this.trackEvent(userId, 'search', {
      searchQuery: searchQuery.length > 100 ? searchQuery.substring(0, 100) : searchQuery,
      resultCount,
      searchTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackCameraUsage(userId, captureType, imageCount, platform, appVersion) {
    await this.trackEvent(userId, 'camera_usage', {
      captureType, // photo, multiple
      imageCount,
      captureTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackImageUpload(userId, imageSize, compressionLevel, uploadDuration, platform, appVersion) {
    await this.trackEvent(userId, 'image_upload', {
      imageSize,
      compressionLevel,
      uploadDuration,
      uploadTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackError(userId, errorType, errorMessage, stackTrace, platform, appVersion) {
    await this.trackEvent(userId, 'error', {
      errorType,
      errorMessage: errorMessage.substring(0, 500), // Limit error message length
      stackTrace: stackTrace ? stackTrace.substring(0, 1000) : null,
      errorTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackPerformance(userId, metricType, value, metadata, platform, appVersion) {
    await this.trackEvent(userId, 'performance', {
      metricType, // app_start_time, api_response_time, image_load_time
      value,
      metadata,
      measureTime: new Date().toISOString()
    }, platform, appVersion);
  }

  async trackOfflineSync(userId, actionCount, syncDuration, platform, appVersion) {
    await this.trackEvent(userId, 'offline_sync', {
      actionCount,
      syncDuration,
      syncTime: new Date().toISOString()
    }, platform, appVersion);
  }

  // Analytics query methods
  async getUserAnalytics(userId, startDate, endDate) {
    try {
      const result = await query(`
        SELECT 
          event_type,
          COUNT(*) as event_count,
          DATE(created_at) as event_date
        FROM mobile_analytics 
        WHERE user_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
        GROUP BY event_type, DATE(created_at)
        ORDER BY event_date DESC, event_count DESC
      `, [userId, startDate, endDate]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return [];
    }
  }

  async getAppAnalytics(startDate, endDate, platform = null) {
    try {
      let whereClause = 'WHERE created_at >= $1 AND created_at <= $2';
      let params = [startDate, endDate];

      if (platform) {
        whereClause += ' AND platform = $3';
        params.push(platform);
      }

      const result = await query(`
        SELECT 
          event_type,
          platform,
          COUNT(*) as event_count,
          COUNT(DISTINCT user_id) as unique_users,
          DATE(created_at) as event_date
        FROM mobile_analytics 
        ${whereClause}
        GROUP BY event_type, platform, DATE(created_at)
        ORDER BY event_date DESC, event_count DESC
      `, params);

      return result.rows;
    } catch (error) {
      console.error('Error getting app analytics:', error);
      return [];
    }
  }

  async getTopEvents(limit = 10, platform = null, timeframe = '24 hours') {
    try {
      let whereClause = `WHERE created_at >= NOW() - INTERVAL '${timeframe}'`;
      let params = [limit];

      if (platform) {
        whereClause += ' AND platform = $2';
        params = [limit, platform];
      }

      const result = await query(`
        SELECT 
          event_type,
          COUNT(*) as event_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM mobile_analytics 
        ${whereClause}
        GROUP BY event_type
        ORDER BY event_count DESC
        LIMIT $1
      `, params);

      return result.rows;
    } catch (error) {
      console.error('Error getting top events:', error);
      return [];
    }
  }

  async getUserEngagement(userId, timeframe = '7 days') {
    try {
      const result = await query(`
        SELECT 
          COUNT(DISTINCT DATE(created_at)) as active_days,
          COUNT(*) as total_events,
          COUNT(*) FILTER (WHERE event_type = 'post_create') as posts_created,
          COUNT(*) FILTER (WHERE event_type = 'message_sent') as messages_sent,
          COUNT(*) FILTER (WHERE event_type = 'post_interaction') as interactions,
          AVG(
            CASE 
              WHEN event_type = 'screen_view' AND event_data->>'viewDuration' IS NOT NULL 
              THEN (event_data->>'viewDuration')::integer 
            END
          ) as avg_session_duration
        FROM mobile_analytics 
        WHERE user_id = $1 
        AND created_at >= NOW() - INTERVAL $2
      `, [userId, timeframe]);

      return result.rows[0] || {};
    } catch (error) {
      console.error('Error getting user engagement:', error);
      return {};
    }
  }

  async getErrorAnalytics(timeframe = '24 hours', limit = 20) {
    try {
      const result = await query(`
        SELECT 
          event_data->>'errorType' as error_type,
          event_data->>'errorMessage' as error_message,
          platform,
          COUNT(*) as occurrence_count,
          COUNT(DISTINCT user_id) as affected_users,
          MAX(created_at) as last_occurrence
        FROM mobile_analytics 
        WHERE event_type = 'error'
        AND created_at >= NOW() - INTERVAL $1
        GROUP BY event_data->>'errorType', event_data->>'errorMessage', platform
        ORDER BY occurrence_count DESC
        LIMIT $2
      `, [timeframe, limit]);

      return result.rows;
    } catch (error) {
      console.error('Error getting error analytics:', error);
      return [];
    }
  }

  async getPerformanceMetrics(metricType, timeframe = '24 hours') {
    try {
      const result = await query(`
        SELECT 
          platform,
          AVG((event_data->>'value')::numeric) as avg_value,
          MIN((event_data->>'value')::numeric) as min_value,
          MAX((event_data->>'value')::numeric) as max_value,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (event_data->>'value')::numeric) as median_value,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY (event_data->>'value')::numeric) as p95_value,
          COUNT(*) as sample_count
        FROM mobile_analytics 
        WHERE event_type = 'performance'
        AND event_data->>'metricType' = $1
        AND created_at >= NOW() - INTERVAL $2
        GROUP BY platform
        ORDER BY platform
      `, [metricType, timeframe]);

      return result.rows;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return [];
    }
  }

  // Cleanup old analytics data
  async cleanupOldData(retentionDays = 90) {
    try {
      const result = await query(`
        DELETE FROM mobile_analytics 
        WHERE created_at < NOW() - INTERVAL '${retentionDays} days'
      `);

      console.log(`🧹 Cleaned up ${result.rowCount} old mobile analytics records`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up old analytics data:', error);
      return 0;
    }
  }
}

module.exports = new MobileAnalyticsService(); 