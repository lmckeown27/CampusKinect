const express = require('express');
const { body, query: queryValidator, param } = require('express-validator');
const { query: dbQuery, pool } = require('../config/database');
const { redisGet, redisSet, redisDel, generateCacheKey, CACHE_TTL } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { auth, checkOwnership, requireVerification } = require('../middleware/auth');
const { uploadImage } = require('../services/imageService');
const { UNIVERSITY_CONFIG } = require('../config/university');
const { calculateNextRepostDate, getRepostHistory, stopRecurringPost } = require('../services/recurringPostService');
const { updatePostScores } = require('../services/scoringService');
const { getFeedPositionedPosts, getSmartFeedWithPositioning } = require('../services/scoringService');
const multiUniversityScoringService = require('../services/multiUniversityScoringService');
const personalizedFeedService = require('../services/personalizedFeedService');

const router = express.Router();

// @route   GET /api/v1/posts/organized
// @desc    Get organized feed with recurring posts prioritized
// @access  Public
router.get('/organized', [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('postType').optional().isIn(['goods', 'services', 'events', 'housing', 'tutoring', 'all']).withMessage('Invalid post type'),
  queryValidator('tags').optional().custom((value, { req }) => {
    // Handle both 'tags' and 'tags[]' parameter formats
    const tags = req.query.tags || req.query['tags[]'];
    if (tags && !Array.isArray(tags) && typeof tags !== 'string') {
      throw new Error('Tags must be an array or string');
    }
    return true;
  }).withMessage('Tags must be an array'),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      postType
    } = req.query;

    // Handle tags parameter (support both 'tags' and 'tags[]' formats)
    let tags = req.query.tags || req.query['tags[]'];
    if (tags && typeof tags === 'string') {
      tags = [tags]; // Convert single string to array
    }

    // Handle postTypes parameter (support both 'postTypes' and 'postTypes[]' formats)
    let postTypes = req.query.postTypes || req.query['postTypes[]'];
    if (postTypes && typeof postTypes === 'string') {
      postTypes = [postTypes]; // Convert single string to array
    }

    const offset = (page - 1) * limit;

          // Build organized query - recurring posts first, then events, then one-time posts
      let organizedQuery = `
        SELECT 
          p.id,
          p.user_id,
          p.university_id,
          p.title,
          p.description,
          p.post_type,
          p.duration_type,
          p.location,
          p.repost_frequency,
          p.original_post_id,
                  p.message_count,
        p.share_count,
        p.bookmark_count,
        p.repost_count,
        p.engagement_score,
        p.base_score,
        p.time_urgency_bonus,
        p.final_score,
        p.expires_at,
        p.event_start,
        p.event_end,
        p.is_fulfilled,
        p.is_active,
        p.view_count,
        p.created_at,
        p.updated_at,
        p.review_count,
        p.average_rating,
        p.review_score_bonus,
        (SELECT COUNT(*) FROM deleted_reviews WHERE post_id = p.id) as deleted_review_count,
        u.username,
        u.first_name,
        u.last_name,
        u.display_name,
        u.profile_picture,
        un.name as university_name,
        un.city as university_city,
        un.state as university_state,
        COUNT(pi.id) as image_count,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_images pi ON p.id = pi.post_id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = true AND p.university_id = $1
    `;

    const queryParams = [UNIVERSITY_CONFIG.primaryUniversityId];
    let paramCount = 1;

    // Add post type filter - New system: Primary tag is the main category
    if (postTypes && postTypes.length > 0) {
      // Multiple post types selected
      paramCount++;
      const validPostTypes = postTypes.filter(pt => ['goods', 'services', 'housing', 'events'].includes(pt));
      if (validPostTypes.length > 0) {
        organizedQuery += ` AND p.post_type = ANY($${paramCount})`;
        queryParams.push(validPostTypes);
      }
    } else if (postType && postType !== 'all') {
      // Single post type selected (legacy/fallback)
      paramCount++;
      switch (postType) {
        case 'goods':
          organizedQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('goods');
          break;
        case 'services':
          organizedQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('services');
          break;
        case 'housing':
          organizedQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('housing');
          break;
        case 'events':
          organizedQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('events');
          break;
        default:
          organizedQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push(postType);
      }
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      paramCount++;
      organizedQuery += ` AND EXISTS (
        SELECT 1 FROM post_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
      )`;
      queryParams.push(tags);
    }

    // Organized ordering: high-engagement recurring first, then events, then low-engagement recurring, then one-time posts
    organizedQuery += ` 
      GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state
      ORDER BY 
        CASE 
          WHEN p.duration_type = 'recurring' AND p.engagement_score >= 5.0 THEN 0
          WHEN p.duration_type = 'event' THEN 1
          WHEN p.duration_type = 'recurring' AND p.engagement_score < 5.0 THEN 2
          ELSE 3
        END,
        p.engagement_score DESC,
        p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;

    queryParams.push(limit, offset);

    // Execute organized query
    const result = await dbQuery(organizedQuery, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      WHERE p.is_active = true AND p.university_id = $1
    `;
    
    const countParams = [UNIVERSITY_CONFIG.primaryUniversityId];
    paramCount = 1;

    if (postType && postType !== 'all') {
      paramCount++;
      // Map frontend postType values to backend database values
      let dbPostType;
      switch (postType) {
        case 'goods':
        case 'services':
        case 'housing':
        case 'tutoring':
          // These are all considered "goods-services" in the database
          dbPostType = 'goods-services';
          break;
        case 'events':
          dbPostType = 'events';
          break;
        default:
          dbPostType = postType;
      }
      countQuery += ` AND p.post_type = $${paramCount}`;
      countParams.push(dbPostType);
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

    const countResult = await dbQuery(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format posts with organization info
    const posts = result.rows.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      postType: post.post_type,
      durationType: post.duration_type,
      location: post.location,
      repostFrequency: post.repost_frequency,
      isRecurring: post.duration_type === 'recurring',
      originalPostId: post.original_post_id,
      engagement: {
        messageCount: post.message_count || 0,
        shareCount: post.share_count || 0,
        bookmarkCount: post.bookmark_count || 0,
        repostCount: post.repost_count || 0,
        score: post.engagement_score || 0
      },
      scoring: {
        baseScore: post.base_score || 0,
        timeUrgencyBonus: post.time_urgency_bonus || 0,
        finalScore: post.final_score || 0
      },
      reviews: {
        count: post.review_count || 0,
        averageRating: parseFloat(post.average_rating) || 0,
        scoreBonus: post.review_score_bonus || 0
      },
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
      deletedReviewCount: post.deleted_review_count || 0
    }));

    res.json({
      success: true,
      data: {
        posts,
        organization: {
          recurringCount: posts.filter(p => p.isRecurring).length,
          eventCount: posts.filter(p => p.durationType === 'event').length,
          oneTimeCount: posts.filter(p => p.durationType === 'one-time').length
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get organized posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch organized posts. Please try again.'
      }
    });
  }
});

// GET /api/v1/posts/feed-positioned - Get posts with feed positioning probabilities
router.get('/feed-positioned', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  validate
], async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const posts = await getFeedPositionedPosts(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: posts.length
      }
    });
    
  } catch (error) {
    console.error('Get feed positioned posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feed positioned posts',
      error: error.message
    });
  }
});

// GET /api/v1/posts/smart-feed - Get smart feed with positioning metadata
router.get('/smart-feed', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  validate
], async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const smartFeed = await getSmartFeedWithPositioning(parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: smartFeed.posts,
      metadata: smartFeed.metadata,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: smartFeed.posts.length
      }
    });
    
  } catch (error) {
    console.error('Get smart feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve smart feed',
      error: error.message
    });
  }
});

// GET /api/v1/posts/personalized-feed - Get personalized feed based on user interactions and bookmarks
router.get('/personalized-feed', [
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  queryValidator('mainTab').optional().isIn(['goods-services', 'events', 'combined']).withMessage('Invalid main tab category'),
  queryValidator('subTab').optional().isString().withMessage('Sub tab must be a string'),
  queryValidator('offers').optional().isBoolean().withMessage('Offers filter must be boolean'),
  queryValidator('requests').optional().isBoolean().withMessage('Requests filter must be boolean'),
  validate
], async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      mainTab = 'combined', 
      subTab = 'all',
      offers,
      requests
    } = req.query;

    // Get user ID from authentication (if available)
    const userId = req.user ? req.user.id : null;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required for personalized feed'
        }
      });
    }

    const options = { offers, requests };
    
    const personalizedFeed = await personalizedFeedService.getPersonalizedFeed(
      userId,
      parseInt(limit),
      parseInt(offset),
      mainTab,
      subTab,
      options
    );

    // Format posts with personalization data
    const formattedPosts = personalizedFeed.posts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      postType: post.post_type,
      durationType: post.duration_type,
      repostFrequency: post.repost_frequency,
      isRecurring: post.duration_type === 'recurring',
      originalPostId: post.original_post_id,
      expiresAt: post.expires_at,
      eventStart: post.event_start,
      eventEnd: post.event_end,
      isFulfilled: post.is_fulfilled,
      isActive: post.is_active,
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
      engagement: {
        messageCount: post.message_count,
        shareCount: post.share_count,
        bookmarkCount: post.bookmark_count,
        repostCount: post.repost_count,
        engagementScore: post.engagement_score
      },
      scoring: {
        baseScore: post.base_score,
        timeUrgencyBonus: post.time_urgency_bonus,
        finalScore: post.final_score
      },
      reviews: {
        count: post.review_count || 0,
        averageRating: parseFloat(post.average_rating) || 0,
        scoreBonus: post.review_score_bonus || 0
      },
      personalization: post.personalization
    }));

    res.json({
      success: true,
      data: {
        posts: formattedPosts,
        pagination: personalizedFeed.pagination,
        personalization: personalizedFeed.personalization
      }
    });

  } catch (error) {
    console.error('Get personalized feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve personalized feed',
      error: error.message
    });
  }
});

