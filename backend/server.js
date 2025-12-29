require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');

// Import configurations
const pool = require('./config/database');
const { initializeSecurity } = require('./config/security');
const performanceMonitor = require('./scripts/performance-monitor');

// Import security middleware
const { 
  securityHeaders, 
  corsOptions, 
  rateLimits, 
  ipFilter, 
  sanitizeRequest 
} = require('./middleware/security');
const { 
  sanitizeRequestData, 
  handleValidationErrors 
} = require('./middleware/validation');
const { 
  authenticateToken, 
  authenticateAdmin 
} = require('./middleware/auth');
const { 
  secureDbMiddleware, 
  setupDatabaseSecurity 
} = require('./middleware/database');
const { 
  securityLoggingMiddleware, 
  ipBlockingMiddleware,
  securityMonitor 
} = require('./middleware/monitoring');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tournamentRoutes = require('./routes/tournaments');
const teamRoutes = require('./routes/teams');
const walletRoutes = require('./routes/wallet');
const profileRoutes = require('./routes/profile');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const rewardsRoutes = require('./routes/rewards');
const adminRoutes = require('./routes/admin');
const uploadsRoutes = require('./routes/uploads');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP addresses behind load balancers
app.set('trust proxy', 1);

// Initialize database security
setupDatabaseSecurity();

// IP blocking middleware (first line of defense)
app.use(ipBlockingMiddleware);

// Security logging middleware
app.use(securityLoggingMiddleware);

// Performance monitoring middleware
app.use(performanceMonitor.trackRequest());

// Enhanced security headers
app.use(securityHeaders);

// Request sanitization
app.use(sanitizeRequest);
app.use(sanitizeRequestData);

// IP filtering
app.use(ipFilter);

// Compression middleware for better performance
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Logging middleware
app.use(morgan('combined', {
  skip: (req, res) => res.statusCode < 400
}));

// Enhanced CORS configuration
app.use(cors(corsOptions));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parsing middleware with size limits and security
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Secure database middleware
app.use(secureDbMiddleware);

// Health check endpoint (no rate limiting)
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes with rate limiting
app.use('/api/auth', rateLimits.auth, authRoutes);
app.use('/api/users', rateLimits.general, userRoutes);
app.use('/api/tournaments', rateLimits.general, tournamentRoutes);
app.use('/api/teams', rateLimits.general, teamRoutes);
app.use('/api/wallet', rateLimits.general, walletRoutes);
app.use('/api/profile', rateLimits.general, profileRoutes);
app.use('/api/dashboard', rateLimits.general, dashboardRoutes);
app.use('/api/notifications', rateLimits.general, notificationRoutes);
app.use('/api/rewards', rateLimits.general, rewardsRoutes);
app.use('/api/admin', rateLimits.admin, adminRoutes);
app.use('/api/uploads', rateLimits.upload, uploadsRoutes);
app.use('/api/leaderboard', rateLimits.general, leaderboardRoutes);

// Security dashboard endpoint (admin only)
app.get('/api/security/dashboard', authenticateAdmin, (req, res) => {
  const dashboard = securityMonitor.getSecurityDashboard();
  res.json(dashboard);
});

// Security alerts endpoint (admin only)
app.get('/api/security/alerts', authenticateAdmin, (req, res) => {
  const alerts = securityMonitor.alerts.filter(alert => alert.status === 'active');
  res.json(alerts);
});

// Block IP endpoint (admin only)
app.post('/api/security/block-ip', authenticateAdmin, async (req, res) => {
  const { ip, reason } = req.body;
  
  if (!ip || !reason) {
    return res.status(400).json({ error: 'IP address and reason are required' });
  }
  
  await securityMonitor.blockIP(ip, reason);
  res.json({ message: `IP ${ip} has been blocked` });
});

// Performance monitoring endpoints
app.get('/api/performance/metrics', authenticateAdmin, (req, res) => {
  const metrics = performanceMonitor.getMetrics();
  res.json(metrics);
});

app.get('/api/performance/report', authenticateAdmin, (req, res) => {
  const report = performanceMonitor.generateReport();
  res.json(report);
});

// Error handling middleware with security logging
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Log security-related errors
  if (err.status === 401 || err.status === 403 || err.status === 429) {
    securityMonitor.logSecurityEvent({
      type: 'security_error',
      severity: 'medium',
      message: err.message,
      source: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      },
      details: {
        path: req.path,
        method: req.method,
        statusCode: err.status
      }
    });
  }
  
  // Rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Too many requests',
      message: err.message,
      retryAfter: err.retryAfter
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }
  
  // Database errors
  if (err.code && err.code.startsWith('23')) {
    return res.status(409).json({
      error: 'Database constraint violation',
      message: 'The operation conflicts with existing data'
    });
  }
  
  // Security errors
  if (err.message.includes('malicious') || err.message.includes('suspicious')) {
    return res.status(403).json({
      error: 'Security violation detected',
      message: 'Request blocked for security reasons'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize server
const initializeServer = async () => {
  try {
    // Initialize security configuration
    initializeSecurity();
    
    // Start performance monitoring
    performanceMonitor.startMonitoring();
    
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection verified');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error);
    process.exit(1);
  }
};

// Start server
const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5174'}`);
  console.log('🗄️  Using PostgreSQL database');
  
  await initializeServer();
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await pool.end();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
    
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app;