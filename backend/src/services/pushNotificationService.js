// Optional mobile dependencies - gracefully handle if not installed
let apn, admin;
try {
  apn = require('apn');
} catch (error) {
  console.log('📱 APN module not installed - mobile push notifications disabled');
}

try {
  admin = require('firebase-admin');
} catch (error) {
  console.log('📱 Firebase Admin module not installed - mobile push notifications disabled');
}

const { query } = require('../config/database');

class PushNotificationService {
  constructor() {
    this.apnProvider = null;
    this.fcmApp = null;
    this.initializeServices();
  }

  initializeServices() {
    console.log('📱 Initializing push notification services...');
    console.log('📱 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      APN_KEY_ID: process.env.APN_KEY_ID ? '✅ Set' : '❌ Missing',
      APN_TEAM_ID: process.env.APN_TEAM_ID ? '✅ Set' : '❌ Missing',
      APN_PRIVATE_KEY: process.env.APN_PRIVATE_KEY ? '✅ Set' : '❌ Missing',
      APN_BUNDLE_ID: process.env.APN_BUNDLE_ID ? '✅ Set' : '❌ Missing'
    });

    // Initialize Apple Push Notification service
    if (apn && process.env.APN_KEY_ID && process.env.APN_TEAM_ID && process.env.APN_PRIVATE_KEY) {
      try {
        // Fix the private key format - convert escaped newlines to actual newlines
        const fixedPrivateKey = process.env.APN_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        const apnOptions = {
          token: {
            key: fixedPrivateKey,
            keyId: process.env.APN_KEY_ID,
            teamId: process.env.APN_TEAM_ID
          },
          production: process.env.NODE_ENV === 'production'
        };

        console.log('📱 Creating APN Provider with options:', {
          keyId: process.env.APN_KEY_ID,
          teamId: process.env.APN_TEAM_ID,
          production: process.env.NODE_ENV === 'production',
          keyLength: fixedPrivateKey.length,
          keyPreview: fixedPrivateKey.substring(0, 50) + '...'
        });

        this.apnProvider = new apn.Provider(apnOptions);
        console.log('✅ APN Provider initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize APN Provider:', error.message);
        console.log('⚠️ Push notifications will be disabled, but server will continue...');
        this.apnProvider = null;
      }
    } else {
      console.log('❌ APN Provider not initialized - missing required environment variables or apn module');
      console.log('❌ Required: APN_KEY_ID, APN_TEAM_ID, APN_PRIVATE_KEY, and apn module');
    }

