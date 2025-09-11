const express = require('express');
const { body, query: queryValidator, param } = require('express-validator');
const { query } = require('../config/database');
const { redisGet, redisSet, redisDel, generateCacheKey, CACHE_TTL } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { auth, checkOwnership, requireVerification } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check cache first
    const cacheKey = generateCacheKey('user', userId);
    let user = await redisGet(cacheKey);

    if (!user) {
      // Get user from database
      const result = await query(`
        SELECT 
          u.*,
          un.name as university_name,
          un.domain as university_domain,
          un.city as university_city,
          un.state as university_state,
          COUNT(DISTINCT p.id) as post_count,
          COUNT(DISTINCT CASE WHEN p.is_fulfilled = true THEN p.id END) as fulfilled_posts
        FROM users u
        JOIN universities un ON u.university_id = un.id
        LEFT JOIN posts p ON u.id = p.user_id AND p.is_active = true
        WHERE u.id = $1 AND u.is_active = true
        GROUP BY u.id, un.name, un.domain, un.city, un.state
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found'
          }
        });
      }

      user = result.rows[0];
      
      // Cache user data
      await redisSet(cacheKey, user, CACHE_TTL.USER);
    }

    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: user.display_name,
      profilePicture: user.profile_picture,
      year: user.year,
      major: user.major,
      hometown: user.hometown,
      bio: user.bio,
      university: {
        id: user.university_id,
        name: user.university_name,
        domain: user.university_domain,
        city: user.university_city,
        state: user.university_state
      },
      isVerified: user.is_verified,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      stats: {
        postCount: user.post_count || 0,
        fulfilledPosts: user.fulfilled_posts || 0
      }
    };

    res.json({
      success: true,
      data: {
        user: formattedUser
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch profile. Please try again.'
      }
    });
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update current user's profile
// @access  Private
router.put('/profile', [
  auth,
  requireVerification,
  body('firstName').optional().isLength({ min: 1, max: 100 }).isAlpha().withMessage('First name must be 1-100 letters'),
  body('lastName').optional().isLength({ min: 1, max: 100 }).isAlpha().withMessage('Last name must be 1-100 letters'),
  body('year').optional().isInt({ min: 1, max: 10 }).withMessage('Year must be 1-10'),
  body('major').optional().isLength({ max: 200 }).withMessage('Major cannot exceed 200 characters'),
  body('hometown').optional().isLength({ max: 200 }).withMessage('Hometown cannot exceed 200 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, year, major, hometown, bio } = req.body;

    // Build update query dynamically
    const updateFields = [];
    const queryParams = [];
    let paramCount = 0;

    if (firstName !== undefined) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      queryParams.push(firstName);
    }

    if (lastName !== undefined) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      queryParams.push(lastName);
    }

    if (year !== undefined) {
      paramCount++;
      updateFields.push(`year = $${paramCount}`);
      queryParams.push(year);
    }

    if (major !== undefined) {
      paramCount++;
      updateFields.push(`major = $${paramCount}`);
      queryParams.push(major);
    }

    if (hometown !== undefined) {
      paramCount++;
      updateFields.push(`hometown = $${paramCount}`);
      queryParams.push(hometown);
    }

    if (bio !== undefined) {
      paramCount++;
      updateFields.push(`bio = $${paramCount}`);
      queryParams.push(bio);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No fields to update'
        }
      });
    }

    // Add updated_at and user ID to params
    paramCount++;
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    queryParams.push(userId);

    const result = await query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, first_name, last_name, display_name, year, major, hometown, bio, updated_at
    `, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const updatedUser = result.rows[0];

    // Clear cache
    const cacheKey = generateCacheKey('user', userId);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          displayName: updatedUser.display_name,
          year: updatedUser.year,
          major: updatedUser.major,
          hometown: updatedUser.hometown,
          bio: updatedUser.bio,
          updatedAt: updatedUser.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile. Please try again.'
      }
    });
  }
});

