const rateLimit = require('express-rate-limit');
const { cache, cacheKeys } = require('../config/redis');

// Custom Redis store for rate limiting
class RedisStore {
  constructor(options = {}) {
    this.prefix = options.prefix || 'rate_limit:';
    this.resetTime = options.resetTime || 60000; // 1 minute default
  }

  async increment(key) {
    try {
      const fullKey = this.prefix + key;
      const current = await cache.incr(fullKey, Math.ceil(this.resetTime / 1000));
      
      return {
        totalHits: current,
        resetTime: new Date(Date.now() + this.resetTime)
      };
    } catch (error) {
      console.error('Rate limit store error:', error);
      // Fallback to allow request if Redis fails
      return {
        totalHits: 1,
        resetTime: new Date(Date.now() + this.resetTime)
      };
    }
  }

  async decrement(key) {
    // Optional: implement if you need to decrement on successful requests
  }

  async resetKey(key) {
    try {
      await cache.del(this.prefix + key);
    } catch (error) {
      console.error('Rate limit reset error:', error);
    }
  }
}

// Different rate limiters for different endpoints
const createRateLimiter = (options) => {
  return rateLimit({
    store: new RedisStore({
      prefix: options.prefix || 'rate_limit:',
      resetTime: options.windowMs || 60000
    }),
    windowMs: options.windowMs || 60000, // 1 minute
    max: options.max || 100,
    message: options.message || {
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000) || 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => {
      return req.user?.id || req.ip;
    }),
    skip: options.skip || (() => false),
    onLimitReached: (req, res, options) => {
      console.log(`Rate limit exceeded for ${req.user?.id || req.ip} on ${req.path}`);
    }
  });
};

// Authentication rate limiter (stricter)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  prefix: 'auth_limit:',
  keyGenerator: (req) => req.ip,
  message: {
    error: 'Too many authentication attempts, please try again in 15 minutes.',
    retryAfter: 900
  }
});

// API rate limiter (general)
const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per user
  prefix: 'api_limit:',
  message: {
    error: 'Too many API requests, please slow down.',
    retryAfter: 60
  }
});

// Strict API limiter for expensive operations
const strictApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per user
  prefix: 'strict_api_limit:',
  message: {
    error: 'Rate limit exceeded for this operation.',
    retryAfter: 60
  }
});

// Upload rate limiter
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  prefix: 'upload_limit:',
  message: {
    error: 'Too many upload attempts, please wait before uploading again.',
    retryAfter: 60
  }
});

// Tournament registration limiter
const tournamentLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 tournament operations per 5 minutes
  prefix: 'tournament_limit:',
  message: {
    error: 'Too many tournament operations, please wait.',
    retryAfter: 300
  }
});

// Wallet operation limiter
const walletLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 wallet operations per minute
  prefix: 'wallet_limit:',
  message: {
    error: 'Too many wallet operations, please wait.',
    retryAfter: 60
  }
});

// Admin operation limiter
const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Higher limit for admin operations
  prefix: 'admin_limit:',
  keyGenerator: (req) => req.admin?.id || req.ip,
  message: {
    error: 'Admin rate limit exceeded.',
    retryAfter: 60
  }
});

// Dynamic rate limiter based on user tier
const dynamicLimiter = (req, res, next) => {
  // You can implement different limits based on user subscription, etc.
  const userTier = req.user?.tier || 'free';
  
  let maxRequests;
  switch (userTier) {
    case 'premium':
      maxRequests = 200;
      break;
    case 'pro':
      maxRequests = 500;
      break;
    default:
      maxRequests = 100;
  }

  const limiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: maxRequests,
    prefix: `dynamic_limit_${userTier}:`,
  });

  return limiter(req, res, next);
};

// IP-based rate limiter for public endpoints
const publicLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 requests per minute per IP
  prefix: 'public_limit:',
  keyGenerator: (req) => req.ip,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  }
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictApiLimiter,
  uploadLimiter,
  tournamentLimiter,
  walletLimiter,
  adminLimiter,
  dynamicLimiter,
  publicLimiter,
  createRateLimiter
};