const express = require('express');
const { query } = require('express-validator');
const { query: dbQuery } = require('../config/database');
const { redisGet, redisSet, generateCacheKey, CACHE_TTL } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { optionalAuth } = require('../middleware/auth');
const { UNIVERSITY_CONFIG } = require('../config/university');

const router = express.Router();

// @route   GET /api/v1/search/posts
// @desc    Search posts with advanced filtering
// @access  Public (with optional auth for personalized results)
router.get('/posts', [
  query('query').isLength({ min: 1, max: 200 }).withMessage('Search query must be between 1 and 200 characters'),
  query('postType').optional().isIn(['offer', 'request', 'event', 'all']).withMessage('Post type filter must be offer, request, event, or all'),
  query('tags').optional().isArray({ max: 10 }).withMessage('Tags filter cannot exceed 10 items'),
  query('sortBy').optional().isIn(['recent', 'expiring', 'recurring']).withMessage('Sort must be recent, expiring, or recurring'),
  query('expandCluster').optional().isBoolean().withMessage('Expand cluster must be a boolean value'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const {
      query: searchQuery,
      postType,
      tags,
      sortBy = 'recent',
      expandCluster = false,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const user = req.user;

    // Check cache first
    const cacheKey = generateCacheKey('search', `${searchQuery}-${postType}-${tags}-${sortBy}-${expandCluster}-${page}-${limit}`);
    let cachedResults = await redisGet(cacheKey);

    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        cached: true
      });
    }

    // Build search query
    let baseQuery = `
      SELECT 
        p.*,
        u.username,
        u.first_name,
        u.last_name,
        u.display_name,
        u.profile_picture,
        un.name as university_name,
        un.city as university_city,
        un.state as university_state,
        COUNT(pi.id) as image_count,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        ts_rank(
          to_tsvector('english', p.title || ' ' || p.description),
          plainto_tsquery('english', $1)
        ) as relevance
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_images pi ON p.id = pi.post_id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = true
    `;

    const queryParams = [searchQuery];
    let paramCount = 1;

    // For now, filter to Cal Poly SLO only (multi-university ready)
    paramCount++;
    baseQuery += ` AND p.university_id = $${paramCount}`;
    queryParams.push(UNIVERSITY_CONFIG.primaryUniversityId);

    // Add post type filter
    if (postType && postType !== 'all') {
      paramCount++;
      baseQuery += ` AND p.post_type = $${paramCount}`;
      queryParams.push(postType);
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      paramCount++;
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM post_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
      )`;
      queryParams.push(tags);
    }

    // Add text search
    if (searchQuery) {
      baseQuery += ` AND (
        to_tsvector('english', p.title || ' ' || p.description) @@ plainto_tsquery('english', $1)
        OR p.title ILIKE $${paramCount + 1}
        OR p.description ILIKE $${paramCount + 1}
      )`;
      const likeQuery = `%${searchQuery}%`;
      queryParams.push(likeQuery);
      paramCount++;
    }

    // Add sorting
    if (searchQuery) {
      // If searching, sort by relevance first, then by other criteria
      baseQuery += ` GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state`;
      baseQuery += ` ORDER BY relevance DESC, `;
    } else {
      baseQuery += ` GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state`;
      baseQuery += ` ORDER BY `;
    }

    switch (sortBy) {
      case 'expiring':
        baseQuery += `p.expires_at ASC NULLS LAST, p.created_at DESC`;
        break;
      case 'recurring':
        baseQuery += `p.duration_type = 'recurring' DESC, p.created_at DESC`;
        break;
      case 'recent':
      default:
        baseQuery += `p.created_at DESC`;
        break;
    }

    // Add pagination
    baseQuery += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await dbQuery(baseQuery, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      WHERE p.is_active = true
    `;
    
    const countParams = [];
    paramCount = 0;

    if (user && !expandCluster) {
      paramCount++;
      countQuery += ` AND p.university_id = $${paramCount}`;
      countParams.push(user.university_id);
    } else if (user && expandCluster) {
      paramCount++;
      countQuery += ` AND (p.university_id = $${paramCount} OR p.university_id IN (
        SELECT u2.id FROM universities u2 
        JOIN universities u1 ON u1.cluster_id = u2.cluster_id 
        WHERE u1.id = $${paramCount}
      ))`;
      countParams.push(user.university_id);
    }

    if (postType && postType !== 'all') {
      paramCount++;
      countQuery += ` AND p.post_type = $${paramCount}`;
      countParams.push(postType);
    }

    if (tags && tags.length > 0) {
      paramCount++;
      countQuery += ` AND EXISTS (
        SELECT 1 FROM post_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
      )`;
      countParams.push(tags);
    }

    if (searchQuery) {
      countQuery += ` AND (
        to_tsvector('english', p.title || ' ' || p.description) @@ plainto_tsquery('english', $${paramCount + 1})
        OR p.title ILIKE $${paramCount + 2}
        OR p.description ILIKE $${paramCount + 2}
      )`;
      countParams.push(searchQuery, `%${searchQuery}%`);
    }

    const countResult = await dbQuery(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format posts
    const posts = result.rows.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      postType: post.post_type,
      durationType: post.duration_type,
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
        id: post.university_id,
        name: post.university_name,
        city: post.university_city,
        state: post.university_state
      },
      tags: post.tags || [],
      imageCount: post.image_count,
      relevance: post.relevance
    }));

    const searchResults = {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      searchQuery,
      filters: {
        postType,
        tags,
        sortBy,
        expandCluster
      }
    };

    // Cache results
    await redisSet(cacheKey, searchResults, CACHE_TTL.SEARCH);

    res.json({
      success: true,
      data: searchResults
    });

  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Search failed. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/search/users