// @route   PUT /api/v1/users/profile-picture
// @desc    Update current user's profile picture
// @access  Private
router.put('/profile-picture', [
  auth,
  requireVerification,
  body('profilePictureUrl')
    .custom((value) => {
      // Allow full URLs or relative paths starting with /uploads/
      if (value.startsWith('/uploads/') || value.match(/^https?:\/\//)) {
        return true;
      }
      throw new Error('Profile picture must be a valid URL or upload path');
    }),
  validate
], async (req, res) => {
  try {
    const userId = req.user.id;
    const { profilePictureUrl } = req.body;
    
    console.log('🖼️ Profile picture update request:', {
      userId,
      profilePictureUrl,
      requestBody: req.body
    });

    // Update user's profile picture
    const result = await query(`
      UPDATE users 
      SET profile_picture = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, first_name, last_name, display_name, profile_picture, updated_at
    `, [profilePictureUrl, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const updatedUser = result.rows[0];

    // Clear cache
    const cacheKey = generateCacheKey('user', userId);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          displayName: updatedUser.display_name,
          profilePicture: updatedUser.profile_picture,
          updatedAt: updatedUser.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile picture. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/users/:id
// @desc    Get public user profile by ID
// @access  Public
router.get('/:id', [
  param('id').isInt().withMessage('User ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = generateCacheKey('user', id);
    let user = await redisGet(cacheKey);

    if (!user) {
      // Get user from database
      const result = await query(`
        SELECT 
          u.id,
          u.username,
          u.first_name,
          u.last_name,
          u.display_name,
          u.profile_picture,
          u.year,
          u.major,
          u.hometown,
          u.university_id,
          u.is_verified,
          u.created_at,
          un.name as university_name,
          un.city as university_city,
          un.state as university_state,
          COUNT(DISTINCT p.id) as post_count,
          COUNT(DISTINCT CASE WHEN p.is_fulfilled = true THEN p.id END) as fulfilled_posts
        FROM users u
        JOIN universities un ON u.university_id = un.id
        LEFT JOIN posts p ON u.id = p.user_id AND p.is_active = true
        WHERE u.id = $1 AND u.is_active = true
        GROUP BY u.id, un.name, un.city, un.state
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'User not found'
          }
        });
      }

      user = result.rows[0];
      
      // Cache user data
      await redisSet(cacheKey, user, CACHE_TTL.USER);
    }

    const formattedUser = {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: user.display_name,
      profilePicture: user.profile_picture,
      year: user.year,
      major: user.major,
      hometown: user.hometown,
      isVerified: user.is_verified,
      university: {
        id: user.university_id,
        name: user.university_name,
        city: user.university_city,
        state: user.university_state
      },
      createdAt: user.created_at,
      stats: {
        postCount: user.post_count || 0,
        fulfilledPosts: user.fulfilled_posts || 0
      }
    };

    res.json({
      success: true,
      data: formattedUser
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/users/:id/posts
// @desc    Get posts by user ID
// @access  Public
router.get('/:id/posts', [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  param('id').isInt().withMessage('User ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get user posts
    const result = await query(`
      SELECT 
        p.*,
        u.username, u.first_name, u.last_name, u.display_name, u.profile_picture,
        un.name as university_name,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        ARRAY_AGG(DISTINCT pi.image_url ORDER BY pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images,
        COUNT(pi.id) as image_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN post_images pi ON p.id = pi.post_id
      WHERE p.user_id = $1 AND p.is_active = true
      GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM posts
      WHERE user_id = $1 AND is_active = true
    `, [id]);

    const total = parseInt(countResult.rows[0].total);

    // Format posts
    const posts = result.rows.map(post => ({
      id: post.id,
      userId: post.user_id,
      title: post.title,
      description: post.description,
      postType: post.post_type,
      durationType: post.duration_type,
      location: post.location,
      expiresAt: post.expires_at,
      eventStart: post.event_start,
      eventEnd: post.event_end,
      isFulfilled: post.is_fulfilled,
      viewCount: post.view_count,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      poster: {
        id: post.user_id,
        username: post.username,
        firstName: post.first_name,
        lastName: post.last_name,
        displayName: post.display_name,
        profilePicture: post.profile_picture
      },
      university: {
        name: post.university_name
      },
      tags: post.tags || [],
      images: post.images || [],
      imageCount: post.image_count
    }));

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch user posts. Please try again.'
      }
    });
  }
});

// @route   DELETE /api/v1/users/profile
// @desc    Deactivate current user account
// @access  Private
router.delete('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Deactivate user account
    const result = await query(`
      UPDATE users 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    // Clear all user sessions
    await query(`
      DELETE FROM user_sessions 
      WHERE user_id = $1
    `, [userId]);

    // Clear cache
    const cacheKey = generateCacheKey('user', userId);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to deactivate account. Please try again.'
      }
    });
  }
});

module.exports = router; 