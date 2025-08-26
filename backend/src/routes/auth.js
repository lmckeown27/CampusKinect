const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { query } = require('../config/database');
const { redisSet, generateCacheKey, CACHE_TTL, redisDel } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { sendVerificationCode } = require('../services/emailService');
const { UNIVERSITY_CONFIG } = require('../config/university');
const educationalDomainService = require('../services/educationalDomainService');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username').custom(async (value) => {
    const result = await query('SELECT id FROM users WHERE username = $1', [value]);
    if (result.rows.length > 0) {
      throw new Error('Username already exists');
    }
    return true;
  }),
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .custom(async (value) => {
      // Use the educational domain service to validate
      const validation = await educationalDomainService.validateEducationalDomain(value);
      
      if (!validation.isValid) {
        throw new Error('Email must be from a valid educational institution in a supported country (US, UK, Canada, Australia, Germany, France)');
      }
      
      // Check if email is already registered
      const result = await query('SELECT id FROM users WHERE email = $1', [value]);
      if (result.rows.length > 0) {
        throw new Error('Email already registered');
      }
      
      return true;
    }),

  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be between 8 and 128 characters'),
  body('firstName').isLength({ min: 1, max: 100 }).isAlpha().withMessage('First name must be 1-100 letters'),
  body('lastName').isLength({ min: 1, max: 100 }).isAlpha().withMessage('Last name must be 1-100 letters'),
  body('year').optional().isInt({ min: 1, max: 10 }).withMessage('Year must be 1-10'),
  body('major').optional().isLength({ max: 200 }).withMessage('Major cannot exceed 200 characters'),
  body('hometown').optional().isLength({ max: 200 }).withMessage('Hometown cannot exceed 200 characters'),
  validate
], async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      year,
      major,
      hometown
    } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Get or create university for the user's email domain
    const domain = email.split('@')[1];
    let universityId = UNIVERSITY_CONFIG.primaryUniversityId; // Default to Cal Poly SLO
    
    // Try to find existing university
    const universityResult = await query('SELECT id FROM universities WHERE domain = $1', [domain]);
    if (universityResult.rows.length > 0) {
      universityId = universityResult.rows[0].id;
    } else {
      // Create new university entry
      const newUniversityResult = await query(`
        INSERT INTO universities (name, domain, country, is_active)
        VALUES ($1, $2, $3, true)
        RETURNING id
      `, [domain, domain, 'US']); // Default country, will be updated by validation service
      universityId = newUniversityResult.rows[0].id;
    }
    
    // Create user with detected university
    const result = await query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, year, major, hometown, university_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, created_at
    `, [username, email, passwordHash, firstName, lastName, year, major, hometown, universityId]);

    const user = result.rows[0];

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email (or auto-verify in development)
    if (process.env.NODE_ENV === 'development' && process.env.AUTO_VERIFY_EMAILS === 'true') {
      console.log('🔧 Development mode: Auto-verifying email for testing');
      // Auto-verify the user in development
      await query('UPDATE users SET is_verified = true WHERE id = $1', [user.id]);
      user.is_verified = true;
    } else {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store verification code in database
      await query('UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3', 
        [verificationCode, expiresAt, user.id]);
      
      // Send verification code email
      await sendVerificationCode(user.email, user.first_name, verificationCode);
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // Store refresh token in database
    await query(`
      INSERT INTO user_sessions (user_id, refresh_token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);

    // Cache user data
    const cacheKey = generateCacheKey('session', user.id);
    await redisSet(cacheKey, user, CACHE_TTL.SESSION);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
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
          universityId: user.university_id,
          isVerified: user.is_verified,
          isActive: user.is_active,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .custom(async (value) => {
      // Use the educational domain service to validate
      const validation = await educationalDomainService.validateEducationalDomain(value);
      
      if (!validation.isValid) {
        throw new Error('Email must be from a valid educational institution in a supported country (US, UK, Canada, Australia, Germany, France)');
      }
      
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await query(`
      SELECT u.*, un.name as university_name, un.domain as university_domain
      FROM users u
      JOIN universities un ON u.university_id = un.id
      WHERE u.email = $1 AND u.is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials'
        }
      });
    }

    const user = result.rows[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials'
        }
      });
    }

    // Check if email is verified
    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Please verify your email address before logging in. Check your email for a verification code.',
          code: 'EMAIL_NOT_VERIFIED'
        }
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // Store refresh token in database
    await query(`
      INSERT INTO user_sessions (user_id, refresh_token, expires_at)
      VALUES ($1, $2, $3)
    `, [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);

    // Cache user data
    const cacheKey = generateCacheKey('session', user.id);
    await redisSet(cacheKey, user, CACHE_TTL.SESSION);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
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
          universityId: user.university_id,
          universityName: user.university_name,
          universityDomain: user.university_domain,
          isVerified: user.is_verified,
          isActive: user.is_active,
          createdAt: user.created_at
        },
        tokens: {
          accessToken,
          refreshToken
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token type'
        }
      });
    }

    // Check if refresh token exists in database
    const result = await query(`
      SELECT us.*, u.is_active
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.refresh_token = $1 AND us.expires_at > NOW() AND u.is_active = true
    `, [refreshToken]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired refresh token'
        }
      });
    }

    const session = result.rows[0];

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: session.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token expired'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Token refresh failed. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/verify-email
// @desc    Verify user email with token
// @access  Public
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required'),
  validate
], async (req, res) => {
  try {
    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'verification') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid verification token'
        }
      });
    }

    // Update user verification status
    const result = await query(`
      UPDATE users 
      SET is_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND is_verified = false
      RETURNING id, username, email, first_name, last_name, is_verified
    `, [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User already verified or not found'
        }
      });
    }

    const user = result.rows[0];

    // Clear cached user data
    const cacheKey = generateCacheKey('session', user.id);
    await redisSet(cacheKey, null, 1);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isVerified: user.is_verified
        }
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid verification token'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Verification token expired'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Email verification failed. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend verification email
// @access  Public
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists and needs verification
    const result = await query(`
      SELECT id, first_name, is_verified
      FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User is already verified'
        }
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    await sendVerificationCode(email, user.first_name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to resend verification email. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/verify-code
// @desc    Verify user account with verification code
// @access  Public
router.post('/verify-code', [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .custom((value) => {
      // Check if it's a .edu email
      if (!value.endsWith('.edu')) {
        throw new Error('Email must be a valid .edu address');
      }
      
      // Check if it's Cal Poly SLO
      if (!value.endsWith('@calpoly.edu')) {
        throw new Error('Thank you for your interest in CampusConnect! We\'re currently working out all the bugs with Cal Poly SLO first before expanding to other universities. Please check back later or contact us if you\'d like to be notified when we expand to your university.');
      }
      
      return true;
    }),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  validate
], async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user with this email and verification code
    const result = await query(`
      SELECT id, verification_code, verification_code_expires, is_verified
      FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account is already verified'
        }
      });
    }

    // Check if verification code exists
    if (!user.verification_code) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No verification code found. Please request a new one.'
        }
      });
    }

    // Check if verification code matches
    if (user.verification_code !== code) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid verification code'
        }
      });
    }

    // Check if verification code has expired
    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Verification code has expired. Please request a new one.'
        }
      });
    }

    // Verify the user account
    await query(`
      UPDATE users 
      SET is_verified = true, 
          verification_code = NULL, 
          verification_code_expires = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [user.id]);

    // Clear any cached user data
    const cacheKey = generateCacheKey('user', user.id);
    await redisDel(cacheKey);

    res.json({
      success: true,
      message: 'Account verified successfully! You can now log in.',
      data: {
        userId: user.id,
        email: email,
        isVerified: true
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Verification failed. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/resend-code
// @desc    Resend verification code
// @access  Public
router.post('/resend-code', [
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .custom((value) => {
      // Check if it's a .edu email
      if (!value.endsWith('.edu')) {
        throw new Error('Email must be a valid .edu address');
      }
      
      // Check if it's Cal Poly SLO
      if (!value.endsWith('@calpoly.edu')) {
        throw new Error('Thank you for your interest in CampusConnect! We\'re currently working out all the bugs with Cal Poly SLO first before expanding to other universities. Please check back later or contact us if you\'d like to be notified when we expand to your university.');
      }
      
      return true;
    }),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    // Find user with this email
    const result = await query(`
      SELECT id, first_name, is_verified
      FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Account is already verified'
        }
      });
    }

    // Generate new 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store new verification code in database
    await query('UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE id = $3', 
      [verificationCode, expiresAt, user.id]);
    
    // Send new verification code email
    await sendVerificationCode(user.email, user.first_name, verificationCode);

    res.json({
      success: true,
      message: 'New verification code sent successfully. Please check your email.',
      data: {
        email: email
      }
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to resend verification code. Please try again.'
      }
    });
  }
});

// @route   POST /api/v1/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // Remove refresh token from database
    await query(`
      DELETE FROM user_sessions 
      WHERE user_id = $1
    `, [req.user.id]);

    // Clear cached user data
    const cacheKey = generateCacheKey('session', req.user.id);
    await redisSet(cacheKey, null, 1);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Logout failed. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.first_name,
          lastName: req.user.last_name,
          displayName: req.user.display_name,
          profilePicture: req.user.profile_picture,
          year: req.user.year,
          major: req.user.major,
          hometown: req.user.hometown,
          universityId: req.user.university_id,
          isVerified: req.user.is_verified,
          isActive: req.user.is_active,
          createdAt: req.user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to get profile. Please try again.'
      }
    });
  }
});

module.exports = router; 