const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config();
}

const { initializeDatabase, pool } = require('./config/database');
const { connectRedis, client: getRedisClient } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/upload');
const reviewRoutes = require('./routes/reviews');
const gradingRoutes = require('./routes/grading');
const reshuffleRoutes = require('./routes/reshuffle');
const marketSizeRoutes = require('./routes/marketSize');
const notificationsRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const userBlockingRoutes = require('./routes/userBlocking');
const adminRoutes = require('./routes/admin');// Optional mobile routes - only load if dependencies are available
let mobileRoutes;
try {
  mobileRoutes = require('./routes/mobile');
  console.log('📱 Mobile routes loaded successfully');
} catch (error) {
  console.log('📱 Mobile routes disabled - dependencies not available');
  mobileRoutes = null;
}
const { UNIVERSITY_CONFIG } = require('./config/university');
const { initializeCronJobs } = require('./services/cronService');

const app = express();
app.set('trust proxy', true);
const server = createServer(app);

// CORS configuration with multiple allowed origins
const allowedOrigins = [
  'http://localhost:3000',

  'https://campuskinect.net',
  'https://www.campuskinect.net',
  'https://api.campuskinect.net'
];

// Socket.io setup
const io = new Server(server, {
  path: '/socket.io/',
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn('🚫 Socket.io CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Socket.io: User connected:', socket.id);
  console.log('   Transport:', socket.conn.transport.name);
  console.log('   Remote address:', socket.handshake.address);
  
  // Join user to their university room
  socket.on('join-university', (universityId) => {
    socket.join(`university-${universityId}`);
    console.log(`📚 Socket.io: User ${socket.id} joined university room: ${universityId}`);
  });
  
  // Join user to their personal room for direct messages
  socket.on('join-personal', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`📬 Socket.io: User ${socket.id} joined personal room: user-${userId}`);
    // Emit confirmation back to client
    socket.emit('joined-personal', { userId, socketId: socket.id });
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket.io: User disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket.io: Socket error for', socket.id, ':', error);
  });
});

// Handle Socket.io errors at the server level
io.on('error', (error) => {
  console.error('🔴 Socket.io Server Error:', error);
});

// Log when Socket.io is ready
console.log('✅ Socket.io server initialized on path: /socket.io/');
console.log('   Allowed origins:', allowedOrigins);
console.log('   Transports:', ['polling', 'websocket']);

// Make io available to routes BEFORE routes are loaded
app.set('io', io);
console.log('✅ Socket.io instance attached to app for route access');

// Connect to databases
initializeDatabase();
connectRedis();

// Initialize cron jobs for recurring posts
initializeCronJobs();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000, // 10 minutes (updated default)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 750, // Updated default for campus networks
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP address. Please wait a few minutes before trying again.',
      details: 'This limit helps protect the server and ensures fair usage for all users.'
    }
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  trustProxy: true // Allow rate limiting to work behind proxy
});

// Middleware
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(compression());
app.use(limiter);
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Manual trigger for recurring post processing (development only)
if (process.env.NODE_ENV === 'development') {
  app.post('/trigger-recurring-posts', async (req, res) => {
    try {
      const { triggerRecurringPostProcessing } = require('./services/cronService');
      const result = await triggerRecurringPostProcessing();
      
      res.json({
        success: true,
        message: 'Recurring post processing triggered manually',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to trigger recurring post processing',
          details: error.message
        }
      });
    }
  });
}

// API routes
app.use(`/api/${process.env.API_VERSION || 'v1'}/auth`, authRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/users`, userRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/posts`, postRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/messages`, messageRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/search`, searchRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/upload`, uploadRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/reviews`, reviewRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/grading`, gradingRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/reshuffle`, reshuffleRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/market-size`, marketSizeRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/notifications`, notificationsRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/reports`, reportsRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/users`, userBlockingRoutes);
app.use(`/api/${process.env.API_VERSION || 'v1'}/admin`, adminRoutes);// Only register mobile routes if they loaded successfully
if (mobileRoutes) {
  app.use(`/api/${process.env.API_VERSION || 'v1'}/mobile`, mobileRoutes);
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server with PM2 compatibility
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Version: ${process.env.API_VERSION || 'v1'}`);
  console.log(`🏛️ Currently accepting: All valid .edu domains (Cal Poly SLO restriction removed)`);
  console.log(`🔧 Multi-university architecture ready for future expansion`);
  
  // Signal PM2 that the app is ready
  if (process.send) {
    process.send('ready');
  }
});

// Handle port conflicts gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('💡 This usually means another instance is running.');
    console.error('💡 Use: pm2 list (to see running processes)');
    console.error('💡 Use: pm2 stop campusconnect (to stop the app)');
    console.error('💡 Use: pm2 delete campusconnect (to remove the app)');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown for PM2
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  gracefulShutdown();
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  gracefulShutdown();
});

// Graceful shutdown function
function gracefulShutdown() {
  console.log('🔄 Closing HTTP server...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connections
    console.log('🔄 Closing database connections...');
    pool.end().then(() => {
      console.log('✅ Database connections closed');
      
      // Close Redis connections
      console.log('🔄 Closing Redis connections...');
      const redisClient = getRedisClient();
      if (redisClient && typeof redisClient.quit === 'function') {
        redisClient.quit().then(() => {
          console.log('✅ Redis connections closed');
          console.log('✅ Graceful shutdown complete');
          process.exit(0);
        }).catch((error) => {
          console.error('❌ Error closing Redis:', error);
          process.exit(1);
        });
      } else {
        console.log('✅ No Redis connection to close');
        console.log('✅ Graceful shutdown complete');
        process.exit(0);
      }
    }).catch((error) => {
      console.error('❌ Error closing database:', error);
      process.exit(1);
    });
  });
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000); // 10 second timeout
}

module.exports = { app, server, io }; 

