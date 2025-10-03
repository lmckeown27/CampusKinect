const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { redisGet, redisSet, redisDel } = require('../config/redis');

const locationService = require('../services/locationService');
const biometricAuthService = require('../services/biometricAuthService');
const backgroundSyncService = require('../services/backgroundSyncService');
const deepLinkingService = require('../services/deepLinkingService');

// Configure multer for mobile image uploads with higher limits
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for high-res mobile photos
    files: 10 // Allow multiple images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/v1/mobile/register-device
// @desc    Register mobile device for push notifications
// @access  Private
router.post('/register-device', [
  auth,
  body('deviceToken').notEmpty().withMessage('Device token is required'),
  body('platform').isIn(['ios', 'android']).withMessage('Platform must be ios or android'),
  body('appVersion').optional().isString(),
  body('osVersion').optional().isString(),
  body('deviceModel').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { deviceToken, platform, appVersion, osVersion, deviceModel } = req.body;
    const userId = req.user.id;

    // Check if device is already registered
    const existingDevice = await query(
      'SELECT id FROM mobile_devices WHERE user_id = $1 AND device_token = $2',
      [userId, deviceToken]
    );

    if (existingDevice.rows.length > 0) {
      // Update existing device
      await query(`
        UPDATE mobile_devices 
        SET app_version = $1, os_version = $2, device_model = $3, updated_at = NOW()
        WHERE user_id = $4 AND device_token = $5
      `, [appVersion, osVersion, deviceModel, userId, deviceToken]);
    } else {
      // Register new device
      await query(`
        INSERT INTO mobile_devices (user_id, device_token, platform, app_version, os_version, device_model)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, deviceToken, platform, appVersion, osVersion, deviceModel]);
    }

    res.json({
      success: true,
      message: 'Device registered successfully'
    });

  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to register device' }
    });
  }
});

// @route   DELETE /api/v1/mobile/unregister-device
// @desc    Unregister mobile device
// @access  Private
router.delete('/unregister-device', [
  auth,
  body('deviceToken').notEmpty().withMessage('Device token is required')
], async (req, res) => {
  try {
    const { deviceToken } = req.body;
    const userId = req.user.id;

    await query(
      'DELETE FROM mobile_devices WHERE user_id = $1 AND device_token = $2',
      [userId, deviceToken]
    );

    res.json({
      success: true,
      message: 'Device unregistered successfully'
    });

  } catch (error) {
    console.error('Device unregistration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to unregister device' }
    });
  }
});

// @route   POST /api/v1/mobile/upload-camera-image
// @desc    Upload image taken with mobile camera with automatic categorization
// @access  Private
router.post('/upload-camera-image', [
  auth,
  upload.array('images', 10)
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No images provided' }
      });
    }

    const { 
      location, 
      suggestedCategory, 
      description,
      compressionLevel = 'medium' // low, medium, high
    } = req.body;

    const uploadedImages = [];

    for (const file of req.files) {
      const imageId = uuidv4();
      const timestamp = Date.now();
      const filename = `${imageId}-${timestamp}.jpeg`;
      const thumbnailFilename = `thumb-${imageId}-${timestamp}.jpeg`;
      
      const imagePath = path.join(__dirname, '../../uploads', filename);
      const thumbnailPath = path.join(__dirname, '../../uploads', thumbnailFilename);

      // Mobile-optimized image processing
      let imageProcessor = sharp(file.buffer);
      
      // Get image metadata
      const metadata = await imageProcessor.metadata();
      
      // Determine compression settings based on level
      const compressionSettings = {
        low: { quality: 90, maxDimension: 2048 },
        medium: { quality: 80, maxDimension: 1536 },
        high: { quality: 70, maxDimension: 1024 }
      };
      
      const settings = compressionSettings[compressionLevel] || compressionSettings.medium;
      
      // Resize maintaining aspect ratio
      if (metadata.width > settings.maxDimension || metadata.height > settings.maxDimension) {
        imageProcessor = imageProcessor.resize(settings.maxDimension, settings.maxDimension, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Process main image
      await imageProcessor
        .jpeg({ quality: settings.quality, progressive: true })
        .toFile(imagePath);

      // Create mobile-optimized thumbnail
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 75 })
        .toFile(thumbnailPath);

      // Store image metadata
      const imageUrl = `/uploads/${filename}`;
      const thumbnailUrl = `/uploads/${thumbnailFilename}`;
      
      uploadedImages.push({
        id: imageId,
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        originalSize: file.size,
        processedSize: (await fs.stat(imagePath)).size,
        compressionRatio: Math.round((1 - (await fs.stat(imagePath)).size / file.size) * 100),
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          location: location || null,
          suggestedCategory: suggestedCategory || null
        }
      });
    }

    res.json({
      success: true,
      data: {
        images: uploadedImages,
        message: `${uploadedImages.length} image(s) uploaded successfully`
      }
    });

  } catch (error) {
    console.error('Camera image upload error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to upload camera images' }
    });
  }
});

// @route   GET /api/v1/mobile/posts/feed
// @desc    Get mobile-optimized feed with pagination and caching
// @access  Private
router.get('/posts/feed', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      lastPostId,
      includeImages = 'true',
      compressionLevel = 'medium'
    } = req.query;

    const userId = req.user.id;
    const offset = (page - 1) * limit;

    // Check for cached feed
    const cacheKey = `mobile_feed:${userId}:${page}:${limit}`;
    const cachedFeed = await redisGet(cacheKey);
    
    if (cachedFeed) {
      return res.json({
        success: true,
        data: JSON.parse(cachedFeed),
        cached: true
      });
    }

    // Mobile-optimized query with image URLs
    let query_text = `
      SELECT 
        p.id,
        p.content,
        p.location,
        p.duration_type,
        p.created_at,
        p.engagement_score,
        u.id as poster_id,
        u.first_name,
        u.last_name,
        u.username,
        u.profile_picture,
        univ.name as university_name,
        COALESCE(
          ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), 
          ARRAY[]::text[]
        ) as tags,
        COALESCE(
          ARRAY_AGG(
            DISTINCT jsonb_build_object(
              'url', pi.image_url,
              'thumbnailUrl', CASE 
                WHEN pi.image_url LIKE '%thumb-%' THEN pi.image_url 
                ELSE REPLACE(pi.image_url, '/uploads/', '/uploads/thumb-')
              END,
              'order', pi.image_order
            )
          ) FILTER (WHERE pi.image_url IS NOT NULL),
          ARRAY[]::jsonb[]
        ) as images,
        (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND interaction_type = 'like') as like_count,
        (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND interaction_type = 'bookmark') as bookmark_count,
        (SELECT COUNT(*) FROM post_interactions WHERE post_id = p.id AND interaction_type = 'repost') as repost_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN universities univ ON u.university_id = univ.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN post_images pi ON p.id = pi.post_id
      WHERE p.is_active = true
    `;

    // Cursor-based pagination for mobile
    if (lastPostId) {
      query_text += ` AND p.id < $3`;
    }

    query_text += `
      GROUP BY p.id, u.id, univ.name
      ORDER BY p.engagement_score DESC, p.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const params = lastPostId ? [limit, offset, lastPostId] : [limit, offset];
    const result = await query(query_text, params);

    const posts = result.rows.map(post => ({
      ...post,
      images: post.images.sort((a, b) => a.order - b.order),
      isLiked: false, // Will be populated by separate query if needed
      isBookmarked: false,
      isReposted: false
    }));

    const responseData = {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit),
        lastPostId: posts.length > 0 ? posts[posts.length - 1].id : null
      }
    };

    // Cache for 5 minutes
    await redisSet(cacheKey, JSON.stringify(responseData), 300);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Mobile feed error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch mobile feed' }
    });
  }
});

