const express = require('express');
const { body, query, param } = require('express-validator');
const { query, pool } = require('../config/database');
const { redisGet, redisSet, redisDel, generateCacheKey, CACHE_TTL } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { auth, checkOwnership, requireVerification } = require('../middleware/auth');
const { uploadImage } = require('../services/imageService');
const { UNIVERSITY_CONFIG } = require('../config/university');
const { calculateNextRepostDate, getRepostHistory, stopRecurringPost } = require('../services/recurringPostService');
const { updatePostScores } = require('../services/scoringService');
const { getFeedPositionedPosts, getSmartFeedWithPositioning } = require('../services/scoringService');
const multiUniversityScoringService = require('../services/multiUniversityScoringService');

const router = express.Router();

// @route   GET /api/v1/posts/organized
// @desc    Get organized feed with recurring posts prioritized
// @access  Public
router.get('/organized', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('postType').optional().isIn(['offer', 'request', 'event', 'all']).withMessage('Invalid post type'),
  query('tags').optional().isArray().withMessage('Tags must be an array'),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      postType,
      tags
    } = req.query;

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

    // Add post type filter
    if (postType && postType !== 'all') {
      paramCount++;
      organizedQuery += ` AND p.post_type = $${paramCount}`;
      queryParams.push(postType);
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
    const result = await query(organizedQuery, queryParams);

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

    const countResult = await dbQuery(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format posts with organization info
    const posts = result.rows.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      postType: post.post_type,
      durationType: post.duration_type,
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
      imageCount: post.image_count
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
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
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
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
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

// GET /api/v1/posts/tabbed - Get posts organized by main tabs with slide-out sub-tab selection
router.get('/tabbed', [
  query('mainTab').optional().isIn(['goods-services', 'events', 'combined']).withMessage('Invalid main tab category'),
  query('subTab').optional().isString().withMessage('Sub tab must be a string'),
  query('offers').optional().isBoolean().withMessage('Offers filter must be boolean'),
  query('requests').optional().isBoolean().withMessage('Requests filter must be boolean'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
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
        p.duration_type, p.repost_frequency, p.original_post_id, p.message_count,
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
    
    const result = await query(baseQuery, queryParams);
    
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
    
    const countResult = await query(countQuery, countParams);
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
            
            const countResult = await query(countQuery, countParams);
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
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('universityId').optional().isInt().withMessage('University ID must be an integer'),
  query('postType').optional().isIn(['offer', 'request', 'event', 'all']).withMessage('Invalid post type'),
  query('tags').optional().isArray().withMessage('Tags must be an array'),
  query('sortBy').optional().isIn(['recent', 'expiring', 'recurring', 'organized']).withMessage('Invalid sort option'),
  query('expandCluster').optional().isBoolean().withMessage('Expand cluster must be boolean'),
  validate
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      universityId,
      postType,
      tags,
      sortBy = 'recent',
      expandCluster = false,
      userId
    } = req.query;

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
    const result = await query(baseQuery, queryParams);

    // Get total count for pagination (Cal Poly SLO only for now)
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      WHERE p.is_active = true AND p.university_id = $1
    `;
    
    const countParams = [UNIVERSITY_CONFIG.primaryUniversityId];
    paramCount = 1;

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

    const countResult = await dbQuery(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format posts
    const posts = result.rows.map(post => ({
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
    await query(`
      UPDATE posts 
      SET view_count = view_count + 1 
      WHERE id = $1
    `, [id]);

    // Get post with details
    const result = await query(`
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
  body('postType').isIn(['offer', 'request', 'event']).withMessage('Post type must be offer, request, or event'),
        body('durationType').isIn(['one-time', 'recurring', 'event']).withMessage('Duration type must be one-time, recurring, or event'),
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
        INSERT INTO posts (user_id, university_id, title, description, post_type, duration_type, repost_frequency, next_repost_date, expires_at, event_start, event_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, title, description, post_type, duration_type, repost_frequency, next_repost_date, expires_at, event_start, event_end, created_at
      `, [userId, universityId, title, description, postType, durationType, repostFrequency, nextRepostDate, expiresAt, eventStart, eventEnd]);

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
      const fullPostResult = await query(`
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
  body('postType').isIn(['offer', 'request', 'event']).withMessage('Post type must be offer, request, or event'),
  body('durationType').isIn(['one-time', 'recurring', 'event']).withMessage('Duration type must be one-time, recurring, or event'),
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
      expiresAt,
      eventStart,
      eventEnd,
      tags
    } = req.body;

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update post
      const updateResult = await client.query(`
        UPDATE posts 
        SET title = $1, description = $2, post_type = $3, duration_type = $4, 
            expires_at = $5, event_start = $6, event_end = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING id, title, description, post_type, duration_type, expires_at, event_start, event_end, updated_at
      `, [title, description, postType, durationType, expiresAt, eventStart, eventEnd, id]);

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
    const result = await query(`
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

    const result = await query(`
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
    
    const postResult = await query(postQuery, [
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
        let tagResult = await query('SELECT id FROM tags WHERE name = $1', [tagName]);
        let tagId;
        
        if (tagResult.rows.length === 0) {
          const newTagResult = await query('INSERT INTO tags (name, category) VALUES ($1, $2) RETURNING id', [tagName, 'other']);
          tagId = newTagResult.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        // Link tag to post
        await query('INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [postId, tagId]);
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
    
    const completePostResult = await query(completePostQuery, [postId]);
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
    const ownershipResult = await query(ownershipQuery, [postId]);
    
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
      ? await query(postsQuery, [limit, offset])
      : await query(postsQuery, [scope, limit, offset]);
    
    const countResult = scope === 'single'
      ? await query(countQuery)
      : await query(countQuery, [scope]);
    
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

module.exports = router; 