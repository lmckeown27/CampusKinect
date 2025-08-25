# 🚀 Production Deployment Guide - Personalized Feed System

## Overview

This guide covers the complete deployment of the CampusConnect Personalized Feed System to production, including database setup, environment configuration, testing, and monitoring.

## 📋 Pre-Deployment Checklist

### **✅ Development Complete**
- [x] Personalized feed service implemented
- [x] Database schema created and tested
- [x] API endpoints integrated
- [x] Bookmark exclusion logic verified
- [x] Fresh content prioritization tested
- [x] Database integration validated

### **🔄 Production Setup Required**
- [ ] Production database setup
- [ ] Environment configuration
- [ ] Authentication middleware integration
- [ ] Performance testing
- [ ] Monitoring and logging
- [ ] User acceptance testing

## 🗄️ Database Setup

### **1. Production Database Creation**

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create production database
CREATE DATABASE campus_connect_prod;

# Create application user
CREATE USER campus_connect_user WITH PASSWORD 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE campus_connect_prod TO campus_connect_user;

# Connect to production database
\c campus_connect_prod

# Grant schema privileges
GRANT ALL ON SCHEMA public TO campus_connect_user;
```

### **2. Run Database Setup Script**

```bash
# Set production database URL
export DATABASE_URL="postgresql://campus_connect_user:secure_password_here@localhost:5432/campus_connect_prod"

# Run setup script
node setup-database.js
```

### **3. Verify Database Setup**

```bash
# Connect to production database
psql -d campus_connect_prod -U campus_connect_user

# Verify tables exist
\dt

# Verify indexes
\di