// GET /api/v1/posts/tabbed - Get posts organized by main tabs with slide-out sub-tab selection
router.get('/tabbed', [
  queryValidator('mainTab').optional().isIn(['goods-services', 'events', 'combined']).withMessage('Invalid main tab category'),
  queryValidator('subTab').optional().isString().withMessage('Sub tab must be a string'),
  queryValidator('offers').optional().isBoolean().withMessage('Offers filter must be boolean'),
  queryValidator('requests').optional().isBoolean().withMessage('Requests filter must be boolean'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  validate
], async (req, res) => {
  try {
    const { mainTab = 'combined', subTab = 'all', offers, requests, limit = 20, offset = 0 } = req.query;
    
    // Define main tab structure with simplified sub-tabs
    const MAIN_TABS = {
      'goods-services': {
        name: 'Goods/Services',
        description: 'Posts for goods, services, and general campus needs',
        icon: '🛍️',
        slideDirection: 'left',
        subTabs: {
          all: {
            name: 'All',
            description: 'All goods and services posts',
            tags: [],
            icon: '🏠'
          },
          leasing: {
            name: 'Leasing',
            description: 'Housing and apartment related posts',
            tags: ['housing', 'apartment', 'lease', 'roommate', 'sublet'],
            icon: '🏠'
          },
          tutoring: {
            name: 'Tutoring',
            description: 'Academic help and tutoring services',
            tags: ['tutoring', 'homework', 'study', 'academic', 'math', 'science', 'english'],
            icon: '📚'
          },
          books: {
            name: 'Books',
            description: 'Textbooks and reading materials',
            tags: ['textbook', 'book', 'reading', 'course', 'education'],
            icon: '📖'
          },
          rides: {
            name: 'Rides',
            description: 'Transportation and carpooling',
            tags: ['ride', 'carpool', 'transport', 'drive', 'travel'],
            icon: '🚗'
          },
          food: {
            name: 'Food',
            description: 'Food sharing and dining',
            tags: ['food', 'dining', 'meal', 'cooking', 'restaurant'],
            icon: '🍕'
          },
          other: {
            name: 'Other',
            description: 'Miscellaneous goods and services',
            tags: ['other', 'misc', 'service', 'help'],
            icon: '🔧'
          }
        }
      },
      'combined': {
        name: 'All',
        description: 'Combined feed of all posts and events',
        icon: '🏠',
        slideDirection: 'none',
        subTabs: {
          all: {
            name: 'All Posts',
            description: 'All posts and events combined',
            tags: [],
            icon: '🏠'
          }
        }
      },
      'events': {
        name: 'Events',
        description: 'Campus events and activities',
        icon: '🎉',
        slideDirection: 'right',
        subTabs: {
          all: {
            name: 'All Events',
            description: 'All campus events and activities',
            tags: ['event'],
            icon: '🎉'
          },
          sport: {
            name: 'Sport',
            description: 'Sports and athletic events',
            tags: ['event', 'sport', 'athletic', 'game', 'tournament', 'fitness'],
            icon: '⚽'
          },
          rush: {
            name: 'Rush',
            description: 'Greek life and rush events',
            tags: ['event', 'rush', 'greek', 'fraternity', 'sorority', 'recruitment'],
            icon: '🏛️'
          },
          philanthropy: {
            name: 'Philanthropy',
            description: 'Charity and community service events',
            tags: ['event', 'philanthropy', 'charity', 'community', 'service', 'volunteer'],
            icon: '🤝'
          },
          academic: {
            name: 'Academic',
            description: 'Academic and educational events',
            tags: ['event', 'academic', 'lecture', 'workshop', 'seminar', 'conference'],
            icon: '🎓'
          },
          social: {
            name: 'Social',
            description: 'Social and entertainment events',
            tags: ['event', 'social', 'party', 'club', 'entertainment', 'music'],
            icon: '🎊'
          },
          cultural: {
            name: 'Cultural',
            description: 'Cultural and diversity events',
            tags: ['event', 'cultural', 'diversity', 'heritage', 'international', 'celebration'],
            icon: '🌍'
          }
        }
      }
    };
    
    const selectedMainTab = MAIN_TABS[mainTab];
    const selectedSubTab = selectedMainTab.subTabs[subTab] || selectedMainTab.subTabs.all;
    
    // Build the base query
    let baseQuery = `
      SELECT 
        p.id, p.user_id, p.university_id, p.title, p.description, p.post_type, 
        p.duration_type, p.location, p.repost_frequency, p.original_post_id, p.message_count,
        p.share_count, p.bookmark_count, p.repost_count, p.engagement_score,
        p.base_score, p.time_urgency_bonus, p.final_score, p.expires_at, 
        p.event_start, p.event_end, p.is_fulfilled, p.is_active, p.view_count,
        p.created_at, p.updated_at,
        u.username, u.first_name, u.last_name, u.display_name, u.profile_picture,
        un.name as university_name, un.city as university_city, un.state as university_state,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = true AND p.university_id = $1
    `;
    
    const queryParams = [UNIVERSITY_CONFIG.primaryUniversityId];
    let paramCount = 1;
    
    // Apply main tab filtering
    if (mainTab === 'combined') {
      // Combined tab shows all posts (no filtering by post type)
      // This allows users to see both goods/services and events mixed together
    } else if (mainTab === 'events') {
      // Events tab only shows event posts
      paramCount++;
      baseQuery += ` AND p.post_type = 'event'`;
    } else {
      // Goods/Services tab excludes event posts
      paramCount++;
      baseQuery += ` AND p.post_type != 'event'`;
    }
    
    // Apply sub-tab specific tag filtering (except for 'all' sub-tabs)
    if (subTab !== 'all' && selectedSubTab.tags.length > 0) {
      paramCount++;
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM post_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
      )`;
      queryParams.push(selectedSubTab.tags);
    }
    
    // Apply offer/request filtering logic for goods/services (not for combined or events)
    if (mainTab === 'goods-services') {
      // If offers is true and requests is false, show only offers
      if (offers === true && requests === false) {
        paramCount++;
        baseQuery += ` AND p.post_type = 'offer'`;
      }
      // If offers is false and requests is true, show only requests
      else if (offers === false && requests === true) {
        paramCount++;
        baseQuery += ` AND p.post_type = 'request'`;
      }
      // If both are true, false, or undefined, show both (no additional filter)
    }
    
    baseQuery += ` GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state`;
    
    // Order by new post boost first, then by final score
    baseQuery += ` ORDER BY 
      CASE WHEN p.created_at >= NOW() - INTERVAL '24 hours' THEN 0 ELSE 1 END,
      p.final_score DESC,
      p.created_at DESC`;
    
    baseQuery += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));
    
    const result = await queryValidator(baseQuery, queryParams);
    
    // Format posts with tab-specific information
    const formattedPosts = result.rows.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      postType: post.post_type,
      durationType: post.duration_type,
      repostFrequency: post.repost_frequency,
      isRecurring: post.duration_type === 'recurring',
      originalPostId: post.original_post_id,
      expiresAt: post.expires_at,
      eventStart: post.event_start,
      eventEnd: post.event_end,
      isFulfilled: post.is_fulfilled,
      isActive: post.is_active,
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
      engagement: {
        messageCount: post.message_count,
        shareCount: post.share_count,
        bookmarkCount: post.bookmark_count,
        repostCount: post.repost_count,
        engagementScore: post.engagement_score
      },
      scoring: {
        baseScore: post.base_score,
        timeUrgencyBonus: post.time_urgency_bonus,
        finalScore: post.final_score
      }
    }));
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      WHERE p.is_active = true AND p.university_id = $1
    `;
    
    const countParams = [UNIVERSITY_CONFIG.primaryUniversityId];
    paramCount = 1;
    
    // Apply main tab filtering for count
    if (mainTab === 'combined') {
      // Combined tab shows all posts (no filtering by post type)
    } else if (mainTab === 'events') {
      countQuery += ` AND p.post_type = 'event'`;
    } else {
      countQuery += ` AND p.post_type != 'event'`;
    }
    
    if (subTab !== 'all' && selectedSubTab.tags.length > 0) {
      paramCount++;
      countQuery += ` AND EXISTS (
        SELECT 1 FROM post_tags pt2 
        JOIN tags t2 ON pt2.tag_id = t2.id 
        WHERE pt2.post_id = p.id AND t2.name = ANY($${paramCount})
      )`;
      countParams.push(selectedSubTab.tags);
    }
    
    // Apply offer/request filtering for count
    if (mainTab === 'goods-services') {
      if (offers === true && requests === false) {
        paramCount++;
        countQuery += ` AND p.post_type = 'offer'`;
      }
      else if (offers === false && requests === true) {
        paramCount++;
        countQuery += ` AND p.post_type = 'request'`;
      }
    }
    
    const countResult = await queryValidator(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get tab metadata for slide-out panel
    const tabMetadata = {
      mainTab: {
        id: mainTab,
        name: selectedMainTab.name,
        description: selectedMainTab.description,
        icon: selectedMainTab.icon,
        slideDirection: selectedMainTab.slideDirection
      },
      subTab: {
        id: subTab,
        name: selectedSubTab.name,
        description: selectedSubTab.description,
        icon: selectedSubTab.icon
      },
      availableMainTabs: Object.entries(MAIN_TABS).map(([id, tab]) => ({
        id,
        name: tab.name,
        description: tab.description,
        icon: tab.icon,
        slideDirection: tab.slideDirection
      })),
      availableSubTabs: Object.entries(selectedMainTab.subTabs).map(([id, subTab]) => ({
        id,
        name: subTab.name,
        description: subTab.description,
        icon: subTab.icon
      })),
      // Offer/Request filter state for goods/services
      filterState: mainTab === 'goods-services' ? {
        offers: offers === true,
        requests: requests === true,
        description: getFilterDescription(offers, requests)
      } : null
    };
    
    res.json({
      success: true,
      data: formattedPosts,
      metadata: {
        tab: tabMetadata,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total,
          hasMore: offset + limit < total
        }
      }
    });
    
  } catch (error) {
    console.error('Get tabbed posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tabbed posts',
      error: error.message
    });
  }
});

// Helper function to describe the current filter state
const getFilterDescription = (offers, requests) => {
  if (offers === true && requests === false) {
    return 'Showing only offers';
  } else if (offers === false && requests === true) {
    return 'Showing only requests';
  } else if (offers === true && requests === true) {
    return 'Showing both offers and requests';
  } else {
    return 'Showing both offers and requests';
  }
};