// @route   POST /api/v1/mobile/posts/create
// @desc    Create post with mobile-specific features
// @access  Private
router.post('/posts/create', [
  auth,
  upload.array('images', 10),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
  body('category').optional().isString(),
  body('subcategory').optional().isString(),
  body('location').optional().isString(),
  body('duration').optional().isIn(['1 hour', '1 day', '1 week', '1 month', 'permanent']),
  body('tags').optional().isArray(),
  body('cameraMetadata').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const {
      content,
      category,
      subcategory,
      location,
      duration = 'permanent',
      tags = [],
      cameraMetadata = {}
    } = req.body;

    const userId = req.user.id;

    // Create post
    const postResult = await query(`
      INSERT INTO posts (user_id, content, category, subcategory, location, duration_type, camera_metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `, [userId, content, category, subcategory, location, duration, JSON.stringify(cameraMetadata)]);

    const postId = postResult.rows[0].id;

    // Handle image uploads if present
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageId = uuidv4();
        const timestamp = Date.now();
        const filename = `${imageId}-${timestamp}.jpeg`;
        const thumbnailFilename = `thumb-${imageId}-${timestamp}.jpeg`;
        
        const imagePath = path.join(__dirname, '../../uploads', filename);
        const thumbnailPath = path.join(__dirname, '../../uploads', thumbnailFilename);

        // Process image with mobile optimization
        await sharp(file.buffer)
          .resize(1536, 1536, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toFile(imagePath);

        // Create thumbnail
        await sharp(file.buffer)
          .resize(300, 300, { fit: 'cover' })
          .jpeg({ quality: 75 })
          .toFile(thumbnailPath);

        const imageUrl = `/uploads/${filename}`;
        
        // Save image to database
        await query(`
          INSERT INTO post_images (post_id, image_url, image_order)
          VALUES ($1, $2, $3)
        `, [postId, imageUrl, i]);

        uploadedImages.push({
          url: imageUrl,
          thumbnailUrl: `/uploads/${thumbnailFilename}`,
          order: i
        });
      }
    }

    // Handle tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        let tagResult = await query('SELECT id FROM tags WHERE name = $1', [tagName]);
        
        if (tagResult.rows.length === 0) {
          tagResult = await query(
            'INSERT INTO tags (name) VALUES ($1) RETURNING id',
            [tagName]
          );
        }

        const tagId = tagResult.rows[0].id;
        
        // Link tag to post
        await query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [postId, tagId]
        );
      }
    }

    // Clear relevant caches
    await redisDel(`mobile_feed:${userId}:*`);

    res.status(201).json({
      success: true,
      data: {
        postId,
        images: uploadedImages,
        message: 'Post created successfully'
      }
    });

  } catch (error) {
    console.error('Mobile post creation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create post' }
    });
  }
});