# Check sample data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM posts;
SELECT COUNT(*) FROM post_interactions;
```

## ⚙️ Environment Configuration

### **1. Production Environment File**

Create `.env.production` with the following configuration:

```bash
# Server Configuration
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL=postgresql://campus_connect_user:secure_password_here@localhost:5432/campus_connect_prod

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secure-production-jwt-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secure-production-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/campusconnect/app.log
```

### **2. Environment Variable Validation**

```bash
# Test environment configuration
node -e "
require('dotenv').config({ path: '.env.production' });
console.log('Database URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('JWT Secret:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');
console.log('Node Env:', process.env.NODE_ENV);
"
```

## 🔐 Authentication Integration

### **1. Verify Auth Middleware**

Ensure the personalized feed endpoint requires authentication:

```javascript
// In routes/posts.js
router.get('/personalized-feed', [
  auth, // Requires authentication
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  validate
], async (req, res) => {
  // req.user.id is guaranteed to exist due to auth middleware
  const userId = req.user.id;
  // ... rest of the endpoint logic
});
```

### **2. Test Authentication**

```bash
# Test without authentication (should fail)
curl -X GET "http://localhost:3000/api/v1/posts/personalized-feed"

# Test with valid JWT token
curl -X GET "http://localhost:3000/api/v1/posts/personalized-feed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Testing & Validation

### **1. Unit Tests**

```bash
# Run personalized feed service tests
npm test -- --grep "PersonalizedFeedService"

# Run API endpoint tests
npm test -- --grep "personalized-feed"
```

### **2. Integration Tests**

```bash
# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()').then(() => {
  console.log('✅ Database connection successful');
  pool.end();
}).catch(e => {
  console.error('❌ Database connection failed:', e.message);
  process.exit(1);
});
"

# Test personalized feed endpoint
curl -X GET "http://localhost:3000/api/v1/posts/personalized-feed" \
  -H "Authorization: Bearer VALID_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **3. Performance Tests**

```bash
# Test with different user loads
for i in {1..10}; do
  curl -s "http://localhost:3000/api/v1/posts/personalized-feed?userId=$i" \
    -H "Authorization: Bearer VALID_JWT_TOKEN" &
done
wait

# Monitor response times and database performance
```

## 📊 Monitoring & Logging

### **1. Application Logging**

```javascript
// In personalizedFeedService.js
const logger = require('../utils/logger');

const getPersonalizedFeed = async (userId, limit, offset, mainTab, subTab, options) => {
  try {
    logger.info('Personalized feed request', {
      userId,
      limit,
      offset,
      mainTab,
      subTab,
      timestamp: new Date().toISOString()
    });
    
    // ... existing logic ...
    
    logger.info('Personalized feed generated', {
      userId,
      postCount: personalizedPosts.length,
      bookmarkedExcluded: bookmarkedPostIds.length,
      freshContentBoosted: personalizedPosts.filter(p => p.freshContentBoost).length
    });
    
  } catch (error) {
    logger.error('Personalized feed error', {
      userId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};
```

### **2. Database Performance Monitoring**

```sql
-- Monitor query performance
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%post_interactions%'
ORDER BY total_time DESC;

-- Monitor table sizes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats 
WHERE tablename = 'post_interactions';
```

### **3. Health Check Endpoint**

```javascript
// Add to your main server
app.get('/health/personalized-feed', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    // Test personalized feed service
    const testFeed = await personalizedFeedService.getPersonalizedFeed(1, 1, 0);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      personalizedFeed: 'working',
      postCount: testFeed.posts.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});
```

## 🚀 Deployment Steps

### **1. Production Build**

```bash
# Install production dependencies
npm ci --only=production

# Build application (if using TypeScript/Babel)
npm run build

# Set production environment
export NODE_ENV=production
```

### **2. Process Management**

```bash
# Using PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'campusconnect',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### **3. Nginx Configuration**

```nginx
# /etc/nginx/sites-available/campusconnect
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/campusconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 Post-Deployment Verification

### **1. Functional Testing**

```bash
# Test bookmark exclusion
# 1. Create a test user
# 2. Bookmark a post
# 3. Verify post doesn't appear in personalized feed

# Test fresh content prioritization
# 1. Create posts with different interaction histories
# 2. Verify fresh content gets priority boost
# 3. Verify scoring calculations are correct
```

### **2. Performance Verification**

```bash
# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s "http://yourdomain.com/api/v1/posts/personalized-feed"

# Monitor database performance
# Check query execution plans
EXPLAIN ANALYZE SELECT ... FROM post_interactions ...;

# Monitor memory usage
pm2 monit
```

### **3. User Acceptance Testing**

- [ ] Test with real user accounts
- [ ] Verify bookmark functionality works correctly
- [ ] Confirm fresh content appears first
- [ ] Test pagination and filtering
- [ ] Verify error handling and edge cases

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Database Connection Errors**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection limits
sudo -u postgres psql -c "SHOW max_connections;"

# Check database exists
sudo -u postgres psql -l | grep campus_connect
```

#### **2. Performance Issues**
```bash
# Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
WHERE mean_time > 100 
ORDER BY mean_time DESC;

# Check table statistics
ANALYZE post_interactions;
ANALYZE posts;
```

#### **3. Memory Issues**
```bash
# Check Node.js memory usage
pm2 monit

# Check system memory
free -h
top

# Restart if necessary
pm2 restart campusconnect
```

## 📈 Scaling Considerations

### **1. Database Scaling**
- Consider read replicas for heavy read loads
- Implement connection pooling optimization
- Monitor query performance and add indexes as needed

### **2. Application Scaling**
- Use load balancers for multiple application instances
- Implement Redis caching for frequently accessed data
- Consider microservices architecture for future growth

### **3. Monitoring & Alerting**
- Set up alerts for high response times
- Monitor database connection pool usage
- Track personalized feed generation performance

## 🎯 Success Metrics

### **Key Performance Indicators**
- **Response Time**: Personalized feed loads in < 200ms
- **Throughput**: Handle 1000+ concurrent users
- **Accuracy**: 95%+ of bookmarked posts excluded
- **Fresh Content**: 80%+ of top posts are fresh content

### **User Experience Metrics**
- **Engagement**: Increased time spent on platform
- **Discovery**: Higher click-through rates on fresh content
- **Satisfaction**: Reduced user complaints about repetitive content

---

**The Personalized Feed System is now ready for production deployment. Follow this guide step-by-step to ensure a smooth transition and optimal performance.** 