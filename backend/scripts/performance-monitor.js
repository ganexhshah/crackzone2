const pool = require('../config/database');
const { cache } = require('../config/redis');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeConnections: 0
    };
    
    this.startTime = Date.now();
  }

  // Middleware to track request metrics
  requestTracker() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.metrics.requests++;

      // Track response time
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.metrics.responseTime.push(responseTime);
        
        // Keep only last 1000 response times
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime.shift();
        }

        // Track errors
        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
      });

      next();
    };
  }

  // Track database query performance
  trackDbQuery() {
    this.metrics.dbQueries++;
  }

  // Track cache performance
  trackCacheHit() {
    this.metrics.cacheHits++;
  }

  trackCacheMiss() {
    this.metrics.cacheMisses++;
  }

  // Get current metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
      : 0;

    return {
      uptime: Math.floor(uptime / 1000), // in seconds
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) : 0,
      avgResponseTime: Math.round(avgResponseTime),
      dbQueries: this.metrics.dbQueries,
      cacheHits: this.metrics.cacheHits,
      cacheMisses: this.metrics.cacheMisses,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0 
        ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(2)
        : 0,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  // Get database statistics
  async getDatabaseStats() {
    try {
      const stats = await pool.query(`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC
        LIMIT 10
      `);

      const connections = await pool.query(`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      return {
        tables: stats.rows,
        connections: connections.rows[0]
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }

  // Get system health status
  async getHealthStatus() {
    const metrics = this.getMetrics();
    const dbStats = await this.getDatabaseStats();
    
    // Determine health status based on metrics
    let status = 'healthy';
    const issues = [];

    if (metrics.errorRate > 5) {
      status = 'warning';
      issues.push(`High error rate: ${metrics.errorRate}%`);
    }

    if (metrics.avgResponseTime > 2000) {
      status = 'warning';
      issues.push(`Slow response time: ${metrics.avgResponseTime}ms`);
    }

    if (metrics.memory.heapUsed > 500 * 1024 * 1024) { // 500MB
      status = 'warning';
      issues.push('High memory usage');
    }

    if (parseFloat(metrics.cacheHitRate) < 70) {
      status = 'warning';
      issues.push(`Low cache hit rate: ${metrics.cacheHitRate}%`);
    }

    return {
      status,
      issues,
      metrics,
      database: dbStats,
      timestamp: new Date().toISOString()
    };
  }

  // Log performance summary
  logSummary() {
    const metrics = this.getMetrics();
    console.log('\n📊 Performance Summary:');
    console.log(`   Uptime: ${Math.floor(metrics.uptime / 60)}m ${metrics.uptime % 60}s`);
    console.log(`   Requests: ${metrics.requests} (${metrics.errorRate}% errors)`);
    console.log(`   Avg Response Time: ${metrics.avgResponseTime}ms`);
    console.log(`   DB Queries: ${metrics.dbQueries}`);
    console.log(`   Cache Hit Rate: ${metrics.cacheHitRate}%`);
    console.log(`   Memory Usage: ${Math.round(metrics.memory.heapUsed / 1024 / 1024)}MB`);
  }

  // Start periodic logging
  startPeriodicLogging(intervalMs = 300000) { // 5 minutes default
    setInterval(() => {
      this.logSummary();
    }, intervalMs);
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      dbQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      activeConnections: 0
    };
    this.startTime = Date.now();
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Export for use in routes
module.exports = performanceMonitor;