// GET /api/v1/posts/tabs - Get available main tabs and sub-tabs with metadata for slide-out panel
router.get('/tabs', async (req, res) => {
  try {
    const MAIN_TABS = {
      'goods-services': {
        name: 'Goods/Services',
        description: 'Posts for goods, services, and general campus needs',
        icon: '🛍️',
        slideDirection: 'left',
        subTabs: {
          all: {
            name: 'All',
            description: 'All goods and services posts',
            tags: [],
            icon: '🏠',
            postCount: 0
          },
          leasing: {
            name: 'Leasing',
            description: 'Housing and apartment related posts',
            tags: ['housing', 'apartment', 'lease', 'roommate', 'sublet'],
            icon: '🏠',
            postCount: 0
          },
          tutoring: {
            name: 'Tutoring',
            description: 'Academic help and tutoring services',
            tags: ['tutoring', 'homework', 'study', 'academic', 'math', 'science', 'english'],
            icon: '📚',
            postCount: 0
          },
          books: {
            name: 'Books',
            description: 'Textbooks and reading materials',
            tags: ['textbook', 'book', 'reading', 'course', 'education'],
            icon: '📖',
            postCount: 0
          },
          rides: {
            name: 'Rides',
            description: 'Transportation and carpooling',
            tags: ['ride', 'carpool', 'transport', 'drive', 'travel'],
            icon: '🚗',
            postCount: 0
          },
          food: {
            name: 'Food',
            description: 'Food sharing and dining',
            tags: ['food', 'dining', 'meal', 'cooking', 'restaurant'],
            icon: '🍕',
            postCount: 0
          },
          other: {
            name: 'Other',
            description: 'Miscellaneous goods and services',
            tags: ['other', 'misc', 'service', 'help'],
            icon: '🔧',
            postCount: 0
          }
        }
      },
      'combined': {
        name: 'All',
        description: 'Combined feed of all posts and events',
        icon: '🏠',
        slideDirection: 'none',
        subTabs: {
          all: {
            name: 'All Posts',
            description: 'All posts and events combined',
            tags: [],
            icon: '🏠',
            postCount: 0
          }
        }
      },
      'events': {
        name: 'Events',
        description: 'Campus events and activities',
        icon: '🎉',
        slideDirection: 'right',
        subTabs: {
          all: {
            name: 'All Events',
            description: 'All campus events and activities',
            tags: ['event'],
            icon: '🎉',
            postCount: 0
          },
          sport: {
            name: 'Sport',
            description: 'Sports and athletic events',
            tags: ['event', 'sport', 'athletic', 'game', 'tournament', 'fitness'],
            icon: '⚽',
            postCount: 0
          },
          rush: {
            name: 'Rush',
            description: 'Greek life and rush events',
            tags: ['event', 'rush', 'greek', 'fraternity', 'sorority', 'recruitment'],
            icon: '🏛️',
            postCount: 0
          },
          philanthropy: {
            name: 'Philanthropy',
            description: 'Charity and community service events',
            tags: ['event', 'philanthropy', 'charity', 'community', 'service', 'volunteer'],
            icon: '🤝',
            postCount: 0
          },
          academic: {
            name: 'Academic',
            description: 'Academic and educational events',
            tags: ['event', 'academic', 'lecture', 'workshop', 'seminar', 'conference'],
            icon: '🎓',
            postCount: 0
          },
          social: {
            name: 'Social',
            description: 'Social and entertainment events',
            tags: ['event', 'social', 'party', 'club', 'entertainment', 'music'],
            icon: '🎊',
            postCount: 0
          },
          cultural: {
            name: 'Cultural',
            description: 'Cultural and diversity events',
            tags: ['event', 'cultural', 'diversity', 'heritage', 'international', 'celebration'],
            icon: '🌍',
            postCount: 0
          }
        }
      }
    };
    
    // Get post counts for each main tab and sub-tab
    const mainTabsWithCounts = await Promise.all(
      Object.entries(MAIN_TABS).map(async ([mainTabId, mainTab]) => {
        const subTabsWithCounts = await Promise.all(
          Object.entries(mainTab.subTabs).map(async ([subTabId, subTab]) => {
            let countQuery = `
              SELECT COUNT(DISTINCT p.id) as total
              FROM posts p
              WHERE p.is_active = true AND p.university_id = $1
            `;
            
            const countParams = [UNIVERSITY_CONFIG.primaryUniversityId];
            
            // Apply main tab filtering
            if (mainTabId === 'events') {
              countQuery += ` AND p.post_type = 'event'`;
            } else {
              countQuery += ` AND p.post_type != 'event'`;
            }
            
            // Apply sub-tab specific tag filtering
            if (subTabId !== 'all' && subTab.tags.length > 0) {
              countQuery += ` AND EXISTS (
                SELECT 1 FROM post_tags pt2 
                JOIN tags t2 ON pt2.tag_id = t2.id 
                WHERE pt2.post_id = p.id AND t2.name = ANY($2)
              )`;
              countParams.push(subTab.tags);
            }
            
            const countResult = await queryValidator(countQuery, countParams);
            const postCount = parseInt(countResult.rows[0].total);
            
            return {
              id: subTabId,
              name: subTab.name,
              description: subTab.description,
              icon: subTab.icon,
              postCount
            };
          })
        );
        
        // Calculate total posts for main tab
        const totalMainTabPosts = subTabsWithCounts.reduce((sum, subTab) => sum + subTab.postCount, 0);
        
        return {
          id: mainTabId,
          name: mainTab.name,
          description: mainTab.description,
          icon: mainTab.icon,
          totalPosts: totalMainTabPosts,
          slideDirection: mainTabId === 'goods-services' ? 'left' : 'right',
          subTabs: subTabsWithCounts
        };
      })
    );
    
    res.json({
      success: true,
      data: mainTabsWithCounts,
      metadata: {
        totalMainTabs: mainTabsWithCounts.length,
        defaultMainTab: 'combined',
        defaultSubTab: 'all',
        description: 'Available main tabs and sub-tabs for slide-out panel selection'
      }
    });
    
  } catch (error) {
    console.error('Get tabs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tabs',
      error: error.message
    });
  }
});

// @route   GET /api/v1/posts
// @desc    Get posts with filtering, sorting, and pagination
// @access  Public (with optional auth for personalized results)
router.get('/', [
  queryValidator('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  queryValidator('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  queryValidator('universityId').optional().isInt().withMessage('University ID must be an integer'),
  queryValidator('postType').optional().isIn(['goods', 'services', 'events', 'housing', 'tutoring', 'all']).withMessage('Invalid post type'),
  queryValidator('postTypes').optional().custom((value, { req }) => {
    // Handle both 'postTypes' and 'postTypes[]' parameter formats for multiple categories
    const postTypes = req.query.postTypes || req.query['postTypes[]'];
    if (postTypes && !Array.isArray(postTypes) && typeof postTypes !== 'string') {
      throw new Error('PostTypes must be an array or string');
    }
    return true;
  }).withMessage('PostTypes must be an array'),
  queryValidator('tags').optional().custom((value, { req }) => {
    // Handle both 'tags' and 'tags[]' parameter formats
    const tags = req.query.tags || req.query['tags[]'];
    if (tags && !Array.isArray(tags) && typeof tags !== 'string') {
      throw new Error('Tags must be an array or string');
    }
    return true;
  }).withMessage('Tags must be an array'),
  queryValidator('sortBy').optional().isIn(['recent', 'expiring', 'recurring', 'organized']).withMessage('Invalid sort option'),
  queryValidator('expandCluster').optional().isBoolean().withMessage('Expand cluster must be boolean'),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      universityId,
      postType,
      sortBy = 'recent',
      expandCluster = false,
      userId
    } = req.query;

    // Handle tags parameter (support both 'tags' and 'tags[]' formats)
    let tags = req.query.tags || req.query['tags[]'];
    if (tags && typeof tags === 'string') {
      tags = [tags]; // Convert single string to array
    }

    // Handle postTypes parameter (support both 'postTypes' and 'postTypes[]' formats)
    let postTypes = req.query.postTypes || req.query['postTypes[]'];
    if (postTypes && typeof postTypes === 'string') {
      postTypes = [postTypes]; // Convert single string to array
    }

    const offset = (page - 1) * limit;
    const user = req.user;

    // Build base query
    let baseQuery = `
      SELECT 
        p.id,
        p.user_id,
        p.university_id,
        p.title,
        p.description,
        p.post_type,
        p.duration_type,
        p.location,
        p.repost_frequency,
        p.original_post_id,
        p.expires_at,
        p.event_start,
        p.event_end,
        p.is_fulfilled,
        p.is_active,
        p.view_count,
        p.created_at,
        p.updated_at,
        u.username,
        u.first_name,
        u.last_name,
        u.display_name,
        u.profile_picture,
        un.name as university_name,
        un.city as university_city,
        un.state as university_state,
        COUNT(pi.id) as image_count,
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_images pi ON p.id = pi.post_id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.is_active = true
    `;

    const queryParams = [];
    let paramCount = 0;

    // For now, filter to Cal Poly SLO only (multi-university ready)
    paramCount++;
    baseQuery += ` AND p.university_id = $${paramCount}`;
    queryParams.push(UNIVERSITY_CONFIG.primaryUniversityId);

    // Add post type filter - New system: Primary tag is the main category
    if (postTypes && postTypes.length > 0) {
      // Multiple post types selected
      paramCount++;
      const validPostTypes = postTypes.filter(pt => ['goods', 'services', 'housing', 'events'].includes(pt));
      if (validPostTypes.length > 0) {
        baseQuery += ` AND p.post_type = ANY($${paramCount})`;
        queryParams.push(validPostTypes);
      }
    } else if (postType && postType !== 'all') {
      // Single post type selected (legacy/fallback)
      paramCount++;
      switch (postType) {
        case 'goods':
          baseQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('goods');
          break;
        case 'services':
          baseQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('services');
          break;
        case 'housing':
          baseQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('housing');
          break;
        case 'events':
          baseQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push('events');
          break;
        default:
          baseQuery += ` AND p.post_type = $${paramCount}`;
          queryParams.push(postType);
      }
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

    // Add GROUP BY first
    baseQuery += ` GROUP BY p.id, p.user_id, p.university_id, p.title, p.description, p.post_type, p.duration_type, p.expires_at, p.event_start, p.event_end, p.is_fulfilled, p.is_active, p.view_count, p.created_at, p.updated_at, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state`;

    // Add sorting after GROUP BY
    switch (sortBy) {
      case 'expiring':
        baseQuery += ` ORDER BY p.expires_at ASC NULLS LAST, p.created_at DESC`;
        break;
      case 'recurring':
        baseQuery += ` ORDER BY p.duration_type = 'recurring' DESC, p.created_at DESC`;
        break;
      case 'organized':
        // Organized feed: recurring posts first, then events, then one-time posts
        baseQuery += ` ORDER BY 
          CASE 
            WHEN p.duration_type = 'recurring' THEN 0
            WHEN p.duration_type = 'event' THEN 1
            ELSE 2
          END,
          p.created_at DESC`;
        break;
      case 'recent':
      default:
        baseQuery += ` ORDER BY p.created_at DESC`;
        break;
    }

    // Add pagination
    baseQuery += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await dbQuery(baseQuery, queryParams);

    // Get total count for pagination (Cal Poly SLO only for now)
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      WHERE p.is_active = true AND p.university_id = $1
    `;
    
    const countParams = [UNIVERSITY_CONFIG.primaryUniversityId];
    paramCount = 1;

    if (postTypes && postTypes.length > 0) {
      // Multiple post types selected
      paramCount++;
      const validPostTypes = postTypes.filter(pt => ['goods', 'services', 'housing', 'events'].includes(pt));
      if (validPostTypes.length > 0) {
        countQuery += ` AND p.post_type = ANY($${paramCount})`;
        countParams.push(validPostTypes);
      }
    } else if (postType && postType !== 'all') {
      // Single post type selected (legacy/fallback)
      paramCount++;
      switch (postType) {
        case 'goods':
          countQuery += ` AND p.post_type = $${paramCount}`;
          countParams.push('goods');
          break;
        case 'services':
          countQuery += ` AND p.post_type = $${paramCount}`;
          countParams.push('services');
          break;
        case 'housing':
          countQuery += ` AND p.post_type = $${paramCount}`;
          countParams.push('housing');
          break;
        case 'events':
          countQuery += ` AND p.post_type = $${paramCount}`;
          countParams.push('events');
          break;
        default:
          countQuery += ` AND p.post_type = $${paramCount}`;
          countParams.push(postType);
      }
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

    const countResult = await dbQuery(countQuery, countParams);
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
      repostFrequency: post.repost_frequency,
      isRecurring: post.duration_type === 'recurring',
      originalPostId: post.original_post_id,
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
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch posts. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/posts/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', [
  param('id').isInt().withMessage('Post ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    await dbQuery(`
      UPDATE posts 
      SET view_count = view_count + 1 
      WHERE id = $1
    `, [id]);

    // Get post with details
    const result = await dbQuery(`
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
        ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
        ARRAY_AGG(DISTINCT pi.image_url ORDER BY pi.image_order) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN universities un ON p.university_id = un.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      LEFT JOIN post_images pi ON p.id = pi.post_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name, un.city, un.state
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Post not found'
        }
      });
    }

    const post = result.rows[0];

    // Check if user owns the post
    const isOwner = req.user && req.user.id === post.user_id;

    const formattedPost = {
      id: post.id,
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
        id: post.university_id,
        name: post.university_name,
        city: post.university_city,
        state: post.university_state
      },
      tags: post.tags || [],
      images: post.images || [],
      isOwner
    };

    res.json({
      success: true,
      data: {
        post: formattedPost
      }
    });

  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch post. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/posts
