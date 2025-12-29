const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { securityConfig } = require('../config/security');

// Security Headers Middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: securityConfig.csp.directives,
    reportOnly: securityConfig.csp.reportOnly
  },
  crossOriginEmbedderPolicy: false,
  hsts: securityConfig.hsts,
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = securityConfig.cors.origin;
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: securityConfig.cors.credentials,
  methods: securityConfig.cors.methods,
  allowedHeaders: securityConfig.cors.allowedHeaders,
  maxAge: 86400 // 24 hours
};

// Rate Limiting
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({ 
      error: message,
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
});

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(securityConfig.rateLimit.windowMs, securityConfig.rateLimit.general, 'Too many requests, please try again later'),
  
  // Authentication endpoints (stricter)
  auth: createRateLimit(securityConfig.rateLimit.windowMs, securityConfig.rateLimit.auth, 'Too many authentication attempts, please try again later'),
  
  // Password reset (very strict)
  passwordReset: createRateLimit(60 * 60 * 1000, securityConfig.rateLimit.passwordReset, 'Too many password reset attempts, please try again in an hour'),
  
  // File uploads
  upload: createRateLimit(60 * 1000, securityConfig.rateLimit.upload, 'Too many upload attempts, please try again later'),
  
  // Admin endpoints
  admin: createRateLimit(securityConfig.rateLimit.windowMs, securityConfig.rateLimit.admin, 'Too many admin requests, please try again later')
};

// IP Whitelist/Blacklist
const ipFilter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Blacklisted IPs (add suspicious IPs here)
  const blacklistedIPs = [
    // Add suspicious IPs here
  ];
  
  if (blacklistedIPs.includes(clientIP)) {
    console.warn(`Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
};

// Request sanitization
const sanitizeRequest = (req, res, next) => {
  // Remove potentially dangerous characters from query parameters
  for (let key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].replace(/[<>\"'%;()&+]/g, '');
    }
  }
  
  // Limit request size
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'Request too large' });
  }
  
  next();
};

module.exports = {
  securityHeaders,
  corsOptions,
  rateLimits,
  ipFilter,
  sanitizeRequest
};