    // Initialize Firebase Cloud Messaging
    if (admin && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        this.fcmApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        }, 'campuskinect-mobile');
        
        console.log('✅ FCM initialized');
      } catch (error) {
        console.error('❌ FCM initialization failed:', error.message);
        console.log('⚠️ FCM notifications will be disabled, but server will continue...');
        this.fcmApp = null;
      }
    } else {
      console.log('❌ FCM not initialized - missing FIREBASE_SERVICE_ACCOUNT or firebase-admin module');
    }
  }

  async sendNotification(userId, notification) {
    try {
      console.log(`📱 Attempting to send notification to user ${userId}:`, {
        title: notification.title,
        body: notification.body,
        type: notification.type
      });

      // Get user's registered devices
      const devices = await query(
        'SELECT device_token, platform FROM mobile_devices WHERE user_id = $1 AND is_active = true',
        [userId]
      );

      console.log(`📱 Found ${devices.rows.length} registered devices for user ${userId}`);

      if (devices.rows.length === 0) {
        console.log(`❌ No registered devices for user ${userId}`);
        return { success: false, reason: 'No registered devices' };
      }

      const results = [];

      for (const device of devices.rows) {
        console.log(`📱 Sending to ${device.platform} device: ${device.device_token.substring(0, 10)}...`);
        try {
          if (device.platform === 'ios' && this.apnProvider) {
            console.log('📱 Using APN provider for iOS device');
            const result = await this.sendIOSNotification(device.device_token, notification);
            results.push({ platform: 'ios', token: device.device_token, result });
          } else if (device.platform === 'android' && this.fcmApp) {
            console.log('📱 Using FCM for Android device');
            const result = await this.sendAndroidNotification(device.device_token, notification);
            results.push({ platform: 'android', token: device.device_token, result });
          } else {
            console.log(`❌ No provider available for platform: ${device.platform}`);
            console.log(`❌ APN Provider available: ${!!this.apnProvider}`);
            console.log(`❌ FCM App available: ${!!this.fcmApp}`);
          }
        } catch (deviceError) {
          console.error(`❌ Error sending to device ${device.device_token}:`, deviceError);
          results.push({ 
            platform: device.platform, 
            token: device.device_token, 
            error: deviceError.message 
          });
        }
      }

      // Log notification
      await this.logNotification(userId, notification, results);

      console.log(`📱 Notification sending completed. Results:`, results);
      return { success: true, results };

    } catch (error) {
      console.error('❌ Push notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendIOSNotification(deviceToken, notification) {
    if (!this.apnProvider) {
      throw new Error('APN Provider not initialized');
    }

    const note = new apn.Notification();
    note.expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    note.badge = notification.badge || 1;
    note.sound = notification.sound || 'ping.aiff';
    note.alert = {
      title: notification.title,
      body: notification.body
    };
    // Include notification type and other data in payload for iOS app to process
    note.payload = {
      ...notification.data,
      type: notification.type,
      category: notification.category,
      color: '#708d81' // Olive green color for the platform
    };
    note.topic = process.env.APN_BUNDLE_ID || 'com.liammckeown.CampusKinect-IOS';

    // Add category for interactive notifications
    if (notification.category) {
      note.category = notification.category;
    }

    const result = await this.apnProvider.send(note, deviceToken);
    
    // Handle failed devices
    if (result.failed && result.failed.length > 0) {
      for (const failure of result.failed) {
        if (failure.status === '410' || failure.status === '400') {
          // Device token is invalid, mark as inactive
          await this.deactivateDevice(deviceToken);
        }
      }
    }

    return result;
  }

  async sendAndroidNotification(deviceToken, notification) {
    if (!this.fcmApp) {
      throw new Error('FCM not initialized');
    }

    const message = {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: notification.sound || 'default',
          channelId: 'campuskinect_notifications'
        }
      }
    };

    try {
      const result = await admin.messaging(this.fcmApp).send(message);
      return { success: true, messageId: result };
    } catch (error) {
      // Handle invalid tokens
      if (error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token') {
        await this.deactivateDevice(deviceToken);
      }
      throw error;
    }
  }

  async deactivateDevice(deviceToken) {
    try {
      await query(
        'UPDATE mobile_devices SET is_active = false WHERE device_token = $1',
        [deviceToken]
      );
      console.log(`Deactivated invalid device token: ${deviceToken}`);
    } catch (error) {
      console.error('Error deactivating device:', error);
    }
  }

  async logNotification(userId, notification, results) {
    try {
      await query(`
        INSERT INTO notification_logs (user_id, title, body, type, results, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [
        userId,
        notification.title,
        notification.body,
        notification.type || 'general',
        JSON.stringify(results)
      ]);
    } catch (error) {
      console.error('Error logging notification:', error);
    }
  }

  // Notification templates for different events
  async sendMessageNotification(recipientId, senderName, messagePreview) {
    // Get the user's current unread message count for accurate badge
    const messageService = require('./messageService');
    let unreadCount = 1; // Default to 1 if we can't get the count
    
    try {
      unreadCount = await messageService.getUnreadMessageCount(recipientId);
    } catch (error) {
      console.error('Failed to get unread count for badge:', error);
    }

    const notification = {
      title: senderName,
      body: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
      type: 'message',
      category: 'MESSAGE_CATEGORY',
      sound: 'default',
      badge: unreadCount, // Set badge to actual unread count
      data: {
        type: 'message',
        action: 'open_chat',
        unreadCount: unreadCount // Include in payload for iOS app
      }
    };

    return await this.sendNotification(recipientId, notification);
  }

  async sendPostLikeNotification(postOwnerId, likerName, postPreview) {
    const notification = {
      title: `${likerName} liked your post`,
      body: postPreview.length > 50 ? `"${postPreview.substring(0, 50)}..."` : `"${postPreview}"`,
      type: 'like',
      category: 'ENGAGEMENT_CATEGORY',
      data: {
        type: 'like',
        action: 'open_post'
      }
    };

    return await this.sendNotification(postOwnerId, notification);
  }

  async sendPostCommentNotification(postOwnerId, commenterName, commentPreview, postPreview) {
    const notification = {
      title: `${commenterName} commented on your post`,
      body: commentPreview.length > 50 ? `${commentPreview.substring(0, 50)}...` : commentPreview,
      type: 'comment',
      category: 'ENGAGEMENT_CATEGORY',
      data: {
        type: 'comment',
        action: 'open_post'
      }
    };

    return await this.sendNotification(postOwnerId, notification);
  }

  // Badge management functions
  async updateBadgeCount(userId, badgeCount = null) {
    try {
      // If no badge count provided, get current unread count
      if (badgeCount === null) {
        const messageService = require('./messageService');
        badgeCount = await messageService.getUnreadMessageCount(userId);
      }

      const notification = {
        title: '', // Silent badge update
        body: '',
        type: 'badge_update',
        badge: badgeCount,
        data: {
          type: 'badge_update',
          silent: true
        }
      };

      // Send silent notification to update badge only
      return await this.sendNotification(userId, notification);
    } catch (error) {
      console.error('Failed to update badge count:', error);
      return { success: false, error: error.message };
    }
  }

  async clearBadge(userId) {
    return await this.updateBadgeCount(userId, 0);
  }

  async sendFollowNotification(followedUserId, followerName) {
    const notification = {
      title: `${followerName} started following you`,
      body: 'Check out their profile!',
      type: 'follow',
      category: 'SOCIAL_CATEGORY',
      data: {
        type: 'follow',
        action: 'open_profile'
      }
    };

    return await this.sendNotification(followedUserId, notification);
  }

  async sendSystemNotification(userId, title, body, data = {}) {
    const notification = {
      title,
      body,
      type: 'system',
      category: 'SYSTEM_CATEGORY',
      sound: 'system.aiff',
      data: {
        type: 'system',
        ...data
      }
    };

    return await this.sendNotification(userId, notification);
  }

  async sendBulkNotification(userIds, notification) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.sendNotification(userId, notification);
        results.push({ userId, ...result });
      } catch (error) {
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  // Get notification preferences for a user
  async getNotificationPreferences(userId) {
    try {
      const result = await query(
        'SELECT notification_preferences FROM users WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return this.getDefaultPreferences();
      }

      return result.rows[0].notification_preferences || this.getDefaultPreferences();
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return this.getDefaultPreferences();
    }
  }

  getDefaultPreferences() {
    return {
      messages: true,
      likes: true,
      comments: true,
      follows: true,
      system: true,
      marketing: false,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      await query(
        'UPDATE users SET notification_preferences = $1 WHERE id = $2',
        [JSON.stringify(preferences), userId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user should receive notification based on preferences and quiet hours
  async shouldSendNotification(userId, notificationType) {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      
      // Check if notification type is enabled
      if (!preferences[notificationType]) {
        return false;
      }

      // Check quiet hours
      if (preferences.quietHours && preferences.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
        
        const { start, end } = preferences.quietHours;
        
        if (start < end) {
          // Same day quiet hours (e.g., 22:00 to 08:00 next day)
          if (currentTime >= start || currentTime <= end) {
            return false;
          }
        } else {
          // Cross-day quiet hours (e.g., 08:00 to 22:00)
          if (currentTime >= start && currentTime <= end) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking notification preferences:', error);
      return true; // Default to sending if there's an error
    }
  }
}

module.exports = new PushNotificationService(); 