// @desc    Create a new post
// @access  Private
router.post('/', [
  auth,
  requireVerification,
  body('title').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters').trim(),
  body('description').isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),
  body('postType').isIn(['goods', 'services', 'housing', 'events']).withMessage('Post type must be goods, services, housing, or events'),
        body('durationType').isIn(['one-time', 'recurring', 'event']).withMessage('Duration type must be one-time, recurring, or event'),
      body('location').optional().isLength({ max: 255 }).withMessage('Location must be less than 255 characters').trim(),
      body('repostFrequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Repost frequency must be daily, weekly, or monthly'),
      body('expiresAt').optional().isISO8601().withMessage('Expiration date must be a valid ISO 8601 date'),
      body('eventStart').optional().isISO8601().withMessage('Event start date must be a valid ISO 8601 date'),
      body('eventEnd').optional().isISO8601().withMessage('Event end date must be a valid ISO 8601 date'),
  body('tags').optional().isArray({ min: 1, max: 10 }).withMessage('Tags must be an array with 1 to 10 items'),
  validate
], async (req, res) => {
  try {
    const {
      title,
      description,
      postType,
      durationType,
      location,
      repostFrequency,
      expiresAt,
      eventStart,
      eventEnd,
      tags
    } = req.body;

    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Calculate next repost date for recurring posts
      let nextRepostDate = null;
      if (durationType === 'recurring' && repostFrequency) {
        nextRepostDate = calculateNextRepostDate(repostFrequency);
      }

      // Create post
      const postResult = await client.query(`
        INSERT INTO posts (user_id, university_id, title, description, post_type, duration_type, location, repost_frequency, next_repost_date, expires_at, event_start, event_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, title, description, post_type, duration_type, location, repost_frequency, next_repost_date, expires_at, event_start, event_end, created_at
      `, [userId, universityId, title, description, postType, durationType, location, repostFrequency, nextRepostDate, expiresAt, eventStart, eventEnd]);

      const post = postResult.rows[0];

      // Add tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Get or create tag
          let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
          
          let tagId;
          if (tagResult.rows.length === 0) {
            // Create new tag
            const newTagResult = await client.query(`
              INSERT INTO tags (name, category) 
              VALUES ($1, 'custom') 
              RETURNING id
            `, [tagName]);
            tagId = newTagResult.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }

          // Link tag to post
          await client.query(`
            INSERT INTO post_tags (post_id, tag_id) 
            VALUES ($1, $2)
          `, [post.id, tagId]);
        }
      }

      await client.query('COMMIT');

      // Calculate and update initial scores
      await updatePostScores(post.id);

      // Clear cache
      const cacheKey = generateCacheKey('post', post.id);
      await redisDel(cacheKey);

      // Get full post with tags
      const fullPostResult = await dbQuery(`
        SELECT 
          p.*,
          u.username,
          u.first_name,
          u.last_name,
          u.display_name,
          u.profile_picture,
          un.name as university_name,
          ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN universities un ON p.university_id = un.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.id = $1
        GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name
      `, [post.id]);

      const fullPost = fullPostResult.rows[0];

      const formattedPost = {
        id: fullPost.id,
        title: fullPost.title,
        description: fullPost.description,
        postType: fullPost.post_type,
        durationType: fullPost.duration_type,
        expiresAt: fullPost.expires_at,
        eventStart: fullPost.event_start,
        eventEnd: fullPost.event_end,
        isFulfilled: fullPost.is_fulfilled,
        viewCount: fullPost.view_count,
        createdAt: fullPost.created_at,
        updatedAt: fullPost.updated_at,
        poster: {
          id: fullPost.user_id,
          username: fullPost.username,
          firstName: fullPost.first_name,
          lastName: fullPost.last_name,
          displayName: fullPost.display_name,
          profilePicture: fullPost.profile_picture
        },
        university: {
          id: fullPost.university_id,
          name: fullPost.university_name
        },
        tags: fullPost.tags || []
      };

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: {
          post: formattedPost
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create post. Please try again.'
      }
    });
  }
});

// @route   PUT /api/v1/posts/:id
// @desc    Update a post
// @access  Private (post owner only)
router.put('/:id', [
  auth,
  requireVerification,
  checkOwnership('post'),
  body('title').isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters').trim(),
  body('description').isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),
  body('postType').optional().isIn(['goods', 'services', 'housing', 'events', 'offer', 'request']).withMessage('Post type must be a valid category'),
  body('durationType').isIn(['one-time', 'recurring', 'event']).withMessage('Duration type must be one-time, recurring, or event'),
  body('location').optional().isLength({ max: 255 }).withMessage('Location must be less than 255 characters').trim(),
  body('expiresAt').optional().isISO8601().withMessage('Expiration date must be a valid ISO 8601 date'),
  body('eventStart').optional().isISO8601().withMessage('Event start date must be a valid ISO 8601 date'),
  body('eventEnd').optional().isISO8601().withMessage('Event end date must be a valid ISO 8601 date'),
  body('tags').optional().isArray({ min: 1, max: 10 }).withMessage('Tags must be an array with 1 to 10 items'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      postType,
      durationType,
      location,
      expiresAt,
      eventStart,
      eventEnd,
      tags
    } = req.body;

    console.log('PUT /posts/:id received data:', {
      id,
      title,
      description,
      postType,
      durationType,
      location,
      expiresAt,
      eventStart,
      eventEnd,
      tags
    });

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Determine if postType should update the primary category or be added as a tag
      const primaryCategories = ['goods', 'services', 'housing', 'events'];
      const secondaryTags = ['offer', 'request'];
      
      let updateQuery;
      let updateParams;
      
      if (postType && primaryCategories.includes(postType)) {
        // Update primary category
        updateQuery = `
          UPDATE posts 
          SET title = $1, description = $2, post_type = $3, duration_type = $4, 
              location = $5, expires_at = $6, event_start = $7, event_end = $8, updated_at = CURRENT_TIMESTAMP
          WHERE id = $9
          RETURNING id, title, description, post_type, duration_type, location, expires_at, event_start, event_end, updated_at
        `;
        updateParams = [title, description, postType, durationType, location, expiresAt, eventStart, eventEnd, id];
      } else {
        // Don't update primary category, only update other fields
        updateQuery = `
          UPDATE posts 
          SET title = $1, description = $2, duration_type = $3, 
              location = $4, expires_at = $5, event_start = $6, event_end = $7, updated_at = CURRENT_TIMESTAMP
          WHERE id = $8
          RETURNING id, title, description, post_type, duration_type, location, expires_at, event_start, event_end, updated_at
        `;
        updateParams = [title, description, durationType, location, expiresAt, eventStart, eventEnd, id];
        
        // Add postType to tags if it's a secondary tag
        if (postType && secondaryTags.includes(postType)) {
          if (!tags || !Array.isArray(tags)) {
            tags = [postType];
          } else if (!tags.includes(postType)) {
            tags.push(postType);
          }
        }
      }

      const updateResult = await client.query(updateQuery, updateParams);

      console.log('UPDATE result:', updateResult.rows[0]);

      if (updateResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Post not found'
          }
        });
      }

      const post = updateResult.rows[0];

      // Update tags if provided
      if (tags) {
        // Remove existing tags
        await client.query('DELETE FROM post_tags WHERE post_id = $1', [id]);

        // Add new tags
        for (const tagName of tags) {
          let tagResult = await client.query('SELECT id FROM tags WHERE name = $1', [tagName]);
          
          let tagId;
          if (tagResult.rows.length === 0) {
            const newTagResult = await client.query(`
              INSERT INTO tags (name, category) 
              VALUES ($1, 'custom') 
              RETURNING id
            `, [tagName]);
            tagId = newTagResult.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }

          await client.query(`
            INSERT INTO post_tags (post_id, tag_id) 
            VALUES ($1, $2)
          `, [id, tagId]);
        }
      }

      await client.query('COMMIT');

      // Clear cache
      const cacheKey = generateCacheKey('post', id);
      await redisDel(cacheKey);

      res.json({
        success: true,
        message: 'Post updated successfully',
        data: {
          post: {
            id: post.id,
            title: post.title,
            description: post.description,
            postType: post.post_type,
            durationType: post.duration_type,
            expiresAt: post.expires_at,
            eventStart: post.event_start,
            eventEnd: post.event_end,
            updatedAt: post.updated_at
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update post. Please try again.'
      }
    });
  }
});

// @route   DELETE /api/v1/posts/:id
// @desc    Delete a post (mark as fulfilled)
// @access  Private (post owner only)
router.delete('/:id', [
  auth,
  requireVerification,
  checkOwnership('post'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;

    // Mark post as fulfilled (soft delete)
    const result = await dbQuery(`
      UPDATE posts 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Post not found'
        }
      });
    }

    // Clear cache
    const cacheKey = generateCacheKey('post', id);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Post marked as fulfilled successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark post as fulfilled. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/posts/:id/fulfill
// @desc    Mark a post as fulfilled
// @access  Private (post owner only)
router.post('/:id/fulfill', [
  auth,
  requireVerification,
  checkOwnership('post'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;

    const result = await queryValidator(`
      UPDATE posts 
      SET is_fulfilled = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, is_fulfilled
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Post not found'
        }
      });
    }

    // Clear cache
    const cacheKey = generateCacheKey('post', id);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Post marked as fulfilled successfully',
      data: {
        isFulfilled: result.rows[0].is_fulfilled
      }
    });

  } catch (error) {
    console.error('Fulfill post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to mark post as fulfilled. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/posts/:id/repost-history
// @desc    Get repost history for a recurring post
// @access  Public
router.get('/:id/repost-history', [
  param('id').isInt().withMessage('Post ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;

    const history = await getRepostHistory(parseInt(id));

    res.json({
      success: true,
      data: {
        history: history.map(post => ({
          id: post.id,
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          isActive: post.is_active
        }))
      }
    });

  } catch (error) {
    console.error('Get repost history error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch repost history. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/posts/:id/stop-recurring
// @desc    Stop a recurring post from being reposted
// @access  Private (post owner only)
router.post('/:id/stop-recurring', [
  auth,
  requireVerification,
  checkOwnership('post'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await stopRecurringPost(parseInt(id), userId);

    // Clear cache
    const cacheKey = generateCacheKey('post', id);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Recurring post stopped successfully. It will no longer be reposted.'
    });

  } catch (error) {
    console.error('Stop recurring post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to stop recurring post. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/posts/:id/interact
// @desc    Record user interaction with a post (message, share, bookmark, repost)
// @access  Private
router.post('/:id/interact', [
  auth,
  requireVerification,
  param('id').isInt().withMessage('Post ID must be an integer'),
  body('interactionType').isIn(['message', 'share', 'bookmark', 'repost']).withMessage('Invalid interaction type'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { interactionType } = req.body;
    const userId = req.user.id;

    const { recordInteraction } = require('../services/engagementService');
    
    const result = await recordInteraction(parseInt(id), userId, interactionType);

    if (result.success) {
      // Clear cache
      const cacheKey = generateCacheKey('post', id);
      await redisDel(cacheKey);

      res.json({
        success: true,
        message: `${interactionType} interaction recorded successfully`,
        data: { interactionType, postId: id }
      });
    } else {
      res.status(400).json({
        success: false,
        error: { message: result.message }
      });
    }

  } catch (error) {
    console.error('Post interaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to record interaction. Please try again.'
      }
    });
  }
});

// @route   DELETE /api/v1/posts/:id/interact
// @desc    Remove user interaction with a post
// @access  Private
router.delete('/:id/interact', [
  auth,
  requireVerification,
  param('id').isInt().withMessage('Post ID must be an integer'),
  body('interactionType').isIn(['message', 'share', 'bookmark', 'repost']).withMessage('Invalid interaction type'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const { interactionType } = req.body;
    const userId = req.user.id;

    const { removeInteraction } = require('../services/engagementService');
    
    const result = await removeInteraction(parseInt(id), userId, interactionType);

    if (result.success) {
      // Clear cache
      const cacheKey = generateCacheKey('post', id);
      await redisDel(cacheKey);

      res.json({
        success: true,
        message: `${interactionType} interaction removed successfully`,
        data: { interactionType, postId: id }
      });
    } else {
      res.status(400).json({
        success: false,
        error: { message: result.message }
      });
    }

  } catch (error) {
    console.error('Remove post interaction error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to remove interaction. Please try again.'
      }
    });
  }
});



// @route   GET /api/v1/posts/:id/engagement
// @desc    Get engagement statistics for a post
// @access  Public
router.get('/:id/engagement', [
  param('id').isInt().withMessage('Post ID must be an integer'),
  validate
], async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional auth

    const { getPostEngagement, getUserInteractions } = require('../services/engagementService');
    
    const engagement = await getPostEngagement(parseInt(id));
    const userInteractions = userId ? await getUserInteractions(parseInt(id), userId) : [];

    res.json({
      success: true,
      data: {
        engagement: {
          messageCount: engagement.message_count,
          shareCount: engagement.share_count,
          bookmarkCount: engagement.bookmark_count,
          repostCount: engagement.repost_count,
          score: engagement.engagement_score
        },
        userInteractions: userInteractions
      }
    });

  } catch (error) {
    console.error('Get post engagement error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch engagement data. Please try again.'
      }
    });
  }
});

