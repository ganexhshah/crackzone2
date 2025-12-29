# 🔒 CrackZone Security Implementation Guide

## Overview
This document outlines the comprehensive security system implemented for the CrackZone gaming platform. The security system follows industry best practices and provides multi-layered protection against various threats.

## 🛡️ Security Layers Implemented

### 1. Network Security
- **HTTPS Enforcement**: Force HTTPS in production
- **HSTS Headers**: HTTP Strict Transport Security with preload
- **CORS Protection**: Configurable cross-origin resource sharing
- **IP Filtering**: Whitelist/blacklist functionality
- **Rate Limiting**: Multiple tiers of rate limiting

### 2. Authentication & Authorization
- **JWT Tokens**: Secure JSON Web Tokens with refresh mechanism
- **Password Security**: Bcrypt hashing with configurable salt rounds
- **Session Management**: Secure session handling with database storage
- **Brute Force Protection**: Progressive delays and account lockouts
- **Two-Factor Authentication**: TOTP-based 2FA support
- **Admin Authentication**: Separate admin authentication system

### 3. Input Validation & Sanitization
- **Request Sanitization**: XSS and SQL injection prevention
- **Input Validation**: Comprehensive validation rules using express-validator
- **File Upload Security**: Type checking, size limits, malware scanning
- **Data Sanitization**: DOMPurify for HTML content sanitization

### 4. Database Security
- **SQL Injection Prevention**: Parameterized queries and input sanitization
- **Query Monitoring**: Suspicious query pattern detection
- **Connection Security**: Secure connection pooling with timeouts
- **Data Encryption**: Sensitive data encryption at rest
- **Transaction Security**: Secure transaction handling with rollback

### 5. Security Monitoring & Logging
- **Real-time Monitoring**: Security event detection and alerting
- **Comprehensive Logging**: All security events logged with rotation
- **Threat Detection**: Pattern analysis for suspicious activities
- **IP Blocking**: Automatic blocking of malicious IPs
- **Security Dashboard**: Admin interface for security monitoring

## 📁 File Structure

```
backend/
├── middleware/
│   ├── security.js          # Security headers, CORS, rate limiting
│   ├── validation.js        # Input validation and sanitization
│   ├── auth.js             # Authentication and authorization
│   ├── database.js         # Database security wrapper
│   └── monitoring.js       # Security monitoring and logging
├── config/
│   └── security.js         # Security configuration management
├── scripts/
│   └── migrate-security-tables.js  # Database migration for security
└── logs/                   # Security logs directory
```

## 🔧 Configuration

### Environment Variables
Copy `.env.security.example` to your `.env` file and configure:

```bash
# Critical Security Settings
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-64-characters-long
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here-minimum-64-characters-long
ADMIN_PASSWORD=your-super-secure-admin-password-here
DB_ENCRYPTION_KEY=your-database-encryption-key-here-32-characters-minimum
SESSION_SECRET=your-session-secret-key-here-minimum-32-characters-long

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_AUTH_MAX=10

# CORS Security
CORS_ORIGIN=http://localhost:5174,https://your-domain.com

# Security Monitoring
SECURITY_WEBHOOK_URL=https://your-webhook-url-for-alerts.com
AUTO_BLOCK_THRESHOLD=100
```

### Database Setup
Run the security migration to create required tables:

```bash
cd backend
node scripts/migrate-security-tables.js
```

## 🚨 Security Features

### Rate Limiting Tiers
- **General API**: 1000 requests per 15 minutes
- **Authentication**: 10 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour
- **File Uploads**: 10 uploads per minute
- **Admin Endpoints**: 100 requests per 15 minutes

### Brute Force Protection
- **Max Attempts**: 5 failed login attempts
- **Lockout Duration**: 15 minutes (configurable)
- **Progressive Delays**: Exponential backoff for repeated attempts
- **IP-based Tracking**: Per-IP attempt tracking

