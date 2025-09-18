const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { auth, requireVerification } = require('../middleware/auth');
const pushNotificationService = require('../services/pushNotificationService');
const Joi = require('joi');

// Validation schemas
const deviceTokenSchema = Joi.object({
  deviceToken: Joi.string().required(),
  platform: Joi.string().valid('ios', 'android').required()
});

// Register device token for push notifications
router.post('/register-device', [auth, requireVerification], async (req, res) => {
  try {
    const { error, value } = deviceTokenSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: error.details
        }
      });
    }

    const { deviceToken, platform } = value;
    const userId = req.user.id;

    // Check if device token already exists for this user
    const existingDevice = await query(
      'SELECT id FROM mobile_devices WHERE user_id = $1 AND device_token = $2',
      [userId, deviceToken]
    );

    if (existingDevice.rows.length > 0) {
      // Update existing device to active
      await query(
        'UPDATE mobile_devices SET is_active = true, updated_at = NOW() WHERE user_id = $1 AND device_token = $2',
        [userId, deviceToken]
      );
    } else {
      // Insert new device token
      await query(`
        INSERT INTO mobile_devices (user_id, device_token, platform, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, true, NOW(), NOW())
      `, [userId, deviceToken, platform]);
    }

    console.log(`📱 Device token registered for user ${userId}: ${platform}`);

    res.json({
      success: true,
      message: 'Device token registered successfully'
    });

  } catch (error) {
    console.error('Error registering device token:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to register device token'
      }
    });
  }
});

// Unregister device token (when user logs out)
router.delete('/unregister-device', [auth, requireVerification], async (req, res) => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user.id;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Device token is required'
        }
      });
    }

    // Mark device as inactive
    await query(
      'UPDATE mobile_devices SET is_active = false WHERE user_id = $1 AND device_token = $2',
      [userId, deviceToken]
    );

    console.log(`📱 Device token unregistered for user ${userId}`);

    res.json({
      success: true,
      message: 'Device token unregistered successfully'
    });

  } catch (error) {
    console.error('Error unregistering device token:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to unregister device token'
      }
    });
  }
});

// Update badge count
router.post('/update-badge', [auth, requireVerification], async (req, res) => {
  try {
    const userId = req.user.id;
    const { badgeCount } = req.body; // Optional: specific count, otherwise uses unread count

    const result = await pushNotificationService.updateBadgeCount(userId, badgeCount);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Badge count updated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: result.error }
      });
    }
  } catch (error) {
    console.error('Update badge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update badge count' }
    });
  }
});

// Clear badge (set to 0)
router.post('/clear-badge', [auth, requireVerification], async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pushNotificationService.clearBadge(userId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Badge cleared successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: result.error }
      });
    }
  } catch (error) {
    console.error('Clear badge error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to clear badge' }
    });
  }
});

module.exports = router; 