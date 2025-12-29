const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');
const { securityConfig } = require('../config/security');

// JWT Configuration
const JWT_SECRET = securityConfig.jwt.secret;
const JWT_REFRESH_SECRET = securityConfig.jwt.refreshSecret;
const JWT_EXPIRES_IN = securityConfig.jwt.expiresIn;
const JWT_REFRESH_EXPIRES_IN = securityConfig.jwt.refreshExpiresIn;

// Token blacklist (in production, use Redis)
const tokenBlacklist = new Set();

// Generate secure tokens
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN
  });
  
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { 
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });
  
  return { accessToken, refreshToken };
};

// Verify JWT token
const verifyToken = (token, secret = JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    const decoded = verifyToken(token);
    
    // Check if user still exists and is active
    const userResult = await pool.query(
      'SELECT id, username, email, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Admin access token required' });
    }

    const decoded = verifyToken(token);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Additional admin verification
    const adminUsername = securityConfig.admin.username;
    if (decoded.username !== adminUsername) {
      return res.status(403).json({ error: 'Invalid admin credentials' });
    }

    req.admin = {
      username: decoded.username,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(403).json({ error: 'Invalid admin token' });
  }
};

// Password security functions
const hashPassword = async (password) => {
  const saltRounds = securityConfig.password.saltRounds;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Session management
const createSession = async (userId, userAgent, ipAddress) => {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await pool.query(`
      INSERT INTO user_sessions (id, user_id, user_agent, ip_address, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, user_agent, ip_address) 
      DO UPDATE SET expires_at = $5, created_at = CURRENT_TIMESTAMP
    `, [sessionId, userId, userAgent, ipAddress, expiresAt]);

    return sessionId;
  } catch (error) {
    console.error('Session creation error:', error);
    return null;
  }
};

const validateSession = async (sessionId, userId) => {
  try {
    const result = await pool.query(`
      SELECT * FROM user_sessions 
      WHERE id = $1 AND user_id = $2 AND expires_at > CURRENT_TIMESTAMP
    `, [sessionId, userId]);

    return result.rows.length > 0;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

const revokeSession = async (sessionId) => {
  try {
    await pool.query('DELETE FROM user_sessions WHERE id = $1', [sessionId]);
    return true;
  } catch (error) {
    console.error('Session revocation error:', error);
    return false;
  }
};

// Brute force protection
const loginAttempts = new Map();

const checkBruteForce = (req, res, next) => {
  const identifier = req.ip + ':' + (req.body.email || req.body.username || '');
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  const now = Date.now();
  const timeDiff = now - attempts.lastAttempt;
  
  // Reset attempts after 15 minutes
  if (timeDiff > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  // Block after 5 failed attempts
  if (attempts.count >= securityConfig.bruteForce.maxAttempts) {
    const baseWaitTime = securityConfig.bruteForce.lockoutDuration * 60 * 1000; // Convert to ms
    const waitTime = securityConfig.bruteForce.progressiveDelay 
      ? Math.min(Math.pow(2, attempts.count - securityConfig.bruteForce.maxAttempts) * baseWaitTime, 60 * 60 * 1000) // Max 1 hour
      : baseWaitTime;
      
    if (timeDiff < waitTime) {
      return res.status(429).json({ 
        error: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((waitTime - timeDiff) / 1000)
      });
    }
  }
  
  req.loginAttempts = attempts;
  req.loginIdentifier = identifier;
  next();
};

const recordLoginAttempt = (identifier, success) => {
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  if (success) {
    loginAttempts.delete(identifier);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(identifier, attempts);
  }
};

// Token refresh middleware
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken, JWT_REFRESH_SECRET);
    
    // Verify user still exists and is active
    const userResult = await pool.query(
      'SELECT id, username, email, is_active, is_banned FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || !userResult.rows[0].is_active || userResult.rows[0].is_banned) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = userResult.rows[0];
    const tokens = generateTokens({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// Logout and token revocation
const logout = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    tokenBlacklist.add(token);
  }
  
  res.json({ message: 'Logged out successfully' });
};

// Two-factor authentication setup
const generateTOTPSecret = () => {
  return crypto.randomBytes(20).toString('base32');
};

const verifyTOTP = (token, secret) => {
  // Implementation would use a library like 'speakeasy'
  // This is a placeholder for TOTP verification
  return true; // Placeholder
};

module.exports = {
  generateTokens,
  verifyToken,
  authenticateToken,
  authenticateAdmin,
  hashPassword,
  verifyPassword,
  createSession,
  validateSession,
  revokeSession,
  checkBruteForce,
  recordLoginAttempt,
  refreshToken,
  logout,
  generateTOTPSecret,
  verifyTOTP,
  tokenBlacklist
};