### Content Security Policy
```javascript
{
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
  connectSrc: ["'self'", "https://api.cloudinary.com", "https://accounts.google.com"],
  frameSrc: ["'self'", "https://accounts.google.com"],
  objectSrc: ["'none'"]
}
```

### File Upload Security
- **Allowed Types**: JPEG, PNG, WebP images only
- **Size Limit**: 5MB maximum
- **Header Validation**: File type verification by header
- **Malware Scanning**: Basic file content validation

## 📊 Security Monitoring

### Security Dashboard
Access the security dashboard at `/api/security/dashboard` (admin only):
- Active alerts count
- Security events (24h/7d)
- Suspicious IP tracking
- Top threats analysis

### Security Alerts
Automatic alerts for:
- Brute force attacks
- SQL injection attempts
- XSS attempts
- DDoS attacks
- Port scanning
- High-risk IP activity

### Logging
Security events are logged to:
- Database: `security_logs` table
- Files: `backend/logs/security-YYYY-MM-DD.log`
- Webhooks: Configurable webhook notifications

## 🔐 API Security Endpoints

### Admin Security Endpoints
```javascript
GET /api/security/dashboard     # Security dashboard data
GET /api/security/alerts        # Active security alerts
POST /api/security/block-ip     # Block IP address
```

### Authentication Endpoints
```javascript
POST /api/auth/login           # User login with brute force protection
POST /api/auth/refresh         # Token refresh
POST /api/auth/logout          # Secure logout with token blacklisting
```

## 🛠️ Security Middleware Usage

### In Routes
```javascript
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { validationRules, handleValidationErrors } = require('../middleware/validation');
const { rateLimits } = require('../middleware/security');

// Protected user route
app.get('/api/user/profile', 
  rateLimits.general,
  authenticateToken,
  getUserProfile
);

// Admin route with validation
app.post('/api/admin/users',
  rateLimits.admin,
  authenticateAdmin,
  validationRules.createUser,
  handleValidationErrors,
  createUser
);
```

### Database Operations
```javascript
// Use secure database wrapper
app.use(secureDbMiddleware);

// In route handlers
const result = await req.db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## 🚀 Production Deployment

### SSL/TLS Configuration
```bash
# Set SSL certificate paths
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key
FORCE_HTTPS=true
```

### Security Headers
- **HSTS**: 1 year max-age with preload
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin

### Monitoring Setup
1. Configure webhook URL for alerts
2. Set up log rotation and retention
3. Monitor security dashboard regularly
4. Review blocked IPs and security events

## 🔍 Security Testing

### Recommended Tests
1. **Penetration Testing**: Regular security assessments
2. **Vulnerability Scanning**: Automated security scans
3. **Load Testing**: Rate limiting effectiveness
4. **Authentication Testing**: JWT token security
5. **Input Validation Testing**: XSS and SQL injection attempts

### Security Checklist
- [ ] All environment variables configured
- [ ] SSL certificates installed (production)
- [ ] Security tables migrated
- [ ] Rate limiting tested
- [ ] Authentication flows tested
- [ ] File upload restrictions tested
- [ ] Security monitoring active
- [ ] Backup and recovery tested

## 📞 Security Incident Response

### Immediate Actions
1. Check security dashboard for active threats
2. Review recent security logs
3. Block malicious IPs if necessary
4. Notify administrators via configured alerts
5. Document incident details

### Investigation Steps
1. Analyze security logs for patterns
2. Check affected user accounts
3. Review database for unauthorized changes
4. Verify system integrity
5. Update security measures if needed

## 🔄 Maintenance

### Regular Tasks
- Review security logs weekly
- Update blocked IP lists
- Rotate JWT secrets periodically
- Update security dependencies
- Monitor security alerts
- Test backup and recovery procedures

### Updates
- Keep security dependencies updated
- Review and update security policies
- Monitor security advisories
- Update rate limiting rules as needed
- Review and update CORS origins

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**⚠️ Important**: This security implementation provides comprehensive protection but should be regularly reviewed and updated. Consider professional security audits for production deployments.