// @route   GET /api/v1/mobile/sync/offline-data
// @desc    Get data for offline synchronization
// @access  Private
router.get('/sync/offline-data', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { lastSync } = req.query;

    // Get user's recent conversations
    const conversations = await query(`
      SELECT 
        c.id,
        c.updated_at,
        u.first_name,
        u.last_name,
        u.username,
        u.profile_picture
      FROM conversations c
      JOIN users u ON (
        CASE 
          WHEN c.user1_id = $1 THEN c.user2_id 
          ELSE c.user1_id 
        END = u.id
      )
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.updated_at DESC
      LIMIT 20
    `, [userId]);

    // Get recent messages for offline access
    const messages = await query(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.created_at,
        m.is_read
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
      AND m.created_at > NOW() - INTERVAL '7 days'
      ORDER BY m.created_at DESC
      LIMIT 100
    `, [userId]);

    // Get user's university info
    const userInfo = await query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.username,
        u.email,
        u.profile_picture,
        univ.name as university_name,
        univ.domain as university_domain
      FROM users u
      LEFT JOIN universities univ ON u.university_id = univ.id
      WHERE u.id = $1
    `, [userId]);

    // Get categories for offline post creation
    const categories = [
      { name: 'goods', subcategories: ['Textbooks', 'Electronics', 'Clothing', 'Furniture', 'Household Appliances'] },
      { name: 'services', subcategories: ['Tutoring', 'Rides', 'Food Delivery', 'Pet Care', 'Tech Support'] },
      { name: 'housing', subcategories: ['Roommates', 'Subletting', 'Apartments', 'Dorms'] },
      { name: 'events', subcategories: ['Study Groups', 'Social Events', 'Sports', 'Clubs', 'Academic'] }
    ];

    res.json({
      success: true,
      data: {
        user: userInfo.rows[0],
        conversations: conversations.rows,
        recentMessages: messages.rows,
        categories,
        syncTimestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Offline sync error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to sync offline data' }
    });
  }
});

