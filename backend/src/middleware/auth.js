const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { redisGet, redisSet, generateCacheKey, CACHE_TTL } = require('../config/redis');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No token provided.'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired. Please login again.'
        }
      });
    }

    // Check Redis cache for user session
    const cacheKey = generateCacheKey('session', decoded.userId);
    let user = await redisGet(cacheKey);

    if (!user) {
      // If not in cache, get from database
      const result = await query(
        'SELECT id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, banned_at, ban_until, ban_reason FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'User not found.'
          }
        });
      }

      user = result.rows[0];
      
      // Check if user is banned and if temporary ban has expired
      if (user.banned_at) {
        if (user.ban_until) {
          const banUntil = new Date(user.ban_until);
          const now = new Date();
          
          if (now > banUntil) {
            // Temporary ban has expired - automatically unban the user
            await query(`
              UPDATE users 
              SET is_active = true,
                  banned_at = NULL,
                  ban_until = NULL,
                  ban_reason = NULL
              WHERE id = $1
            `, [user.id]);
            
            console.log(`✅ Temporary ban expired for user ${user.id} - automatically unbanned`);
            
            // Refresh user data after unbanning
            const refreshedResult = await query(
              'SELECT id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, banned_at, ban_until, ban_reason FROM users WHERE id = $1',
              [user.id]
            );
            user = refreshedResult.rows[0];
          } else {
            // Temporary ban still active
            return res.status(403).json({
              success: false,
              error: {
                message: `Account suspended until ${banUntil.toLocaleDateString()}. Reason: ${user.ban_reason || 'Violation of terms'}`,
                banUntil: user.ban_until
              }
            });
          }
        } else {
          // Permanent ban
          return res.status(403).json({
            success: false,
            error: {
              message: `Account permanently banned. Reason: ${user.ban_reason || 'Violation of terms'}`
            }
          });
        }
      }
      
      // Check if account is deactivated
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Account deactivated.'
          }
        });
      }
      
      // Cache user data
      await redisSet(cacheKey, user, CACHE_TTL.SESSION);
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token. Please login again.'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired. Please login again.'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed. Please try again.'
      }
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.exp && Date.now() < decoded.exp * 1000) {
        const cacheKey = generateCacheKey('session', decoded.userId);
        let user = await redisGet(cacheKey);

        if (!user) {
          const result = await query(
            'SELECT id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, banned_at, ban_until, ban_reason FROM users WHERE id = $1',
            [decoded.userId]
          );

          if (result.rows.length > 0) {
            user = result.rows[0];
            
            // Check if temporary ban has expired (same logic as main auth)
            if (user.banned_at && user.ban_until) {
              const banUntil = new Date(user.ban_until);
              const now = new Date();
              
              if (now > banUntil) {
                // Auto-unban
                await query(`
                  UPDATE users 
                  SET is_active = true,
                      banned_at = NULL,
                      ban_until = NULL,
                      ban_reason = NULL
                  WHERE id = $1
                `, [user.id]);
                
                // Refresh user
                const refreshedResult = await query(
                  'SELECT id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, banned_at, ban_until, ban_reason FROM users WHERE id = $1',
                  [user.id]
                );
                user = refreshedResult.rows[0];
              }
            }
            
            // Only cache and attach user if they're not banned and active
            if (user.is_active && !user.banned_at) {
              await redisSet(cacheKey, user, CACHE_TTL.SESSION);
            } else {
              user = null; // Don't attach banned/inactive users
            }
          }
        }

        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail on auth errors in optional auth
    next();
  }
};

// Check if user owns the resource
const checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Authentication required.'
          }
        });
      }

      let resourceId;
      let queryString;

      switch (resourceType) {
        case 'post':
          resourceId = req.params.postId || req.params.id;
          queryString = 'SELECT user_id FROM posts WHERE id = $1';
          break;
        case 'user':
          resourceId = req.params.userId || req.params.id;
          queryString = 'SELECT id FROM users WHERE id = $1';
          break;
        case 'message':
          resourceId = req.params.messageId || req.params.id;
          queryString = 'SELECT sender_id FROM messages WHERE id = $1';
          break;
        default:
          return res.status(400).json({
            success: false,
            error: {
              message: 'Invalid resource type.'
            }
          });
      }

      const result = await query(queryString, [resourceId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Resource not found.'
          }
        });
      }

      const ownerId = result.rows[0].user_id || result.rows[0].sender_id || result.rows[0].id;

      if (ownerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied. You do not own this resource.'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to verify resource ownership.'
        }
      });
    }
  };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Account verification required. Please check your email.'
      }
    });
  }
  next();
};

module.exports = {
  auth,
  optionalAuth,
  checkOwnership,
  requireVerification
}; 