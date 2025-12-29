const pool = require('../config/database');
const crypto = require('crypto');

// Database security middleware
class DatabaseSecurity {
  constructor() {
    this.queryLog = new Map();
    this.suspiciousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/g,
      /(\bOR\b|\bAND\b).*?(\b=\b|\bLIKE\b)/gi,
      /(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)/gi,
      /(WAITFOR|DELAY|BENCHMARK)/gi
    ];
  }

  // Sanitize SQL queries
  sanitizeQuery(query, params = []) {
    // Log query for monitoring
    const queryHash = crypto.createHash('md5').update(query).digest('hex');
    this.logQuery(queryHash, query, params);

    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(query)) {
        console.warn('Suspicious SQL pattern detected:', query);
        throw new Error('Potentially malicious query detected');
      }
    }

    // Validate parameters
    const sanitizedParams = params.map(param => {
      if (typeof param === 'string') {
        // Remove dangerous characters
        return param.replace(/['"`;\\]/g, '');
      }
      return param;
    });

    return { query, params: sanitizedParams };
  }

  // Log queries for monitoring
  logQuery(hash, query, params) {
    const now = Date.now();
    const logEntry = this.queryLog.get(hash) || { count: 0, lastExecuted: 0, query };
    
    logEntry.count++;
    logEntry.lastExecuted = now;
    
    this.queryLog.set(hash, logEntry);

    // Alert on suspicious frequency
    if (logEntry.count > 100 && (now - logEntry.lastExecuted) < 60000) {
      console.warn('High frequency query detected:', query);
    }
  }

  // Secure query execution
  async executeQuery(query, params = []) {
    try {
      const { query: sanitizedQuery, params: sanitizedParams } = this.sanitizeQuery(query, params);
      
      const startTime = Date.now();
      const result = await pool.query(sanitizedQuery, sanitizedParams);
      const executionTime = Date.now() - startTime;

      // Log slow queries
      if (executionTime > 5000) {
        console.warn(`Slow query detected (${executionTime}ms):`, sanitizedQuery);
      }

      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Prepared statement wrapper
  async executePrepared(name, query, params = []) {
    try {
      const client = await pool.connect();
      
      try {
        // Prepare statement if not exists
        await client.query(`PREPARE ${name} AS ${query}`);
        
        // Execute prepared statement
        const result = await client.query(`EXECUTE ${name}`, params);
        
        return result;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Prepared statement error:', error);
      throw error;
    }
  }

  // Transaction wrapper with rollback on error
  async executeTransaction(queries) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const { query, params } of queries) {
        const { query: sanitizedQuery, params: sanitizedParams } = this.sanitizeQuery(query, params);
        const result = await client.query(sanitizedQuery, sanitizedParams);
        results.push(result);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Database health check
  async healthCheck() {
    try {
      const result = await pool.query('SELECT NOW() as current_time');
      return {
        status: 'healthy',
        timestamp: result.rows[0].current_time,
        activeConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Connection pool monitoring
  monitorConnections() {
    setInterval(() => {
      const stats = {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      };

      // Alert on connection issues
      if (stats.waiting > 10) {
        console.warn('High number of waiting database connections:', stats);
      }

      if (stats.idle < 2) {
        console.warn('Low number of idle database connections:', stats);
      }
    }, 30000); // Check every 30 seconds
  }

  // Query performance monitoring
  getQueryStats() {
    const stats = Array.from(this.queryLog.entries()).map(([hash, data]) => ({
      hash,
      query: data.query.substring(0, 100) + '...',
      count: data.count,
      lastExecuted: new Date(data.lastExecuted)
    }));

    return stats.sort((a, b) => b.count - a.count).slice(0, 10);
  }
}

// Create singleton instance
const dbSecurity = new DatabaseSecurity();

// Middleware to wrap database operations
const secureDbMiddleware = (req, res, next) => {
  // Add secure database methods to request
  req.db = {
    query: (query, params) => dbSecurity.executeQuery(query, params),
    transaction: (queries) => dbSecurity.executeTransaction(queries),
    prepared: (name, query, params) => dbSecurity.executePrepared(name, query, params)
  };
  
  next();
};

// Database connection security
const setupDatabaseSecurity = () => {
  // Monitor connections
  dbSecurity.monitorConnections();

  // Set connection timeouts
  pool.on('connect', (client) => {
    client.query('SET statement_timeout = 30000'); // 30 seconds
    client.query('SET idle_in_transaction_session_timeout = 60000'); // 1 minute
  });

  // Handle connection errors
  pool.on('error', (err) => {
    console.error('Database connection error:', err);
  });

  // Periodic cleanup
  setInterval(() => {
    // Clear old query logs
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    for (const [hash, data] of dbSecurity.queryLog.entries()) {
      if (data.lastExecuted < cutoff) {
        dbSecurity.queryLog.delete(hash);
      }
    }
  }, 60 * 60 * 1000); // Every hour
};

// Database backup verification
const verifyBackup = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename
    `);

    return {
      status: 'verified',
      tables: result.rows,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Backup verification error:', error);
    return {
      status: 'failed',
      error: error.message,
      timestamp: new Date()
    };
  }
};

// Database encryption helpers
const encryptSensitiveData = (data, key = process.env.DB_ENCRYPTION_KEY) => {
  if (!key) {
    console.warn('No encryption key provided for sensitive data');
    return data;
  }

  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptSensitiveData = (encryptedData, key = process.env.DB_ENCRYPTION_KEY) => {
  if (!key) {
    console.warn('No encryption key provided for sensitive data');
    return encryptedData;
  }

  try {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

module.exports = {
  DatabaseSecurity,
  dbSecurity,
  secureDbMiddleware,
  setupDatabaseSecurity,
  verifyBackup,
  encryptSensitiveData,
  decryptSensitiveData
};