// @route   POST /api/v1/mobile/sync/upload-offline-actions
// @desc    Upload actions performed while offline
// @access  Private
router.post('/sync/upload-offline-actions', [
  auth,
  body('actions').isArray().withMessage('Actions must be an array')
], async (req, res) => {
  try {
    const { actions } = req.body;
    const userId = req.user.id;
    const results = [];

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'like_post':
            await query(`
              INSERT INTO post_interactions (user_id, post_id, interaction_type)
              VALUES ($1, $2, 'like')
              ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
            `, [userId, action.postId]);
            results.push({ actionId: action.id, status: 'success' });
            break;

          case 'bookmark_post':
            await query(`
              INSERT INTO post_interactions (user_id, post_id, interaction_type)
              VALUES ($1, $2, 'bookmark')
              ON CONFLICT (user_id, post_id, interaction_type) DO NOTHING
            `, [userId, action.postId]);
            results.push({ actionId: action.id, status: 'success' });
            break;

          case 'send_message':
            const messageResult = await query(`
              INSERT INTO messages (conversation_id, sender_id, content)
              VALUES ($1, $2, $3)
              RETURNING id, created_at
            `, [action.conversationId, userId, action.content]);
            results.push({ 
              actionId: action.id, 
              status: 'success',
              data: messageResult.rows[0]
            });
            break;

          default:
            results.push({ actionId: action.id, status: 'unknown_action' });
        }
      } catch (actionError) {
        console.error(`Error processing action ${action.id}:`, actionError);
        results.push({ actionId: action.id, status: 'error', error: actionError.message });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        processed: results.length,
        successful: results.filter(r => r.status === 'success').length
      }
    });

  } catch (error) {
    console.error('Offline actions upload error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to process offline actions' }
    });
  }
});

// @route   GET /api/v1/mobile/app-config
// @desc    Get mobile app configuration
// @access  Private
router.get('/app-config', auth, async (req, res) => {
  try {
    const config = {
      imageUpload: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFiles: 10,
        supportedFormats: ['jpeg', 'jpg', 'png', 'heic'],
        compressionLevels: ['low', 'medium', 'high'],
        defaultCompression: 'medium'
      },
      posts: {
        maxContentLength: 2000,
        maxImages: 10,
        categories: ['goods', 'services', 'housing', 'events'],
        durations: ['1 hour', '1 day', '1 week', '1 month', 'permanent']
      },
      messaging: {
        maxMessageLength: 1000,
        offlineMessageLimit: 100,
        syncInterval: 30000 // 30 seconds
      },
      feed: {
        postsPerPage: 20,
        maxCachedPages: 5,
        refreshInterval: 300000 // 5 minutes
      },
      notifications: {
        types: ['message', 'like', 'comment', 'follow', 'system'],
        defaultEnabled: ['message', 'system']
      }
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('App config error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get app configuration' }
    });
  }
});

// @route   POST /api/v1/mobile/biometric/register
// @desc    Register biometric authentication for device
// @access  Private
router.post('/biometric/register', [
  auth,
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('biometricType').isIn(['touchid', 'faceid', 'fingerprint']).withMessage('Invalid biometric type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { deviceId, biometricType } = req.body;
    const userId = req.user.id;

    const result = await biometricAuthService.generateBiometricToken(userId, deviceId, biometricType);

    if (result.success) {
      res.json({
        success: true,
        data: {
          token: result.token,
          expiresAt: result.expiresAt
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: result.error }
      });
    }

  } catch (error) {
    console.error('Biometric registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to register biometric authentication' }
    });
  }
});

// @route   POST /api/v1/mobile/biometric/authenticate
// @desc    Authenticate using biometric token
// @access  Public
router.post('/biometric/authenticate', [
  body('token').notEmpty().withMessage('Biometric token is required'),
  body('deviceId').notEmpty().withMessage('Device ID is required')
], async (req, res) => {
  try {
    const { token, deviceId } = req.body;

    const result = await biometricAuthService.validateBiometricToken(token, deviceId);

    if (result.valid) {
      // Generate JWT token for authenticated user
      const jwt = require('jsonwebtoken');
      const jwtToken = jwt.sign(
        { userId: result.userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          token: jwtToken,
          userId: result.userId,
          biometricType: result.biometricType
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: { message: result.error }
      });
    }

  } catch (error) {
    console.error('Biometric authentication error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Biometric authentication failed' }
    });
  }
});

// @route   DELETE /api/v1/mobile/biometric/revoke
// @desc    Revoke biometric authentication
// @access  Private
router.delete('/biometric/revoke', [
  auth,
  body('deviceId').optional().isString()
], async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.id;

    const result = await biometricAuthService.revokeBiometricToken(userId, deviceId);

    if (result.success) {
      res.json({
        success: true,
        message: deviceId ? 'Device biometric access revoked' : 'All biometric access revoked'
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: result.error }
      });
    }

  } catch (error) {
    console.error('Biometric revocation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to revoke biometric access' }
    });
  }
});

