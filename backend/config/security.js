require('dotenv').config();

// Security configuration with defaults
const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex'),
    refreshSecret: process.env.JWT_REFRESH_SECRET || require('crypto').randomBytes(64).toString('hex'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: 'crackzone-api',
    audience: 'crackzone-client'
  },

  // Database Security
  database: {
    encryptionKey: process.env.DB_ENCRYPTION_KEY,
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000,
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 60000,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    general: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    auth: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 10,
    upload: parseInt(process.env.RATE_LIMIT_UPLOAD_MAX) || 10,
    admin: parseInt(process.env.RATE_LIMIT_ADMIN_MAX) || 100,
    passwordReset: 3 // per hour
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Security Monitoring
  monitoring: {
    webhookUrl: process.env.SECURITY_WEBHOOK_URL,
    emailAlerts: process.env.SECURITY_EMAIL_ALERTS,
    logLevel: process.env.SECURITY_LOG_LEVEL || 'info',
    autoBlockThreshold: parseInt(process.env.AUTO_BLOCK_THRESHOLD) || 100,
    blockDurationHours: parseInt(process.env.BLOCK_DURATION_HOURS) || 24
  },

  // File Upload Security
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES ? 
      process.env.ALLOWED_FILE_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'image/webp'],
    scanForMalware: true
  },

  // Password Security
  password: {
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSymbols: process.env.PASSWORD_REQUIRE_SYMBOLS !== 'false',
    saltRounds: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 12
  },

  // Brute Force Protection
  bruteForce: {
    maxAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 15,
    progressiveDelay: process.env.PROGRESSIVE_DELAY !== 'false'
  },

  // Two-Factor Authentication
  twoFactor: {
    issuer: process.env.TOTP_ISSUER || 'CrackZone',
    window: parseInt(process.env.TOTP_WINDOW) || 2
  },

  // Logging Configuration
  logging: {
    retentionDays: parseInt(process.env.LOG_RETENTION_DAYS) || 30,
    maxSizeMB: parseInt(process.env.LOG_MAX_SIZE_MB) || 10,
    maxFiles: parseInt(process.env.LOG_MAX_FILES) || 10
  },

  // SSL/TLS Configuration
  ssl: {
    certPath: process.env.SSL_CERT_PATH,
    keyPath: process.env.SSL_KEY_PATH,
    forceHttps: process.env.FORCE_HTTPS === 'true'
  },

  // Content Security Policy
  csp: {
    reportUri: process.env.CSP_REPORT_URI,
    reportOnly: process.env.CSP_REPORT_ONLY === 'true',
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      connectSrc: ["'self'", "https://api.cloudinary.com", "https://accounts.google.com"],
      frameSrc: ["'self'", "https://accounts.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },

  // HSTS Configuration
  hsts: {
    maxAge: parseInt(process.env.HSTS_MAX_AGE) || 31536000, // 1 year
    includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
    preload: process.env.HSTS_PRELOAD !== 'false'
  },

  // API Security
  api: {
    keyExpiryDays: parseInt(process.env.API_KEY_EXPIRY_DAYS) || 90,
    rateLimitPerKey: parseInt(process.env.API_RATE_LIMIT_PER_KEY) || 10000
  },

  // Admin Configuration
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD // Should be set in environment
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: process.env.NODE_ENV === 'production'
  }
};

// Validation function to check if all required security configs are set
const validateSecurityConfig = () => {
  const warnings = [];
  const errors = [];

  // Check critical security settings
  if (!process.env.JWT_SECRET) {
    warnings.push('JWT_SECRET not set - using generated secret (will invalidate tokens on restart)');
  }

  if (!process.env.SESSION_SECRET) {
    warnings.push('SESSION_SECRET not set - using generated secret');
  }

  if (!process.env.ADMIN_PASSWORD) {
    errors.push('ADMIN_PASSWORD must be set for admin access');
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_ENCRYPTION_KEY) {
      warnings.push('DB_ENCRYPTION_KEY not set - sensitive data will not be encrypted');
    }

    if (!securityConfig.ssl.certPath || !securityConfig.ssl.keyPath) {
      warnings.push('SSL certificates not configured for production');
    }

    if (securityConfig.cors.origin.includes('localhost')) {
      warnings.push('CORS origin includes localhost in production');
    }
  }

  return { warnings, errors };
};

// Initialize security configuration
const initializeSecurity = () => {
  const { warnings, errors } = validateSecurityConfig();

  if (errors.length > 0) {
    console.error('❌ Security Configuration Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Critical security configuration missing');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Security Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  console.log('🔒 Security configuration initialized');
  return securityConfig;
};

module.exports = {
  securityConfig,
  validateSecurityConfig,
  initializeSecurity
};