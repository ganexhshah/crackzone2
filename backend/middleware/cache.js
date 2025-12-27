const { cache, cacheKeys, cacheTTL } = require('../config/redis');

// Generic cache middleware
const cacheMiddleware = (keyGenerator, ttl = cacheTTL.MEDIUM) => {
  return async (req, res, next) => {
    try {
      // Generate cache key based on request
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`Cache MISS: ${cacheKey}`);

      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Cache the response data
        cache.set(cacheKey, data, ttl).catch(err => {
          console.error('Failed to cache response:', err);
        });
        
        // Call original res.json
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// User-specific cache middleware
const userCacheMiddleware = (keyGenerator, ttl = cacheTTL.MEDIUM) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return next();
    }

    const cacheKey = typeof keyGenerator === 'function' 
      ? keyGenerator(req.user.id, req) 
      : `${keyGenerator}:${req.user.id}`;

    try {
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`User Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`User Cache MISS: ${cacheKey}`);

      const originalJson = res.json;
      
      res.json = function(data) {
        cache.set(cacheKey, data, ttl).catch(err => {
          console.error('Failed to cache user response:', err);
        });
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('User cache middleware error:', error);
      next();
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Invalidate cache patterns after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternsToInvalidate = typeof patterns === 'function' 
          ? patterns(req, data) 
          : patterns;

        patternsToInvalidate.forEach(pattern => {
          cache.delPattern(pattern).catch(err => {
            console.error('Failed to invalidate cache pattern:', pattern, err);
          });
        });
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};

// Specific cache middlewares for common endpoints
const dashboardCache = userCacheMiddleware(
  (userId) => cacheKeys.dashboardStats(userId),
  cacheTTL.SHORT
);

const tournamentsCache = cacheMiddleware(
  (req) => cacheKeys.tournaments(req.query.page, req.query.game),
  cacheTTL.MEDIUM
);

const leaderboardCache = cacheMiddleware(
  (req) => cacheKeys.leaderboard(req.query.game, req.query.page),
  cacheTTL.LONG
);

const userProfileCache = userCacheMiddleware(
  (userId) => cacheKeys.user(userId),
  cacheTTL.LONG
);

const notificationsCache = userCacheMiddleware(
  (userId) => cacheKeys.notifications(userId),
  cacheTTL.SHORT
);

const walletCache = userCacheMiddleware(
  (userId) => cacheKeys.walletBalance(userId),
  cacheTTL.SHORT
);

// Cache warming functions
const warmCache = {
  // Warm popular tournaments
  tournaments: async () => {
    try {
      console.log('Warming tournaments cache...');
      // This would typically fetch and cache popular tournaments
      // Implementation depends on your tournament fetching logic
    } catch (error) {
      console.error('Failed to warm tournaments cache:', error);
    }
  },

  // Warm leaderboard
  leaderboard: async () => {
    try {
      console.log('Warming leaderboard cache...');
      // This would typically fetch and cache leaderboard data
    } catch (error) {
      console.error('Failed to warm leaderboard cache:', error);
    }
  }
};

module.exports = {
  cacheMiddleware,
  userCacheMiddleware,
  invalidateCache,
  dashboardCache,
  tournamentsCache,
  leaderboardCache,
  userProfileCache,
  notificationsCache,
  walletCache,
  warmCache
};