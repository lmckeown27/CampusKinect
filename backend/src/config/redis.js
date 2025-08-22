const redis = require('redis');

let client;

const connectRedis = async () => {
  try {
    client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 10000,
        lazyConnect: true
      }
    });

    client.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    client.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    client.on('end', () => {
      console.log('🔌 Redis client disconnected');
    });

    await client.connect();
    
    // Test the connection
    await client.ping();
    console.log('✅ Redis connection test successful');
    
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Don't exit process, Redis is optional for development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Helper functions for Redis operations
const redisGet = async (key) => {
  try {
    if (!client || !client.isReady) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

const redisSet = async (key, value, expireSeconds = 3600) => {
  try {
    if (!client || !client.isReady) return false;
    await client.setEx(key, expireSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis SET error:', error);
    return false;
  }
};

const redisDel = async (key) => {
  try {
    if (!client || !client.isReady) return false;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis DEL error:', error);
    return false;
  }
};

const redisExists = async (key) => {
  try {
    if (!client || !client.isReady) return false;
    const result = await client.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis EXISTS error:', error);
    return false;
  }
};

const redisIncr = async (key) => {
  try {
    if (!client || !client.isReady) return null;
    return await client.incr(key);
  } catch (error) {
    console.error('Redis INCR error:', error);
    return null;
  }
};

const redisExpire = async (key, seconds) => {
  try {
    if (!client || !client.isReady) return false;
    return await client.expire(key, seconds);
  } catch (error) {
    console.error('Redis EXPIRE error:', error);
    return false;
  }
};

// Cache keys for different data types
const CACHE_KEYS = {
  USER: 'user',
  POST: 'post',
  UNIVERSITY: 'university',
  CLUSTER: 'cluster',
  SEARCH: 'search',
  SESSION: 'session'
};

// Generate cache keys
const generateCacheKey = (type, identifier) => {
  return `${CACHE_KEYS[type.toUpperCase()]}:${identifier}`;
};

// Cache TTL values (in seconds)
const CACHE_TTL = {
  USER: 3600,        // 1 hour
  POST: 1800,        // 30 minutes
  UNIVERSITY: 86400,  // 24 hours
  CLUSTER: 86400,    // 24 hours
  SEARCH: 900,       // 15 minutes
  SESSION: 7200      // 2 hours
};

module.exports = {
  connectRedis,
  redisGet,
  redisSet,
  redisDel,
  redisExists,
  redisIncr,
  redisExpire,
  generateCacheKey,
  CACHE_TTL,
  client: () => client
}; 