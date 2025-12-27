const redis = require('redis');

// Redis configuration for high-scale caching
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  
  // Connection pool settings
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 5000,
  
  // Performance settings
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
const client = redis.createClient(redisConfig);

// Error handling
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('ready', () => {
  console.log('Redis client ready');
});

client.on('end', () => {
  console.log('Redis connection ended');
});

// Connect to Redis
const connectRedis = async () => {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    return true;
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    return false;
  }
};

// Cache helper functions
const cache = {
  // Get value from cache
  get: async (key) => {
    try {
      if (!client.isOpen) await connectRedis();
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Set value in cache with TTL
  set: async (key, value, ttl = 3600) => {
    try {
      if (!client.isOpen) await connectRedis();
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Delete key from cache
  del: async (key) => {
    try {
      if (!client.isOpen) await connectRedis();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Delete multiple keys
  delPattern: async (pattern) => {
    try {
      if (!client.isOpen) await connectRedis();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return false;
    }
  },

  // Check if key exists
  exists: async (key) => {
    try {
      if (!client.isOpen) await connectRedis();
      return await client.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Increment counter
  incr: async (key, ttl = 3600) => {
    try {
      if (!client.isOpen) await connectRedis();
      const value = await client.incr(key);
      if (value === 1) {
        await client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      console.error('Cache increment error:', error);
      return 0;
    }
  },

  // Set with expiration
  setex: async (key, ttl, value) => {
    try {
      if (!client.isOpen) await connectRedis();
      await client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache setex error:', error);
      return false;
    }
  }
};

// Cache key generators
const cacheKeys = {
  user: (userId) => `user:${userId}`,
  userStats: (userId) => `user_stats:${userId}`,
  tournament: (tournamentId) => `tournament:${tournamentId}`,
  tournaments: (page = 1, game = 'all') => `tournaments:${game}:page:${page}`,
  leaderboard: (game = 'all', page = 1) => `leaderboard:${game}:page:${page}`,
  userTournaments: (userId) => `user_tournaments:${userId}`,
  dashboardStats: (userId) => `dashboard_stats:${userId}`,
  notifications: (userId) => `notifications:${userId}`,
  walletBalance: (userId) => `wallet_balance:${userId}`,
  teamMembers: (teamId) => `team_members:${teamId}`,
  userTeams: (userId) => `user_teams:${userId}`,
  gameProfiles: (userId) => `game_profiles:${userId}`,
  rateLimitAuth: (ip) => `rate_limit_auth:${ip}`,
  rateLimitAPI: (userId) => `rate_limit_api:${userId}`,
};

// Cache TTL constants (in seconds)
const cacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing Redis connection...');
  if (client.isOpen) {
    await client.quit();
  }
});

process.on('SIGTERM', async () => {
  console.log('Closing Redis connection...');
  if (client.isOpen) {
    await client.quit();
  }
});

module.exports = {
  client,
  cache,
  cacheKeys,
  cacheTTL,
  connectRedis
};