/**
 * Create a multi-university post
 * POST /api/posts/multi-university
 */
router.post('/multi-university', auth, async (req, res) => {
  try {
    const { title, description, postType, durationType, universityIds, tags, expiresAt, eventStart, eventEnd } = req.body;
    const userId = req.user.id;
    
    if (!universityIds || universityIds.length === 0) {
      return res.status(400).json({ error: 'At least one university must be specified' });
    }
    
    if (universityIds.length === 1) {
      return res.status(400).json({ error: 'Use single-university post endpoint for single university targeting' });
    }
    
    // Use the first university as primary (for backward compatibility)
    const primaryUniversityId = universityIds[0];
    
    // Create the post
    const postQuery = `
      INSERT INTO posts (user_id, university_id, title, description, post_type, duration_type, expires_at, event_start, event_end, target_scope)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'multi')
      RETURNING id
    `;
    
    const postResult = await queryValidator(postQuery, [
      userId, primaryUniversityId, title, description, postType, durationType, 
      expiresAt, eventStart, eventEnd
    ]);
    
    const postId = postResult.rows[0].id;
    
    // Set multi-university targeting
    await multiUniversityScoringService.setPostUniversities(postId, universityIds, primaryUniversityId);
    
    // Add tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Get or create tag
        let tagResult = await queryValidator('SELECT id FROM tags WHERE name = $1', [tagName]);
        let tagId;
        
        if (tagResult.rows.length === 0) {
          const newTagResult = await queryValidator('INSERT INTO tags (name, category) VALUES ($1, $2) RETURNING id', [tagName, 'other']);
          tagId = newTagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        // Link tag to post
        await queryValidator('INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [postId, tagId]);
      }
    }
    
    // Get the complete post data
    const completePostQuery = `
      SELECT 
        p.*,
        u.name as university_name,
        u.city as university_city,
        u.state as university_state,
        ARRAY_AGG(DISTINCT t.name) as tags
      FROM posts p
      JOIN universities u ON p.university_id = u.id
      LEFT JOIN post_tags pt ON p.id = pt.post_id
      LEFT JOIN tags t ON pt.tag_id = t.id
      WHERE p.id = $1
      GROUP BY p.id, u.name, u.city, u.state
    `;
    
    const completePostResult = await queryValidator(completePostQuery, [postId]);
    const post = completePostResult.rows[0];
    
    // Get all targeted universities
    const targetedUniversities = await multiUniversityScoringService.getPostUniversities(postId);
    
    res.status(201).json({
      message: 'Multi-university post created successfully',
      post: {
        ...post,
        targetedUniversities,
        scope: 'multi'
      }
    });
    
  } catch (error) {
    console.error('Error creating multi-university post:', error);
    res.status(500).json({ error: 'Failed to create multi-university post' });
  }
});

/**
 * Update multi-university post targeting
 * PUT /api/posts/:id/universities
 */
router.put('/:id/universities', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { universityIds } = req.body;
    
    if (!universityIds || universityIds.length === 0) {
      return res.status(400).json({ error: 'At least one university must be specified' });
    }
    
    // Verify user owns the post
    const ownershipQuery = 'SELECT user_id FROM posts WHERE id = $1';
    const ownershipResult = await queryValidator(ownershipQuery, [postId]);
    
    if (ownershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (ownershipResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to modify this post' });
    }
    
    // Update university targeting
    const primaryUniversityId = universityIds[0];
    const result = await multiUniversityScoringService.setPostUniversities(postId, universityIds, primaryUniversityId);
    
    // Get updated post information
    const targetedUniversities = await multiUniversityScoringService.getPostUniversities(postId);
    
    res.json({
      message: 'Post university targeting updated successfully',
      result,
      targetedUniversities
    });
    
  } catch (error) {
    console.error('Error updating post universities:', error);
    res.status(500).json({ error: 'Failed to update post universities' });
  }
});

/**
 * Get post university targeting information
 * GET /api/posts/:id/universities
 */
router.get('/:id/universities', async (req, res) => {
  try {
    const postId = req.params.id;
    
    const targetedUniversities = await multiUniversityScoringService.getPostUniversities(postId);
    const postScope = await multiUniversityScoringService.determinePostScope(postId);
    
    res.json({
      postId,
      scope: postScope,
      targetedUniversities
    });
    
  } catch (error) {
    console.error('Error getting post universities:', error);
    res.status(500).json({ error: 'Failed to get post universities' });
  }
});

/**
 * Get posts by university scope (single, multi, or cluster)
 * GET /api/posts/scope/:scope
 */
router.get('/scope/:scope', async (req, res) => {
  try {
    const { scope } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!['single', 'multi', 'cluster'].includes(scope)) {
      return res.status(400).json({ error: 'Invalid scope. Must be single, multi, or cluster' });
    }
    
    let postsQuery;
    let countQuery;
    
    if (scope === 'single') {
      // Single university posts
      postsQuery = `
        SELECT 
          p.*,
          u.name as university_name,
          u.city as university_city,
          u.state as university_state,
          usr.username,
          usr.display_name,
          ARRAY_AGG(DISTINCT t.name) as tags
        FROM posts p
        JOIN universities u ON p.university_id = u.id
        JOIN users usr ON p.user_id = usr.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.target_scope = 'single' AND p.is_active = true
        GROUP BY p.id, u.name, u.city, u.state, usr.username, usr.display_name
        ORDER BY p.final_score DESC, p.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      countQuery = `
        SELECT COUNT(*) as total
        FROM posts 
        WHERE target_scope = 'single' AND is_active = true
      `;
    } else {
      // Multi-university or cluster posts
      postsQuery = `
        SELECT 
          p.*,
          u.name as university_name,
          u.city as university_city,
          u.state as university_state,
          usr.username,
          usr.display_name,
          ARRAY_AGG(DISTINCT t.name) as tags,
          COUNT(pu.university_id) as total_targeted_universities
        FROM posts p
        JOIN universities u ON p.university_id = u.id
        JOIN users usr ON p.user_id = usr.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        LEFT JOIN post_universities pu ON p.id = pu.post_id
        WHERE p.target_scope = $1 AND p.is_active = true
        GROUP BY p.id, u.name, u.city, u.state, usr.username, usr.display_name
        ORDER BY p.final_score DESC, p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      countQuery = `
        SELECT COUNT(*) as total
        FROM posts 
        WHERE target_scope = $1 AND is_active = true
      `;
    }
    
    // Execute queries
    const postsResult = scope === 'single' 
      ? await queryValidator(postsQuery, [limit, offset])
      : await queryValidator(postsQuery, [scope, limit, offset]);
    
    const countResult = scope === 'single'
      ? await queryValidator(countQuery)
      : await queryValidator(countQuery, [scope]);
    
    const posts = postsResult.rows;
    const total = parseInt(countResult.rows[0].total);
    
    // Get detailed university targeting for multi-university posts
    if (scope !== 'single') {
      for (const post of posts) {
        post.targetedUniversities = await multiUniversityScoringService.getPostUniversities(post.id);
      }
    }
    
    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      scope
    });
    
  } catch (error) {
    console.error('Error getting posts by scope:', error);
    res.status(500).json({ error: 'Failed to get posts by scope' });
  }
});

