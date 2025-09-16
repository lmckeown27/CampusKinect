const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { redisSet, generateCacheKey, CACHE_TTL, redisDel } = require('../config/redis');
const { validate, commonValidations } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { sendVerificationCode } = require('../services/emailService');
const { UNIVERSITY_CONFIG } = require('../config/university');
const educationalDomainService = require('../services/educationalDomainService');
const messageService = require('../services/messageService');

const router = express.Router();

const pendingRegistrations = new Map(); // Temporary storage for pending registrations

// Special testing route for admin access (development only)
if (process.env.NODE_ENV === 'development') {
  // @route   POST /api/v1/auth/test-admin
  // @desc    Create admin test user (development only)
  // @access  Public
  router.post('/test-admin', async (req, res) => {
    try {
      const testCredentials = {
        username: 'liam_mckeown38',
        email: 'lmckeown@calpoly.edu',
        password: 'Lx734bd6$',
        firstName: 'Liam',
        lastName: 'McKeown'
      };

      // Check if test admin already exists
      const existingUser = await query('SELECT id FROM users WHERE username = $1 OR email = $2', 
        [testCredentials.username, testCredentials.email]);
      
      if (existingUser.rows.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Test admin user already exists',
          data: { user: existingUser.rows[0] }
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(testCredentials.password, salt);

      // Get Cal Poly university ID
      const universityResult = await query('SELECT id FROM universities WHERE domain = $1', ['calpoly.edu']);
      const universityId = universityResult.rows.length > 0 ? universityResult.rows[0].id : UNIVERSITY_CONFIG.primaryUniversityId;

      // Create test admin user (auto-verified, no email verification needed)
      const result = await query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, university_id, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, true, true)
        RETURNING id, username, email, first_name, last_name, is_verified, is_active, created_at
      `, [testCredentials.username, testCredentials.email, passwordHash, testCredentials.firstName, testCredentials.lastName, universityId]);

      const user = result.rows[0];

      // Generate access token
      const accessToken = jwt.sign(
        { userId: user.id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh', role: 'admin' },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '90d' }
      );

      // Store refresh token
      await query(`
        INSERT INTO user_sessions (user_id, refresh_token, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, refreshToken, new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)]);

      // Cache user data
      const cacheKey = generateCacheKey('session', user.id);
      await redisSet(cacheKey, user, CACHE_TTL.SESSION);

      res.status(201).json({
        success: true,
        message: 'Test admin user created successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
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
      console.error('Error creating test admin user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test admin user',
        error: error.message
      });
    }
  });
}

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('username').custom(async (value, { req }) => {
        // Allow unlimited accounts with test credentials for development
        if (process.env.NODE_ENV === 'development' &&
            value === 'liam_mckeown38') {
          return true; // Skip username uniqueness check for test admin
        }
        
        // Allow unlimited accounts for hardcoded test email
        if (process.env.NODE_ENV === 'development' &&
            req.body.email === 'lmckeown@calpoly.edu') {
          return true; // Skip username uniqueness check for hardcoded test
        }
    
    const result = await query('SELECT id FROM users WHERE username = $1', [value]);
    if (result.rows.length > 0) {
      throw new Error('Username already exists');
    }
    return true;
  }),
  body('email')
    .isEmail().withMessage('Please provide a valid email address')
    .custom(async (value, { req }) => {
      // Allow unlimited accounts for hardcoded test email (bypass all validation)
      if (process.env.NODE_ENV === 'development' &&
          value === 'lmckeown@calpoly.edu') {
        return true; // Skip all validation for hardcoded test
      }
      
      // Use the educational domain service to validate
      const validation = await educationalDomainService.validateEducationalDomain(value);
      
      if (!validation.isValid) {
        // Check if it's an unsupported university (.edu domain not in our list)
        if (validation.isUnsupportedUniversity) {
          throw new Error(`Your university (${validation.domain}) is not currently supported on CampusKinect. Please email campuskinect01@gmail.com to request that your university be added to the platform.`);
        }
        
        throw new Error('Email must be from a valid educational institution in a supported country (US, UK, Canada, Australia, Germany, France)');
      }
      
      // Allow unlimited accounts with test credentials for development
      if (process.env.NODE_ENV === 'development' &&
          value === 'liam_mckeown38') {
        return true; // Skip email uniqueness check for test admin
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

    const { username, email, password, firstName, lastName, year, major, hometown } = req.body;

    // Check if this is a test bypass account (password-based bypass)
    const isTestBypass = process.env.NODE_ENV === 'development' && 
                        password === 'Test12345';

    // Check if this is a hardcoded test account (lmckeown@calpoly.edu)
    const isHardcodedTest = false; // Disabled for testing verification flow

    // For test bypass accounts, check if they already exist and return them
    if (isTestBypass) {
      // Look for any existing test user (we'll use the first one found)
      const existingTestUser = await query(`
        SELECT id, username, email, first_name, last_name, is_verified, is_active, created_at
        FROM users 
        WHERE is_active = true
        ORDER BY created_at ASC
        LIMIT 1
      `);
      
      if (existingTestUser.rows.length > 0) {
        const existingUser = existingTestUser.rows[0];
        
        // Generate new tokens for the existing test user
        const accessToken = jwt.sign(
          { userId: existingUser.id },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        const refreshToken = jwt.sign(
          { userId: existingUser.id, type: 'refresh' },
          process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
        );
        
        // Store new refresh token
        await query(`
          INSERT INTO user_sessions (user_id, refresh_token, expires_at)
          VALUES ($1, $2, $3)
        `, [existingUser.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
        
        // Cache user data
        const cacheKey = generateCacheKey('session', existingUser.id);
        await redisSet(cacheKey, existingUser, CACHE_TTL.SESSION);
        
        return res.status(200).json({
          success: true,
          message: 'Test bypass successful. Logged into existing test account.',
          data: {
            user: {
              id: existingUser.id,
              username: existingUser.username,
              email: existingUser.email,
              firstName: existingUser.first_name,
              lastName: existingUser.last_name,
              displayName: existingUser.first_name + ' ' + existingUser.last_name,
              profilePicture: null,
              year: null,
              major: null,
              hometown: null,
              universityId: null,
              isVerified: existingUser.is_verified,
              isActive: existingUser.is_active,
              createdAt: existingUser.created_at
            },
            tokens: {
              accessToken,
              refreshToken
            }
          }
        });
      }
    }

    // Check if user already exists (for non-test accounts)
    const existingUser = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      if (existing.email === email) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Email already registered. Please sign in instead.'
          }
        });
      } else if (existing.username === username) {
        return res.status(409).json({
          success: false,
          error: {
            message: 'Username already exists. Please choose a different username.'
          }
        });
      }
    }

    // Clean up any existing pending registrations for this email/username
    // This prevents "zombie" registrations from blocking new attempts
    const now = new Date();
    let removedPending = false;
    
    for (const [key, pendingReg] of pendingRegistrations.entries()) {
      // Remove if same email/username OR if older than 5 minutes (aggressive cleanup)
      const isExpiredOrDuplicate = 
        pendingReg.email === email || 
        pendingReg.username === username ||
        (now - pendingReg.createdAt > 5 * 60 * 1000);
        
      if (isExpiredOrDuplicate) {
        pendingRegistrations.delete(key);
        removedPending = true;
        console.log('🧹 CLEANUP: Removed pending registration for', pendingReg.email, 
                   pendingReg.email === email ? '(same email)' : 
                   pendingReg.username === username ? '(same username)' : '(expired)');
      }
    }
    
    if (removedPending) {
      console.log('📊 CLEANUP: Pending registrations after cleanup:', pendingRegistrations.size);
    }

    // Validate educational domain and get university info
    const domainValidation = await educationalDomainService.validateEducationalDomain(email);
    if (!domainValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email must be from a valid educational institution in a supported country (US, UK, Canada, Australia, Germany, France)'
        }
      });
    }

    // Get or create university
    let universityId;
    const domain = email.split('@')[1];
    console.log('🏫 UNIVERSITY DEBUG: Looking up domain', domain);
    
    const existingUniversity = await query('SELECT id, name FROM universities WHERE domain = $1', [domain]);
    console.log('🏫 UNIVERSITY DEBUG: Database lookup result', existingUniversity.rows);
    
    if (existingUniversity.rows.length > 0) {
      universityId = existingUniversity.rows[0].id;
      console.log('✅ UNIVERSITY DEBUG: Found university', {
        id: universityId,
        name: existingUniversity.rows[0].name,
        domain
      });
    } else {
      console.log('❌ UNIVERSITY DEBUG: Domain not found, checking for Cal Poly fallback');
      
      // Special case: If domain is calpoly.edu and not found, use the primary university ID
      if (domain === 'calpoly.edu') {
        console.log('🔧 UNIVERSITY DEBUG: Using Cal Poly fallback for missing calpoly.edu');
        universityId = UNIVERSITY_CONFIG.primaryUniversityId;
      } else {
        // Create new university entry for other domains
        console.log('🆕 UNIVERSITY DEBUG: Creating new university for domain', domain);
        const newUniversityResult = await query(`
          INSERT INTO universities (name, domain, city, state, country, is_active)
          VALUES ($1, $2, $3, $4, $5, true)
          RETURNING id
        `, [domain, domain, 'Unknown', 'Unknown', 'US']); // Default values for required fields
        universityId = newUniversityResult.rows[0].id;
        console.log('✅ UNIVERSITY DEBUG: Created new university with ID', universityId);
      }
    }
    
    console.log('🎯 UNIVERSITY DEBUG: Final university ID assignment', universityId);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // For auto-verify accounts, create user immediately
    if (isTestBypass || isHardcodedTest || (process.env.NODE_ENV === 'development' && process.env.AUTO_VERIFY_EMAILS === 'true')) {
      // Create user immediately for test/auto-verify accounts
      let result;
      try {
        result = await query(`
          INSERT INTO users (username, email, password_hash, first_name, last_name, year, major, hometown, university_id, is_verified, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, created_at
        `, [
          username, 
          email, 
          passwordHash, 
          firstName, 
          lastName, 
          year || null, 
          major || null, 
          hometown || null, 
          universityId,
          true, // Auto-verify
          true // Always active
        ]);
      } catch (dbError) {
        // Handle duplicate key errors specifically
        if (dbError.code === '23505') {
          if (dbError.constraint === 'users_username_key') {
            return res.status(409).json({
              success: false,
              error: {
                message: 'Username already exists. Please choose a different username.'
              }
            });
          } else if (dbError.constraint === 'users_email_key') {
            return res.status(409).json({
              success: false,
              error: {
                message: 'Email already registered. Please sign in instead.'
              }
            });
          }
        }
        throw dbError;
      }

      const user = result.rows[0];

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user.id, type: 'verification' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Send verification email (or auto-verify in development)
      if (isTestBypass || isHardcodedTest || (process.env.NODE_ENV === 'development' && process.env.AUTO_VERIFY_EMAILS === 'true')) {
        console.log('🔧 Development mode: Auto-verifying email for testing');
        // Auto-verify the user in development or if it's a test bypass/hardcoded test
        await query('UPDATE users SET is_verified = true WHERE id = $1', [user.id]);
        user.is_verified = true;
        
        // Send welcome message to auto-verified user
        try {
          await messageService.sendWelcomeMessage(user.id);
        } catch (welcomeError) {
          console.error('Failed to send welcome message (non-blocking):', welcomeError);
        }
      } else {
        console.log('📧 Production mode: Sending verification code email');
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
        message: isTestBypass ? 'Test bypass account created successfully! No email verification needed.' : 
          isHardcodedTest ? 'Hardcoded test account created successfully! No email verification needed.' :
          'User registered and auto-verified successfully.',
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
          }
        }
      });
    } else {
      // For normal registration, store data temporarily and send verification code
      console.log('📧 Production mode: Sending verification code email');
      
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store registration data temporarily
      const registrationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      pendingRegistrations.set(registrationId, {
        username,
        email,
        passwordHash,
        firstName,
        lastName,
        year: year || null,
        major: major || null,
        hometown: hometown || null,
        universityId,
        verificationCode,
        expiresAt,
        createdAt: new Date()
      });
      
      // Clean up expired registrations (older than 15 minutes)
      const now = new Date();
      for (const [key, reg] of pendingRegistrations.entries()) {
        if (now - reg.createdAt > 15 * 60 * 1000) {
          pendingRegistrations.delete(key);
        }
      }
      
      // Send verification code email
      const emailSent = await sendVerificationCode(email, firstName, verificationCode);
      
      if (!emailSent) {
        // Log the failure but still let user proceed to verification page
        console.log('⚠️  EMAIL FAILED: Email service not working, but allowing user to proceed to verification page for debugging');
        // Note: We keep the pending registration so user can still verify manually if needed
      }
      
      res.status(200).json({
        success: true,
        message: 'Registration data received. Please check your email for verification code.',
        data: {
          registrationId,
          email,
          expiresAt
        }
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error during registration'
      }
    });
  }
});