// @route   POST /api/v1/mobile/deeplink/generate
// @desc    Generate deep link for sharing
// @access  Private
router.post('/deeplink/generate', [
  auth,
  body('type').isIn(['post', 'user_profile', 'conversation', 'invitation', 'share']).withMessage('Invalid link type'),
  body('targetId').notEmpty().withMessage('Target ID is required'),
  body('trackingData').optional().isObject()
], async (req, res) => {
  try {
    const { type, targetId, trackingData = {} } = req.body;
    const userId = req.user.id;

    let result;
    switch (type) {
      case 'post':
        result = await deepLinkingService.generatePostLink(targetId, userId, trackingData);
        break;
      case 'user_profile':
        result = await deepLinkingService.generateUserProfileLink(targetId, userId, trackingData);
        break;
      case 'conversation':
        result = await deepLinkingService.generateConversationLink(targetId, userId, trackingData);
        break;
      case 'share':
        result = await deepLinkingService.generateShareLink(targetId, userId, trackingData.shareType);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: { message: 'Unsupported link type' }
        });
    }

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: result.error }
      });
    }

  } catch (error) {
    console.error('Deep link generation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to generate deep link' }
    });
  }
});

// @route   GET /api/v1/mobile/deeplink/resolve/:linkId
// @desc    Resolve deep link
// @access  Public
router.get('/deeplink/resolve/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user?.id || null;
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    };

    const result = await deepLinkingService.resolveDeepLink(linkId, userId, deviceInfo);

    if (result.success) {
      res.json({
        success: true,
        data: result.resolution
      });
    } else {
      res.status(404).json({
        success: false,
        error: { message: result.error }
      });
    }

  } catch (error) {
    console.error('Deep link resolution error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to resolve deep link' }
    });
  }
});

// @route   GET /api/v1/mobile/location/suggestions
// @desc    Get location suggestions for autocomplete
// @access  Private
router.get('/location/suggestions', [
  auth,
  query('q').isLength({ min: 2 }).withMessage('Query must be at least 2 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: errors.array() }
      });
    }

    const { q: searchQuery, limit = 10 } = req.query;
    
    const suggestions = locationService.getLocationSuggestions(searchQuery, parseInt(limit));

    res.json({
      success: true,
      data: {
        suggestions,
        query: searchQuery
      }
    });

  } catch (error) {
    console.error('Location suggestions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get location suggestions' }
    });
  }
});

// @route   POST /api/v1/mobile/location/validate
// @desc    Validate location for post creation
// @access  Private
router.post('/location/validate', [
  auth,
  body('location').notEmpty().withMessage('Location is required'),
  body('postType').optional().isIn(['goods', 'services', 'housing', 'events', 'offer', 'request'])
], async (req, res) => {
  try {
    const { location, postType } = req.body;
    const userId = req.user.id;

    const validation = await locationService.validatePostLocation(location, userId, postType);

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    console.error('Location validation error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to validate location' }
    });
  }
});

// @route   GET /api/v1/mobile/location/popular
// @desc    Get popular locations for university
// @access  Private
router.get('/location/popular', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get user's university
    const userResult = await query('SELECT university_id FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const universityId = userResult.rows[0].university_id;
    const popularLocations = await locationService.getPopularLocations(universityId, parseInt(limit));

    res.json({
      success: true,
      data: {
        locations: popularLocations,
        universityId
      }
    });

  } catch (error) {
    console.error('Popular locations error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get popular locations' }
    });
  }
});

// @route   GET /api/v1/mobile/sync/status
// @desc    Get synchronization status for user
// @access  Private
router.get('/sync/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await backgroundSyncService.getSyncStatus(userId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get sync status' }
    });
  }
});

// @route   POST /api/v1/mobile/sync/force
// @desc    Force synchronization for user
// @access  Private
router.post('/sync/force', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await backgroundSyncService.forceSyncUser(userId);

    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: result.error }
      });
    }

  } catch (error) {
    console.error('Force sync error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to force synchronization' }
    });
  }
});

// @route   GET /api/v1/mobile/analytics/user-engagement
// @desc    Get user engagement analytics
// @access  Private
router.get('/analytics/user-engagement', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '7 days' } = req.query;
    
    const mobileAnalyticsService = require('../services/mobileAnalyticsService');
    const engagement = await mobileAnalyticsService.getUserEngagement(userId, timeframe);

    res.json({
      success: true,
      data: engagement
    });

  } catch (error) {
    console.error('User engagement analytics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user engagement analytics' }
    });
  }
});

module.exports = router; 