// GET /api/v1/posts/create-tags - Get available tags for Create Post interface
router.get('/create-tags', async (req, res) => {
  try {
    const { postType } = req.query; // 'goods-services' or 'events'
    
    if (!postType || !['goods-services', 'events'].includes(postType)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid post type. Must be "goods-services" or "events"'
        }
      });
    }
    
    let availableTags;
    
    if (postType === 'goods-services') {
      availableTags = {
        primary: [
          { 
            id: 'offer', 
            name: 'Offer', 
            description: 'I have something to provide', 
            icon: '🛍️',
            required: true,
            exclusive: true,
            category: 'primary',
            alwaysVisible: true
          },
          { 
            id: 'request', 
            name: 'Request', 
            description: 'I need something', 
            icon: '🔍',
            required: true,
            exclusive: true,
            category: 'primary',
            alwaysVisible: true
          }
        ],
        tagsTab: {
          id: 'tags',
          name: 'Tags',
          description: 'Select additional categories',
          icon: '🏷️',
          type: 'popup',
          categories: [
            { 
              id: 'leasing', 
              name: 'Leasing', 
              description: 'Housing and apartments', 
              icon: '🏠',
              tags: ['housing', 'apartment', 'lease', 'roommate', 'sublet'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'tutoring', 
              name: 'Tutoring', 
              description: 'Academic help and services', 
              icon: '📚',
              tags: ['tutoring', 'homework', 'study', 'academic', 'math', 'science', 'english'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'books', 
              name: 'Books', 
              description: 'Textbooks and materials', 
              icon: '📖',
              tags: ['textbook', 'book', 'reading', 'course', 'education'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'rides', 
              name: 'Rides', 
              description: 'Transportation and carpooling', 
              icon: '🚗',
              tags: ['ride', 'carpool', 'transport', 'drive', 'travel'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'food', 
              name: 'Food', 
              description: 'Food sharing and dining', 
              icon: '🍕',
              tags: ['food', 'dining', 'meal', 'cooking', 'restaurant'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'electronics', 
              name: 'Electronics', 
              description: 'Tech devices and accessories', 
              icon: '💻',
              tags: ['laptop', 'phone', 'tablet', 'accessories', 'tech'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'clothing', 
              name: 'Clothing', 
              description: 'Apparel and fashion items', 
              icon: '👕',
              tags: ['clothes', 'shoes', 'accessories', 'fashion', 'style'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            },
            { 
              id: 'other', 
              name: 'Other', 
              description: 'Miscellaneous services', 
              icon: '🔧',
              tags: ['other', 'misc', 'service', 'help'],
              required: false,
              maxSelections: 3,
              category: 'secondary'
            }
          ]
        }
      };
    } else if (postType === 'events') {
      availableTags = {
        primary: [], // No primary tags for events
        tagsTab: {
          id: 'tags',
          name: 'Tags',
          description: 'Select event category',
          icon: '🏷️',
          type: 'popup',
          categories: [
            { 
              id: 'sport', 
              name: 'Sport', 
              description: 'Athletic and fitness events', 
              icon: '⚽',
              tags: ['sport', 'athletic', 'game', 'tournament', 'fitness'],
              required: true,
              maxSelections: 1,
              category: 'event'
            },
            { 
              id: 'rush', 
              name: 'Rush', 
              description: 'Greek life and recruitment', 
              icon: '🏛️',
              tags: ['rush', 'greek', 'fraternity', 'sorority', 'recruitment'],
              required: true,
              maxSelections: 1,
              category: 'event'
            },
            { 
              id: 'philanthropy', 
              name: 'Philanthropy', 
              description: 'Charity and community service', 
              icon: '🤝',
              tags: ['philanthropy', 'charity', 'community', 'service', 'volunteer'],
              required: true,
              maxSelections: 1,
              category: 'event'
            },
            { 
              id: 'academic', 
              name: 'Academic', 
              description: 'Educational and learning events', 
              icon: '🎓',
              tags: ['academic', 'lecture', 'workshop', 'seminar', 'conference'],
              required: true,
              maxSelections: 1,
              category: 'event'
            },
            { 
              id: 'social', 
              name: 'Social', 
              description: 'Social and entertainment events', 
              icon: '🎊',
              tags: ['social', 'party', 'club', 'entertainment', 'music'],
              required: true,
              maxSelections: 1,
              category: 'event'
            },
            { 
              id: 'cultural', 
              name: 'Cultural', 
              description: 'Diversity and heritage events', 
              icon: '🌍',
              tags: ['cultural', 'diversity', 'heritage', 'international', 'celebration'],
              required: true,
              maxSelections: 1,
              category: 'event'
            },
            { 
              id: 'career', 
              name: 'Career', 
              description: 'Professional development and networking', 
              icon: '💼',
              tags: ['career', 'networking', 'job', 'internship', 'professional'],
              required: true,
              maxSelections: 1,
              category: 'event'
            }
          ]
        }
      };
    }
    
    res.json({
      success: true,
      data: {
        postType,
        availableTags,
        validation: {
          content: {
            minLength: 10,
            maxLength: 5000,
            required: true
          },
          images: {
            maxCount: 10,
            required: false
          },
          tags: {
            primary: {
              required: postType === 'goods-services',
              maxSelections: postType === 'goods-services' ? 1 : 0
            },
            secondary: {
              required: false,
              maxSelections: 5
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Get create tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve available tags',
      error: error.message
    });
  }
});

// @route   POST /api/v1/posts/create
// @desc    Create a new post with enhanced tag system
// @access  Private
router.post('/create', [
  auth,
  requireVerification,
  body('content').isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters').trim(),
  body('postType').isIn(['goods-services', 'events']).withMessage('Post type must be goods-services or events'),
  body('primaryTags').isArray({ min: 1, max: 1 }).withMessage('Must select exactly one primary tag'),
  body('secondaryTags').optional().isArray({ max: 5 }).withMessage('Maximum 5 secondary tags allowed'),
  body('images').optional().isArray({ max: 10 }).withMessage('Maximum 10 images allowed'),
  body('eventDetails').optional().isObject().withMessage('Event details must be an object'),
  body('postDuration').optional().isObject().withMessage('Post duration must be an object'),
  validate
], async (req, res) => {
  try {
    const {
      content,
      postType,
      primaryTags,
      secondaryTags = [],
      images = [],
      eventDetails = {},
      postDuration = {}
    } = req.body;

    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    // Validate tag selections based on post type
    let validationErrors = [];
    
    if (postType === 'goods-services') {
      // For goods/services, primary tags must be 'offer' or 'request'
      const validPrimaryTags = ['offer', 'request'];
      if (!validPrimaryTags.includes(primaryTags[0])) {
        validationErrors.push('Primary tag must be either "offer" or "request" for goods/services posts');
      }
      
      // Validate secondary tags are from the correct category
      const validSecondaryTags = ['leasing', 'tutoring', 'books', 'rides', 'food', 'electronics', 'clothing', 'other'];
      const invalidSecondaryTags = secondaryTags.filter(tag => !validSecondaryTags.includes(tag));
      if (invalidSecondaryTags.length > 0) {
        validationErrors.push(`Invalid secondary tags: ${invalidSecondaryTags.join(', ')}`);
      }
    } else if (postType === 'events') {
      // For events, primary tags should be event categories
      const validPrimaryTags = ['sport', 'rush', 'philanthropy', 'academic', 'social', 'cultural', 'career'];
      if (!validPrimaryTags.includes(primaryTags[0])) {
        validationErrors.push('Primary tag must be a valid event category');
      }
      
      // Events don't use the same secondary tag system
      if (secondaryTags.length > 0) {
        validationErrors.push('Secondary tags are not used for event posts');
      }
    }

    // Validate post duration
    if (postDuration && !postDuration.runIndefinitely) {
      if (!postDuration.expiryDate) {
        validationErrors.push('Expiry date is required when post is not set to run indefinitely');
      }
      
      const expiryDate = new Date(postDuration.expiryDate);
      const now = new Date();
      if (expiryDate <= now) {
        validationErrors.push('Expiry date must be in the future');
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: validationErrors
        }
      });
    }

    // Determine the actual post type for database storage - New system
    let dbPostType;
    let durationType = 'one-time';
    
    if (postType === 'goods-services') {
      // Map old frontend system to new system
      dbPostType = 'goods'; // Default to goods for backwards compatibility
      durationType = 'one-time';
    } else if (postType === 'events') {
      dbPostType = 'events';
      durationType = 'event';
    } else {
      // Direct mapping for new system
      dbPostType = postType; // goods, services, housing, events
      durationType = postType === 'events' ? 'event' : 'one-time';
    }

    // Calculate expiry date
    let expiresAt = null;
    if (postDuration && !postDuration.runIndefinitely && postDuration.expiryDate) {
      expiresAt = new Date(postDuration.expiryDate);
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.queryValidator('BEGIN');

      // Create post
      const postResult = await client.queryValidator(`
        INSERT INTO posts (
          user_id, 
          university_id, 
          title, 
          description, 
          post_type, 
          duration_type,
          expires_at,
          event_start,
          event_end
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title, description, post_type, duration_type, expires_at, created_at
      `, [
        userId, 
        universityId, 
        `${postType} - ${primaryTags[0]}`, // Simple title
        content, 
        dbPostType, 
        durationType,
        expiresAt,
        eventDetails.startDate || null,
        eventDetails.endDate || null
      ]);

      const post = postResult.rows[0];

      // Add primary tags
      for (const tagName of primaryTags) {
        await addTagToPost(client, post.id, tagName, 'primary');
      }

      // Add secondary tags
      for (const tagName of secondaryTags) {
        await addTagToPost(client, post.id, tagName, 'secondary');
      }

      // Add images if provided
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          await client.queryValidator(`
            INSERT INTO post_images (post_id, image_url, image_order)
            VALUES ($1, $2, $3)
          `, [post.id, imageUrl, i]);
        }
      }

      await client.queryValidator('COMMIT');

      // Calculate and update initial scores
      await updatePostScores(post.id);

      // Clear cache
      const cacheKey = generateCacheKey('post', post.id);
      await redisDel(cacheKey);

      // Get full post with tags and images
      const fullPostResult = await queryValidator(`
        SELECT 
          p.*,
          u.username,
          u.first_name,
          u.last_name,
          u.display_name,
          u.profile_picture,
          un.name as university_name,
          ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
          ARRAY_AGG(DISTINCT pi.image_url ORDER BY pi.image_order) FILTER (WHERE pi.image_url IS NOT NULL) as images
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN universities un ON p.university_id = un.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        LEFT JOIN post_images pi ON p.id = pi.post_id
        WHERE p.id = $1
        GROUP BY p.id, u.username, u.first_name, u.last_name, u.display_name, u.profile_picture, un.name
      `, [post.id]);

      const fullPost = fullPostResult.rows[0];

      const formattedPost = {
        id: fullPost.id,
        title: fullPost.title,
        description: fullPost.description,
        postType: fullPost.post_type,
        durationType: fullPost.duration_type,
        expiresAt: fullPost.expires_at,
        eventStart: fullPost.event_start,
        eventEnd: fullPost.event_end,
        isFulfilled: fullPost.is_fulfilled,
        viewCount: fullPost.view_count,
        createdAt: fullPost.created_at,
        updatedAt: fullPost.updated_at,
        poster: {
          id: fullPost.user_id,
          username: fullPost.username,
          firstName: fullPost.first_name,
          lastName: fullPost.last_name,
          displayName: fullPost.display_name,
          profilePicture: fullPost.profile_picture
        },
        university: {
          id: fullPost.university_id,
          name: fullPost.university_name
        },
        tags: fullPost.tags || [],
        images: fullPost.images || [],
        metadata: {
          postType: postType,
          primaryTags: primaryTags,
          secondaryTags: secondaryTags,
          postDuration: postDuration
        }
      };

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: {
          post: formattedPost
        }
      });

    } catch (error) {
      await client.queryValidator('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create post. Please try again.',
        details: error.message
      }
    });
  }
});

// Helper function to add tags to posts
async function addTagToPost(client, postId, tagName, category) {
  // Get or create tag
  let tagResult = await client.queryValidator('SELECT id FROM tags WHERE name = $1', [tagName]);
  
  let tagId;
  if (tagResult.rows.length === 0) {
    // Create new tag
    const newTagResult = await client.queryValidator(`
      INSERT INTO tags (name, category) 
      VALUES ($1, $2) 
      RETURNING id
    `, [tagName, category]);
    tagId = newTagResult.rows[0].id;
  } else {
    tagId = tagResult.rows[0].id;
  }

  // Link tag to post
  await client.queryValidator(`
    INSERT INTO post_tags (post_id, tag_id) 
    VALUES ($1, $2)
  `, [postId, tagId]);
}

// @route   GET /api/v1/posts/create-template
// @desc    Get post creation template and validation rules
// @access  Private
router.get('/create-template', auth, async (req, res) => {
  try {
    const template = {
      postTypes: [
        {
          id: 'goods-services',
          name: 'Goods/Services',
          description: 'Buy, sell, trade, or request goods and services',
          icon: '🛍️',
          primaryTags: [
            {
              id: 'offer',
              name: 'Offer',
              description: 'I have something to provide',
              icon: '🛍️',
              required: true,
              exclusive: true,
              alwaysVisible: true
            },
            {
              id: 'request',
              name: 'Request',
              description: 'I need something',
              icon: '🔍',
              required: true,
              exclusive: true,
              alwaysVisible: true
            }
          ],
          tagsTab: {
            id: 'tags',
            name: 'Tags',
            description: 'Select additional categories',
            icon: '🏷️',
            type: 'popup',
            categories: [
              {
                id: 'leasing',
                name: 'Leasing',
                description: 'Housing and apartments',
                icon: '🏠',
                maxSelections: 3
              },
              {
                id: 'tutoring',
                name: 'Tutoring',
                description: 'Academic help and services',
                icon: '📚',
                maxSelections: 3
              },
              {
                id: 'books',
                name: 'Books',
                description: 'Textbooks and materials',
                icon: '📖',
                maxSelections: 3
              },
              {
                id: 'rides',
                name: 'Rides',
                description: 'Transportation and carpooling',
                icon: '🚗',
                maxSelections: 3
              },
              {
                id: 'food',
                name: 'Food',
                description: 'Food sharing and dining',
                icon: '🍕',
                maxSelections: 3
              },
              {
                id: 'electronics',
                name: 'Electronics',
                description: 'Tech devices and accessories',
                icon: '💻',
                maxSelections: 3
              },
              {
                id: 'clothing',
                name: 'Clothing',
                description: 'Apparel and fashion items',
                icon: '👕',
                maxSelections: 3
              },
              {
                id: 'other',
                name: 'Other',
                description: 'Miscellaneous services',
                icon: '🔧',
                maxSelections: 3
              }
            ]
          }
        },
        {
          id: 'events',
          name: 'Events',
          description: 'Create or promote events and activities',
          icon: '📅',
          primaryTags: [], // No primary tags for events
          tagsTab: {
            id: 'tags',
            name: 'Tags',
            description: 'Select event category',
            icon: '🏷️',
            type: 'popup',
            categories: [
              {
                id: 'sport',
                name: 'Sport',
                description: 'Athletic and fitness events',
                icon: '⚽',
                maxSelections: 1
              },
              {
                id: 'rush',
                name: 'Rush',
                description: 'Greek life and recruitment',
                icon: '🏛️',
                maxSelections: 1
              },
              {
                id: 'philanthropy',
                name: 'Philanthropy',
                description: 'Charity and community service',
                icon: '🤝',
                maxSelections: 1
              },
              {
                id: 'academic',
                name: 'Academic',
                description: 'Educational and learning events',
                icon: '🎓',
                maxSelections: 1
              },
              {
                id: 'social',
                name: 'Social',
                description: 'Social and entertainment events',
                icon: '🎊',
                maxSelections: 1
              },
              {
                id: 'cultural',
                name: 'Cultural',
                description: 'Diversity and heritage events',
                icon: '🌍',
                maxSelections: 1
              },
              {
                id: 'career',
                name: 'Career',
                description: 'Professional development and networking',
                icon: '💼',
                maxSelections: 1
              }
            ]
          }
        }
      ],
      validation: {
        content: {
          minLength: 10,
          maxLength: 5000,
          required: true,
          placeholder: 'What would you like to share?'
        },
        images: {
          maxCount: 10,
          required: false,
          supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          maxSizeMB: 5
        },
        postDuration: {
          required: false,
          options: {
            runIndefinitely: {
              id: 'runIndefinitely',
              name: 'Run Indefinitely',
              description: 'Post will remain active until manually deleted',
              icon: '♾️',
              default: false
            },
            customDuration: {
              id: 'customDuration',
              name: 'Set Expiry Date',
              description: 'Post will be automatically deleted on specified date',
              icon: '📅',
              quickPresets: [
                { id: '1day', name: '1 Day', days: 1, description: 'Expires tomorrow' },
                { id: '7days', name: '7 Days', days: 7, description: 'Expires in a week' },
                { id: '14days', name: '14 Days', days: 14, description: 'Expires in two weeks' },
                { id: '30days', name: '30 Days', days: 30, description: 'Expires in a month' },
                { id: '60days', name: '60 Days', days: 60, description: 'Expires in two months' },
                { id: '90days', name: '90 Days', days: 90, description: 'Expires in three months' }
              ],
              minDays: 1,
              maxDays: 365,
              default: 30
            }
          }
        },
        tags: {
          primary: {
            required: true,
            maxSelections: 1,
            message: 'Please select a primary category'
          },
          secondary: {
            required: false,
            maxSelections: 5,
            message: 'Select up to 5 additional categories'
          }
        }
      },
      ui: {
        layout: 'single-column',
        textAreaHeight: '120px',
        imageUpload: {
          position: 'inline',
          maxPreviewSize: '100px'
        },
        tagSelection: {
          style: 'chips',
          showIcons: true,
          showDescriptions: true,
          popupMode: true
        }
      }
    };

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Get create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve create template',
      error: error.message
    });
  }
});