// @route   POST /api/v1/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('usernameOrEmail')
    .notEmpty().withMessage('Username or email is required')
    .custom(async (value) => {
      // If it looks like an email, validate it
      if (value.includes('@')) {
        const validation = await educationalDomainService.validateEducationalDomain(value);
        if (!validation.isValid) {
          // Check if it's an unsupported university (.edu domain not in our list)
          if (validation.isUnsupportedUniversity) {
            throw new Error(`Your university (${validation.domain}) is not currently supported on CampusKinect. Please email campuskinect01@gmail.com to request that your university be added to the platform.`);
          }
          
          throw new Error('Email must be from a valid educational institution in a supported country (US, UK, Canada, Australia, Germany, France)');
        }
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Check if user exists (by username or email)
    const result = await query(`
      SELECT u.*, un.name as university_name, un.domain as university_domain
      FROM users u
      JOIN universities un ON u.university_id = un.id
      WHERE (u.username = $1 OR u.email = $1) AND u.is_active = true
    `, [usernameOrEmail]);

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

    // Check if email is verified (skip for test admin accounts)
    if (!user.is_verified && !(user.username === 'liam_mckeown38')) {
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

    // Send welcome message from Liam McKeown to the newly verified user
    try {
      await messageService.sendWelcomeMessage(user.id);
    } catch (welcomeError) {
      console.error('Failed to send welcome message (non-blocking):', welcomeError);
      // Don't fail the verification process if welcome message fails
    }

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
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  validate
], async (req, res) => {
  try {
    const { code } = req.body;

    // Find pending registration by verification code
    let pendingRegistration = null;
    console.log('🔍 DEBUG: Looking for pending registration with code:', code);
    console.log('🔍 DEBUG: Number of pending registrations:', pendingRegistrations.size);
    
    for (const [key, reg] of pendingRegistrations.entries()) {
      console.log('🔍 DEBUG: Checking pending registration:', reg.email, 'with code:', reg.verificationCode);
      if (reg.verificationCode === code) {
        pendingRegistration = reg;
        console.log('🔍 DEBUG: Found pending registration!');
        break;
      }
    }
    
    if (!pendingRegistration) {
      console.log('🔍 DEBUG: No pending registration found with code:', code);
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid verification code'
        }
      });
    }

    if (pendingRegistration) {
      // Handle pending registration verification
      console.log('🔍 DEBUG: Verifying pending registration');
      console.log('🔍 DEBUG: Expected code:', pendingRegistration.verificationCode);
      console.log('🔍 DEBUG: Received code:', code);
      console.log('🔍 DEBUG: Codes match:', pendingRegistration.verificationCode === code);
      
      if (pendingRegistration.verificationCode !== code) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid verification code'
          }
        });
      }

      if (new Date() > new Date(pendingRegistration.expiresAt)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Verification code has expired. Please request a new one.'
          }
        });
      }

      // Create the user account now that verification is successful
      let result;
      try {
        result = await query(`
          INSERT INTO users (username, email, password_hash, first_name, last_name, year, major, hometown, university_id, is_verified, is_active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id, username, email, first_name, last_name, display_name, profile_picture, year, major, hometown, university_id, is_verified, is_active, created_at
        `, [
          pendingRegistration.username,
          pendingRegistration.email,
          pendingRegistration.passwordHash,
          pendingRegistration.firstName,
          pendingRegistration.lastName,
          pendingRegistration.year,
          pendingRegistration.major,
          pendingRegistration.hometown,
          pendingRegistration.universityId,
          true, // Verified
          true // Active
        ]);
      } catch (dbError) {
        // Handle duplicate key errors (in case user was created between registration and verification)
        if (dbError.code === '23505') {
          if (dbError.constraint === 'users_username_key') {
            return res.status(409).json({
              success: false,
              error: {
                message: 'Username already exists. Please choose a different username.'
              }
            });
          } else if (dbError.constraint === 'users_email_key') {
            return res.status(409).json({
              success: false,
              error: {
                message: 'Email already registered. Please sign in instead.'
              }
            });
          }
        }
        throw dbError;
      }

      const user = result.rows[0];

      // Remove the pending registration
      for (const [key, reg] of pendingRegistrations.entries()) {
        if (reg.verificationCode === code) {
          pendingRegistrations.delete(key);
          break;
        }
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
        message: 'Account verified and created successfully! You are now logged in.',
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
    }

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
    .isEmail().withMessage('Please provide a valid email address'),
  validate
], async (req, res) => {
  try {
    const { email } = req.body;

    // First, check if there's a pending registration for this email
    let pendingRegistration = null;
    for (const [key, reg] of pendingRegistrations.entries()) {
      if (reg.email === email) {
        pendingRegistration = reg;
        break;
      }
    }

    if (pendingRegistration) {
      // Generate new 6-digit verification code for pending registration
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Update the pending registration with new code
      pendingRegistration.verificationCode = verificationCode;
      pendingRegistration.expiresAt = expiresAt;
      
      // Send new verification code email
      const emailSent = await sendVerificationCode(pendingRegistration.email, pendingRegistration.firstName, verificationCode);

      if (!emailSent) {
        console.log('⚠️  RESEND FAILED: Email service failed, providing helpful error message');
        return res.status(500).json({
          success: false,
          error: {
            message: 'Failed to send verification email. Please check your email address and try again. If the problem persists, please contact support.'
          }
        });
      }

      res.json({
        success: true,
        message: 'New verification code sent successfully. Please check your email.',
        data: {
          email: email
        }
      });
    } else {
      // Check for existing user with verification code (legacy flow)
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
    }

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

// @route   POST /api/v1/auth/admin/clear-pending
// @desc    Clear all pending registrations (admin only)
// @access  Admin
router.post('/admin/clear-pending', async (req, res) => {
  try {
    // Simple admin check - only allow in development or with specific header
    if (process.env.NODE_ENV !== 'development' && req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const beforeCount = pendingRegistrations.size;
    pendingRegistrations.clear();
    
    console.log(`🧹 ADMIN: Cleared ${beforeCount} pending registrations`);
    
    res.json({
      success: true,
      message: `Cleared ${beforeCount} pending registrations`,
      data: {
        clearedCount: beforeCount,
        remainingCount: pendingRegistrations.size
      }
    });

  } catch (error) {
    console.error('Clear pending registrations error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to clear pending registrations. Please try again.'
      }
    });
  }
});

// @route   DELETE /api/v1/auth/admin/delete-user
// @desc    Delete a user by email (admin only, for testing)
// @access  Admin
router.delete('/admin/delete-user', async (req, res) => {
  try {
    // Simple admin check - only allow in development or with specific header
    if (process.env.NODE_ENV !== 'development' && req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email is required' }
      });
    }

    console.log(`🔍 ADMIN: Looking for user with email: ${email}`);
    
    // First, find the user
    const findUserQuery = `
      SELECT id, username, email, first_name, last_name, created_at
      FROM users 
      WHERE email = $1
    `;
    
    const userResult = await query(findUserQuery, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `No user found with email: ${email}` }
      });
    }
    
    const user = userResult.rows[0];
    console.log(`✅ ADMIN: Found user:`, {
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      created_at: user.created_at
    });
    
    // Delete the user (this will cascade delete related records)
    const deleteQuery = `
      DELETE FROM users 
      WHERE email = $1
      RETURNING id, username, email
    `;
    
    const deleteResult = await query(deleteQuery, [email]);
    
    if (deleteResult.rows.length > 0) {
      console.log(`🗑️ ADMIN: Successfully deleted user:`, deleteResult.rows[0]);
      
      res.json({
        success: true,
        message: `Successfully deleted user: ${email}`,
        data: {
          deletedUser: deleteResult.rows[0]
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: { message: `Failed to delete user with email: ${email}` }
      });
    }

  } catch (error) {
    console.error('❌ ADMIN: Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete user. Please try again.'
      }
    });
  }
});

// @route   GET /api/v1/auth/admin/pending-stats
// @desc    Get pending registration statistics (admin only)
// @access  Admin  
router.get('/admin/pending-stats', async (req, res) => {
  try {
    // Simple admin check
    if (process.env.NODE_ENV !== 'development' && req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied' }
      });
    }

    const now = new Date();
    const registrations = Array.from(pendingRegistrations.values());
    
    const stats = {
      total: registrations.length,
      byAge: {
        under1min: 0,
        under5min: 0,
        under15min: 0,
        over15min: 0
      },
      oldestAge: null,
      newestAge: null
    };

    registrations.forEach(reg => {
      const ageMs = now - new Date(reg.createdAt);
      const ageMin = ageMs / (1000 * 60);
      
      if (ageMin < 1) stats.byAge.under1min++;
      else if (ageMin < 5) stats.byAge.under5min++;
      else if (ageMin < 15) stats.byAge.under15min++;
      else stats.byAge.over15min++;
      
      if (!stats.oldestAge || ageMin > stats.oldestAge) stats.oldestAge = ageMin;
      if (!stats.newestAge || ageMin < stats.newestAge) stats.newestAge = ageMin;
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Pending stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get pending statistics' }
    });
  }
});

module.exports = router; 