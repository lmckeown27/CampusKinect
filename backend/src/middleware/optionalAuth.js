const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { redisGet, generateCacheKey } = require('../config/redis');

/**
 * Optional Auth Middleware
 * Checks for authentication but doesn't block request if no token
 * Used for guest mode endpoints that can work with or without auth
 */
const optionalAuth = async (req, res, next) => {
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

    // If no token, mark as guest and continue
    if (!token) {
      req.isGuest = true;
      req.user = null;
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        req.isGuest = true;
        req.user = null;
        return next();
      }

      // Check Redis cache for user session
      const cacheKey = generateCacheKey('session', decoded.userId);
      let user = await redisGet(cacheKey);

      if (!user) {
        // If not in cache, get from database
        const result = await query(
          'SELECT id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active FROM users WHERE id = $1 AND is_active = true',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          req.isGuest = true;
          req.user = null;
          return next();
        }

        user = result.rows[0];
      }

      // Attach user to request
      req.user = user;
      req.isGuest = false;
    } catch (error) {
      // Token invalid or expired - treat as guest
      req.isGuest = true;
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // On error, default to guest mode
    req.isGuest = true;
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;