// @route   POST /api/v1/posts/validate
// @desc    Validate post creation data before submission
// @access  Private
router.post('/validate', [
  auth,
  body('content').isLength({ min: 10, max: 5000 }).withMessage('Content must be between 10 and 5000 characters').trim(),
  body('postType').isIn(['goods-services', 'events']).withMessage('Post type must be goods-services or events'),
  body('primaryTags').isArray({ min: 1, max: 1 }).withMessage('Must select exactly one primary tag'),
  body('secondaryTags').optional().isArray({ max: 5 }).withMessage('Maximum 5 secondary tags allowed'),
  body('images').optional().isArray({ max: 10 }).withMessage('Maximum 10 images allowed'),
  validate
], async (req, res) => {
  try {
    const {
      content,
      postType,
      primaryTags,
      secondaryTags = [],
      images = []
    } = req.body;

    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Content validation
    if (!content || content.trim().length < 10) {
      validation.isValid = false;
      validation.errors.push('Content must be at least 10 characters long');
    } else if (content.length > 5000) {
      validation.isValid = false;
      validation.errors.push('Content cannot exceed 5000 characters');
    }

    // Post type validation
    if (!postType || !['goods-services', 'events'].includes(postType)) {
      validation.isValid = false;
      validation.errors.push('Invalid post type selected');
    }

    // Primary tags validation
    if (!primaryTags || primaryTags.length !== 1) {
      validation.isValid = false;
      validation.errors.push('Must select exactly one primary category');
    } else {
      const primaryTag = primaryTags[0];
      
      if (postType === 'goods-services') {
        if (!['offer', 'request'].includes(primaryTag)) {
          validation.isValid = false;
          validation.errors.push('Primary tag must be either "offer" or "request" for goods/services posts');
        }
      } else if (postType === 'events') {
        const validEventTags = ['sport', 'rush', 'philanthropy', 'academic', 'social', 'cultural', 'career'];
        if (!validEventTags.includes(primaryTag)) {
          validation.isValid = false;
          validation.errors.push('Invalid event category selected');
        }
      }
    }

    // Secondary tags validation
    if (secondaryTags && secondaryTags.length > 0) {
      if (postType === 'goods-services') {
        const validSecondaryTags = ['leasing', 'tutoring', 'books', 'rides', 'food', 'electronics', 'clothing', 'other'];
        const invalidTags = secondaryTags.filter(tag => !validSecondaryTags.includes(tag));
        if (invalidTags.length > 0) {
          validation.isValid = false;
          validation.errors.push(`Invalid secondary tags: ${invalidTags.join(', ')}`);
        }
        
        if (secondaryTags.length > 5) {
          validation.isValid = false;
          validation.errors.push('Maximum 5 secondary tags allowed');
        }
      } else if (postType === 'events') {
        validation.warnings.push('Secondary tags are not used for event posts');
        secondaryTags.length = 0; // Clear secondary tags for events
      }
    }

    // Image validation
    if (images && images.length > 10) {
      validation.isValid = false;
      validation.errors.push('Maximum 10 images allowed');
    }

    // Content quality suggestions
    if (content && content.length < 50) {
      validation.suggestions.push('Consider adding more details to make your post more engaging');
    }

    if (images && images.length === 0) {
      validation.suggestions.push('Adding images can make your post more attractive and informative');
    }

    if (postType === 'goods-services' && secondaryTags.length === 0) {
      validation.suggestions.push('Adding specific categories helps others find your post');
    }

    // Tag combination suggestions
    if (postType === 'goods-services' && primaryTags[0] === 'offer') {
      if (secondaryTags.includes('books') && content.toLowerCase().includes('textbook')) {
        validation.suggestions.push('Great! You\'ve tagged this as books and mentioned textbooks');
      }
    }

    if (postType === 'events' && primaryTags[0] === 'academic') {
      if (content.toLowerCase().includes('lecture') || content.toLowerCase().includes('workshop')) {
        validation.suggestions.push('Perfect! Academic event with relevant content');
      }
    }

    res.json({
      success: true,
      data: {
        validation,
        postData: {
          content,
          postType,
          primaryTags,
          secondaryTags: postType === 'events' ? [] : secondaryTags,
          images
        }
      }
    });

  } catch (error) {
    console.error('Post validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to validate post data',
        details: error.message
      }
    });
  }
});

// @route   GET /api/v1/posts/create-stats
// @desc    Get post creation statistics and analytics
// @access  Private
router.get('/create-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    // Get user's post creation statistics
    const userStatsResult = await queryValidator(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN post_type = 'offer' THEN 1 END) as offer_posts,
        COUNT(CASE WHEN post_type = 'request' THEN 1 END) as request_posts,
        COUNT(CASE WHEN post_type = 'event' THEN 1 END) as event_posts,
        AVG(view_count) as avg_views,
        MAX(view_count) as max_views,
        AVG(engagement_score) as avg_engagement,
        MAX(engagement_score) as max_engagement
      FROM posts 
      WHERE user_id = $1 AND university_id = $2 AND is_active = true
    `, [userId, universityId]);

    // Get most successful post types at this university
    const universityStatsResult = await queryValidator(`
      SELECT 
        post_type,
        COUNT(*) as post_count,
        AVG(view_count) as avg_views,
        AVG(engagement_score) as avg_engagement,
        AVG(bookmark_count) as avg_bookmarks
      FROM posts 
      WHERE university_id = $1 AND is_active = true AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY post_type
      ORDER BY avg_engagement DESC
    `, [universityId]);

    // Get most popular tags
    const popularTagsResult = await queryValidator(`
      SELECT 
        t.name as tag_name,
        t.category as tag_category,
        COUNT(pt.post_id) as usage_count,
        AVG(p.view_count) as avg_views
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      JOIN posts p ON pt.post_id = p.id
      WHERE p.university_id = $1 AND p.is_active = true AND p.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY t.id, t.name, t.category
      ORDER BY usage_count DESC
      LIMIT 10
    `, [universityId]);

    // Get best posting times (based on engagement)
    const bestTimesResult = await queryValidator(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as post_count,
        AVG(engagement_score) as avg_engagement
      FROM posts 
      WHERE university_id = $1 AND is_active = true AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY avg_engagement DESC
      LIMIT 5
    `, [universityId]);

    // Get user's tag usage
    const userTagUsageResult = await queryValidator(`
      SELECT 
        t.name as tag_name,
        t.category as tag_category,
        COUNT(pt.post_id) as usage_count
      FROM tags t
      JOIN post_tags pt ON t.id = pt.tag_id
      JOIN posts p ON pt.post_id = p.id
      WHERE p.user_id = $1 AND p.university_id = $2 AND p.is_active = true
      GROUP BY t.id, t.name, t.category
      ORDER BY usage_count DESC
    `, [userId, universityId]);

    const stats = {
      user: {
        totalPosts: parseInt(userStatsResult.rows[0]?.total_posts || 0),
        offerPosts: parseInt(userStatsResult.rows[0]?.offer_posts || 0),
        requestPosts: parseInt(userStatsResult.rows[0]?.request_posts || 0),
        eventPosts: parseInt(userStatsResult.rows[0]?.event_posts || 0),
        averageViews: parseFloat(userStatsResult.rows[0]?.avg_views || 0).toFixed(1),
        maxViews: parseInt(userStatsResult.rows[0]?.max_views || 0),
        averageEngagement: parseFloat(userStatsResult.rows[0]?.avg_engagement || 0).toFixed(2),
        maxEngagement: parseFloat(userStatsResult.rows[0]?.max_engagement || 0).toFixed(2)
      },
      university: {
        postTypePerformance: universityStatsResult.rows.map(row => ({
          postType: row.post_type,
          postCount: parseInt(row.post_count),
          averageViews: parseFloat(row.avg_views || 0).toFixed(1),
          averageEngagement: parseFloat(row.avg_engagement || 0).toFixed(2),
          averageBookmarks: parseFloat(row.avg_bookmarks || 0).toFixed(1)
        })),
        popularTags: popularTagsResult.rows.map(row => ({
          name: row.tag_name,
          category: row.tag_category,
          usageCount: parseInt(row.usage_count),
          averageViews: parseFloat(row.avg_views || 0).toFixed(1)
        })),
        bestPostingTimes: bestTimesResult.rows.map(row => ({
          hour: parseInt(row.hour),
          postCount: parseInt(row.post_count),
          averageEngagement: parseFloat(row.avg_engagement || 0).toFixed(2),
          timeLabel: `${row.hour}:00`
        }))
      },
      userTags: userTagUsageResult.rows.map(row => ({
        name: row.tag_name,
        category: row.tag_category,
        usageCount: parseInt(row.usage_count)
      }))
    };

    // Generate insights and recommendations
    const insights = [];
    
    if (stats.user.totalPosts === 0) {
      insights.push({
        type: 'info',
        message: 'Welcome! This will be your first post. Consider adding images to make it more engaging.',
        priority: 'high'
      });
    } else {
      // Engagement insights
      if (stats.user.averageEngagement < 0.5) {
        insights.push({
          type: 'suggestion',
          message: 'Your posts could be more engaging. Try adding images and using popular tags.',
          priority: 'medium'
        });
      }
      
      // Post type insights
      if (stats.user.offerPosts === 0) {
        insights.push({
          type: 'suggestion',
          message: 'Try creating an "Offer" post - they tend to get good engagement.',
          priority: 'low'
        });
      }
      
      if (stats.user.eventPosts === 0) {
        insights.push({
          type: 'suggestion',
          message: 'Event posts often get high visibility. Consider creating one!',
          priority: 'low'
        });
      }
    }

    // Best posting time recommendation
    if (stats.university.bestPostingTimes.length > 0) {
      const bestTime = stats.university.bestPostingTimes[0];
      insights.push({
        type: 'tip',
        message: `Posts around ${bestTime.timeLabel} tend to get the best engagement.`,
        priority: 'medium'
      });
    }

    // Popular tag recommendations
    if (stats.university.popularTags.length > 0) {
      const topTag = stats.university.popularTags[0];
      insights.push({
        type: 'tip',
        message: `"${topTag.name}" is the most popular tag. Consider using it if relevant.`,
        priority: 'low'
      });
    }

    res.json({
      success: true,
      data: {
        stats,
        insights,
        recommendations: {
          bestPostingTimes: stats.university.bestPostingTimes.slice(0, 3),
          topTags: stats.university.popularTags.slice(0, 5),
          successfulPostTypes: stats.university.postTypePerformance
            .filter(p => p.averageEngagement > 0.5)
            .sort((a, b) => b.averageEngagement - a.averageEngagement)
        }
      }
    });

  } catch (error) {
    console.error('Get create stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve post statistics',
      error: error.message
    });
  }
});