// @desc    Search users by name, username, or major
// @access  Public
router.get('/users', [
  query('query').isLength({ min: 1, max: 200 }).withMessage('Search query must be 1-200 characters'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
], async (req, res) => {
  try {
    const { query: searchQuery, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check cache first
    const cacheKey = generateCacheKey('search', `users-${searchQuery}-${page}-${limit}`);
    let cachedResults = await redisGet(cacheKey);

    if (cachedResults) {
      return res.json({
        success: true,
        data: cachedResults,
        cached: true
      });
    }

    // Search users
    const result = await dbQuery(`
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
        u.created_at,
        un.name as university_name,
        un.city as university_city,
        un.state as university_state,
        COUNT(DISTINCT p.id) as post_count,
        ts_rank(
          to_tsvector('english', u.first_name || ' ' || u.last_name || ' ' || u.username || ' ' || COALESCE(u.major, '')),
          plainto_tsquery('english', $1)
        ) as relevance
      FROM users u
      JOIN universities un ON u.university_id = un.id
      LEFT JOIN posts p ON u.id = p.user_id AND p.is_active = true
      WHERE u.is_active = true AND (
        to_tsvector('english', u.first_name || ' ' || u.last_name || ' ' || u.username || ' ' || COALESCE(u.major, '')) @@ plainto_tsquery('english', $1)
        OR u.first_name ILIKE $2
        OR u.last_name ILIKE $2
        OR u.username ILIKE $2
        OR u.major ILIKE $2
      )
      GROUP BY u.id, un.name, un.city, un.state
      ORDER BY relevance DESC, u.created_at DESC
      LIMIT $3 OFFSET $4
    `, [searchQuery, `%${searchQuery}%`, limit, offset]);

    // Get total count
    const countResult = await dbQuery(`
      SELECT COUNT(*) as total
      FROM users u
      WHERE u.is_active = true AND (
        to_tsvector('english', u.first_name || ' ' || u.last_name || ' ' || u.username || ' ' || COALESCE(u.major, '')) @@ plainto_tsquery('english', $1)
        OR u.first_name ILIKE $2
        OR u.last_name ILIKE $2
        OR u.username ILIKE $2
        OR u.major ILIKE $2
      )
    `, [searchQuery, `%${searchQuery}%`]);

    const total = parseInt(countResult.rows[0].total);

    // Format users
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      displayName: user.display_name,
      profilePicture: user.profile_picture,
      year: user.year,
      major: user.major,
      hometown: user.hometown,
      createdAt: user.created_at,
      university: {
        name: user.university_name,
        city: user.university_city,
        state: user.university_state
      },
      postCount: user.post_count || 0,
      relevance: user.relevance
    }));

    const searchResults = {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      searchQuery
    };

    // Cache results
    await redisSet(cacheKey, searchResults, CACHE_TTL.SEARCH);

    res.json({
      success: true,
      data: searchResults
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Search failed. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/search/tags
// @desc    Search and suggest tags
// @access  Public
router.get('/tags', [
  query('query').optional().isLength({ min: 1, max: 100 }).withMessage('Search query must be 1-100 characters'),
  validate
], async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    let result;
    if (searchQuery) {
      // Search for specific tags
      result = await dbQuery(`
        SELECT 
          t.id,
          t.name,
          t.category,
          COUNT(pt.post_id) as usage_count
        FROM tags t
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        WHERE t.name ILIKE $1
        GROUP BY t.id, t.name, t.category
        ORDER BY usage_count DESC, t.name ASC
        LIMIT 20
      `, [`%${searchQuery}%`]);
    } else {
      // Get popular tags
      result = await dbQuery(`
        SELECT 
          t.id,
          t.name,
          t.category,
          COUNT(pt.post_id) as usage_count
        FROM tags t
        LEFT JOIN post_tags pt ON t.id = pt.tag_id
        GROUP BY t.id, t.name, t.category
        ORDER BY usage_count DESC, t.name ASC
        LIMIT 50
      `);
    }

    const tags = result.rows.map(tag => ({
      id: tag.id,
      name: tag.name,
      category: tag.category,
      usageCount: parseInt(tag.usage_count) || 0
    }));

    res.json({
      success: true,
      data: {
        tags,
        searchQuery
      }
    });

  } catch (error) {
    console.error('Search tags error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch tags. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/search/universities
// @desc    Search universities by name or location
// @access  Public
router.get('/universities', [
  query('query').optional().isLength({ min: 1, max: 200 }).withMessage('Search query must be 1-200 characters'),
  validate
], async (req, res) => {
  try {
    const { query: searchQuery } = req.query;

    let result;
    if (searchQuery) {
      // Search for specific universities
      result = await dbQuery(`
        SELECT 
          u.id,
          u.name,
          u.domain,
          u.city,
          u.state,
          u.country,
          u.latitude,
          u.longitude,
          c.name as cluster_name,
          COUNT(us.id) as user_count
        FROM universities u
        LEFT JOIN clusters c ON u.cluster_id = c.id
        LEFT JOIN users us ON u.id = us.university_id AND us.is_active = true
        WHERE u.name ILIKE $1 OR u.city ILIKE $1 OR u.state ILIKE $1
        GROUP BY u.id, u.name, u.domain, u.city, u.state, u.country, u.latitude, u.longitude, c.name
        ORDER BY user_count DESC, u.name ASC
        LIMIT 20
      `, [`%${searchQuery}%`]);
    } else {
      // Get all universities with user counts
      result = await dbQuery(`
        SELECT 
          u.id,
          u.name,
          u.domain,
          u.city,
          u.state,
          u.country,
          u.latitude,
          u.longitude,
          c.name as cluster_name,
          COUNT(us.id) as user_count
        FROM universities u
        LEFT JOIN clusters c ON u.cluster_id = c.id
        LEFT JOIN users us ON u.id = us.university_id AND us.is_active = true
        GROUP BY u.id, u.name, u.domain, u.city, u.state, u.country, u.latitude, u.longitude, c.name
        ORDER BY user_count DESC, u.name ASC
        LIMIT 100
      `);
    }

    const universities = result.rows.map(uni => ({
      id: uni.id,
      name: uni.name,
      domain: uni.domain,
      city: uni.city,
      state: uni.state,
      country: uni.country,
      location: {
        latitude: uni.latitude,
        longitude: uni.longitude
      },
      cluster: uni.cluster_name,
      userCount: parseInt(uni.user_count) || 0
    }));

    res.json({
      success: true,
      data: {
        universities,
        searchQuery
      }
    });

  } catch (error) {
    console.error('Search universities error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch universities. Please try again.'
      }
    });
  }
});

module.exports = router; 