// @route   POST /api/v1/posts/draft
// @desc    Save a draft post
// @access  Private
router.post('/draft', [
  auth,
  body('content').optional().isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters').trim(),
  body('postType').optional().isIn(['goods-services', 'events']).withMessage('Post type must be goods-services or events'),
  body('primaryTags').optional().isArray({ max: 1 }).withMessage('Maximum 1 primary tag allowed'),
  body('secondaryTags').optional().isArray({ max: 5 }).withMessage('Maximum 5 secondary tags allowed'),
  body('images').optional().isArray({ max: 10 }).withMessage('Maximum 10 images allowed'),
  body('eventDetails').optional().isObject().withMessage('Event details must be an object'),
  validate
], async (req, res) => {
  try {
    const {
      content = '',
      postType,
      primaryTags = [],
      secondaryTags = [],
      images = [],
      eventDetails = {}
    } = req.body;

    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    // Check if user already has a draft
    const existingDraftResult = await queryValidator(`
      SELECT id FROM post_drafts 
      WHERE user_id = $1 AND university_id = $2
    `, [userId, universityId]);

    let draftId;
    
    if (existingDraftResult.rows.length > 0) {
      // Update existing draft
      draftId = existingDraftResult.rows[0].id;
      await queryValidator(`
        UPDATE post_drafts SET
          content = $1,
          post_type = $2,
          primary_tags = $3,
          secondary_tags = $4,
          images = $5,
          event_details = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
      `, [content, postType, primaryTags, secondaryTags, images, eventDetails, draftId]);
    } else {
      // Create new draft
      const newDraftResult = await queryValidator(`
        INSERT INTO post_drafts (
          user_id, 
          university_id, 
          content, 
          post_type, 
          primary_tags, 
          secondary_tags, 
          images, 
          event_details
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [userId, universityId, content, postType, primaryTags, secondaryTags, images, eventDetails]);
      
      draftId = newDraftResult.rows[0].id;
    }

    res.json({
      success: true,
      message: 'Draft saved successfully',
      data: {
        draftId,
        savedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to save draft',
        details: error.message
      }
    });
  }
});

// @route   GET /api/v1/posts/draft
// @desc    Get user's draft post
// @access  Private
router.get('/draft', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    const draftResult = await queryValidator(`
      SELECT 
        id,
        content,
        post_type,
        primary_tags,
        secondary_tags,
        images,
        event_details,
        created_at,
        updated_at
      FROM post_drafts 
      WHERE user_id = $1 AND university_id = $2
    `, [userId, universityId]);

    if (draftResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          hasDraft: false,
          draft: null
        }
      });
    }

    const draft = draftResult.rows[0];

    res.json({
      success: true,
      data: {
        hasDraft: true,
        draft: {
          id: draft.id,
          content: draft.content,
          postType: draft.post_type,
          primaryTags: draft.primary_tags || [],
          secondaryTags: draft.secondary_tags || [],
          images: draft.images || [],
          eventDetails: draft.event_details || {},
          createdAt: draft.created_at,
          updatedAt: draft.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Get draft error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve draft',
        details: error.message
      }
    });
  }
});

// @route   DELETE /api/v1/posts/draft
// @desc    Delete user's draft post
// @access  Private
router.delete('/draft', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    await queryValidator(`
      DELETE FROM post_drafts 
      WHERE user_id = $1 AND university_id = $2
    `, [userId, universityId]);

    res.json({
      success: true,
      message: 'Draft deleted successfully'
    });

  } catch (error) {
    console.error('Delete draft error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete draft',
        details: error.message
      }
    });
  }
});

// @route   GET /api/v1/posts/create-tips
// @desc    Get post creation tips and best practices
// @access  Private
router.get('/create-tips', auth, async (req, res) => {
  try {
    const { postType } = req.query;
    
    const tips = {
      general: [
        {
          id: 'content-length',
          title: 'Write Detailed Descriptions',
          description: 'Posts with 50+ characters get 40% more engagement',
          icon: '📝',
          category: 'content',
          priority: 'high'
        },
        {
          id: 'add-images',
          title: 'Include Images',
          description: 'Posts with images get 2x more views and engagement',
          icon: '🖼️',
          category: 'media',
          priority: 'high'
        },
        {
          id: 'use-tags',
          title: 'Use Relevant Tags',
          description: 'Proper tagging helps others find your post',
          icon: '🏷️',
          category: 'discovery',
          priority: 'medium'
        },
        {
          id: 'posting-time',
          title: 'Post at Peak Times',
          description: 'Posts between 6-9 PM get the most engagement',
          icon: '⏰',
          category: 'timing',
          priority: 'medium'
        }
      ],
      'goods-services': [
        {
          id: 'clear-pricing',
          title: 'Include Clear Pricing',
          description: 'Mention if free, price range, or negotiable',
          icon: '💰',
          category: 'details',
          priority: 'high'
        },
        {
          id: 'condition-info',
          title: 'Describe Condition',
          description: 'New, like-new, good, fair - be specific',
          icon: '🔍',
          category: 'details',
          priority: 'medium'
        },
        {
          id: 'location-details',
          title: 'Mention Location',
          description: 'Campus area, building, or meeting point',
          icon: '📍',
          category: 'details',
          priority: 'medium'
        },
        {
          id: 'contact-method',
          title: 'Preferred Contact',
          description: 'How should people reach you?',
          icon: '📱',
          category: 'communication',
          priority: 'low'
        }
      ],
      events: [
        {
          id: 'event-details',
          title: 'Complete Event Info',
          description: 'Date, time, location, and what to expect',
          icon: '📅',
          category: 'details',
          priority: 'high'
        },
        {
          id: 'cost-info',
          title: 'Mention Cost',
          description: 'Free, ticket price, or donation suggested',
          icon: '🎫',
          category: 'details',
          priority: 'medium'
        },
        {
          id: 'attire-info',
          title: 'Dress Code',
          description: 'Casual, business casual, formal, or themed',
          icon: '👔',
          category: 'details',
          priority: 'low'
        },
        {
          id: 'rsvp-info',
          title: 'RSVP Details',
          description: 'Required, optional, or deadline',
          icon: '✅',
          category: 'details',
          priority: 'low'
        }
      ]
    };

    // Add dynamic tips based on user's posting history
    const userId = req.user.id;
    const universityId = UNIVERSITY_CONFIG.primaryUniversityId;

    const userStatsResult = await queryValidator(`
      SELECT 
        COUNT(*) as total_posts,
        AVG(view_count) as avg_views,
        AVG(engagement_score) as avg_engagement
      FROM posts 
      WHERE user_id = $1 AND university_id = $2 AND is_active = true
    `, [userId, universityId]);

    if (userStatsResult.rows.length > 0) {
      const stats = userStatsResult.rows[0];
      const totalPosts = parseInt(stats.total_posts || 0);
      const avgViews = parseFloat(stats.avg_views || 0);
      const avgEngagement = parseFloat(stats.avg_engagement || 0);

      if (totalPosts === 0) {
        tips.personalized = [
          {
            id: 'first-post',
            title: 'Welcome to CampusConnect!',
            description: 'This is your first post. Start with something simple and engaging.',
            icon: '🎉',
            category: 'motivation',
            priority: 'high'
          }
        ];
      } else if (avgViews < 10) {
        tips.personalized = [
          {
            id: 'low-views',
            title: 'Boost Your Visibility',
            description: 'Your posts could get more views. Try adding images and using popular tags.',
            icon: '📈',
            category: 'improvement',
            priority: 'medium'
          }
        ];
      } else if (avgEngagement < 0.3) {
        tips.personalized = [
          {
            id: 'low-engagement',
            title: 'Increase Engagement',
            description: 'Your posts get views but low engagement. Try asking questions or including calls to action.',
            icon: '💬',
            category: 'improvement',
            priority: 'medium'
          }
        ];
      } else {
        tips.personalized = [
          {
            id: 'doing-great',
            title: 'You\'re Doing Great!',
            description: 'Your posts are performing well. Keep up the good work!',
            icon: '🌟',
            category: 'motivation',
            priority: 'low'
          }
        ];
      }
    }

    // Add post-type specific tips
    if (postType === 'goods-services') {
      tips.current = tips['goods-services'];
    } else if (postType === 'events') {
      tips.current = tips.events;
    } else {
      tips.current = tips.general;
    }

    res.json({
      success: true,
      data: {
        tips,
        summary: {
          totalTips: tips.general.length + tips['goods-services'].length + tips.events.length + (tips.personalized ? tips.personalized.length : 0),
          categories: ['general', 'goods-services', 'events', 'personalized'].filter(cat => tips[cat]),
          lastUpdated: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Get create tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve creation tips',
      error: error.message
    });
  }
});

module.exports = router; 