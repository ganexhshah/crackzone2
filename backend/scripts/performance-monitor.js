const os = require('os');
const pool = require('../config/database');
const { cache } = require('../config/redis');

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      responseTime: [],
      activeUsers: new Set(),
      dbConnections: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    
    this.startTime = Date.now();
    this.intervals = [];
  }

  // Middleware to track performance
  trackRequest() {
    return (req, res, next) => {
      const startTime = Date.now();
      this.metrics.requests++;
      
      if (req.user) {
        this.metrics.activeUsers.add(req.user.id);
      }

      // Track response time
      res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        this.metrics.responseTime.push(responseTime);
        
        // Keep only last 1000 response times
        if (this.metrics.responseTime.length > 1000) {
          this.metrics.responseTime.shift();
        }

        if (res.statusCode >= 400) {
          this.metrics.errors++;
        }
      });

      next();
    };
  }

  // Track cache performance
  trackCache(hit) {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  // Get current performance metrics
  getMetrics() {
    const uptime = Date.now() - this.startTime;
    const avgResponseTime = this.metrics.responseTime.length > 0 
      ? this.metrics.responseTime.reduce((a, b) => a + b, 0) / this.metrics.responseTime.length 
      : 0;

    return {
      uptime: Math.floor(uptime / 1000), // seconds
      requests: this.metrics.requests,
      errors: this.metrics.errors,
      errorRate: this.metrics.requests > 0 ? (this.metrics.errors / this.metrics.requests * 100).toFixed(2) : 0,
      avgResponseTime: Math.round(avgResponseTime),
      activeUsers: this.metrics.activeUsers.size,
      dbConnections: pool.totalCount,
      dbIdleConnections: pool.idleCount,
      dbWaitingClients: pool.waitingCount,
      cacheHitRate: this.metrics.cacheHits + this.metrics.cacheMisses > 0 
        ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(2)
        : 0,
      system: {
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem()
      }
    };
  }

  // Start monitoring
  startMonitoring() {
    // Log metrics every 30 seconds
    const metricsInterval = setInterval(() => {
      const metrics = this.getMetrics();
      console.log('📊 Performance Metrics:', {
        activeUsers: metrics.activeUsers,
        avgResponseTime: `${metrics.avgResponseTime}ms`,
        errorRate: `${metrics.errorRate}%`,
        cacheHitRate: `${metrics.cacheHitRate}%`,
        dbConnections: `${metrics.dbConnections}/${pool.options.max}`,
        memoryUsage: `${Math.round(metrics.system.memoryUsage.heapUsed / 1024 / 1024)}MB`
      });
    }, 30000);

    // Clear old active users every 5 minutes
    const cleanupInterval = setInterval(() => {
      this.metrics.activeUsers.clear();
    }, 5 * 60 * 1000);

    // Alert on high resource usage
    const alertInterval = setInterval(() => {
      const metrics = this.getMetrics();
      
      // High response time alert
      if (metrics.avgResponseTime > 1000) {
        console.warn('⚠️ HIGH RESPONSE TIME:', `${metrics.avgResponseTime}ms`);
      }

      // High error rate alert
      if (metrics.errorRate > 5) {
        console.warn('⚠️ HIGH ERROR RATE:', `${metrics.errorRate}%`);
      }

      // Database connection alert
      if (metrics.dbWaitingClients > 5) {
        console.warn('⚠️ DATABASE BOTTLENECK:', `${metrics.dbWaitingClients} waiting clients`);
      }

      // Memory usage alert
      const memoryUsagePercent = (metrics.system.memoryUsage.heapUsed / metrics.system.totalMemory) * 100;
      if (memoryUsagePercent > 80) {
        console.warn('⚠️ HIGH MEMORY USAGE:', `${memoryUsagePercent.toFixed(1)}%`);
      }
    }, 60000);

    this.intervals = [metricsInterval, cleanupInterval, alertInterval];
  }

  // Stop monitoring
  stopMonitoring() {
    this.intervals.forEach(interval => clearInterval(interval));
  }

  // Get performance recommendations
  getRecommendations() {
    const metrics = this.getMetrics();
    const recommendations = [];

    if (metrics.avgResponseTime > 500) {
      recommendations.push('Consider adding more database connections or implementing query optimization');
    }

    if (metrics.cacheHitRate < 70) {
      recommendations.push('Improve caching strategy - current hit rate is low');
    }

    if (metrics.dbWaitingClients > 3) {
      recommendations.push('Database connection pool is saturated - consider increasing max connections');
    }

    if (metrics.activeUsers > 1000) {
      recommendations.push('Consider implementing horizontal scaling or load balancing');
    }

    const memoryUsagePercent = (metrics.system.memoryUsage.heapUsed / metrics.system.totalMemory) * 100;
    if (memoryUsagePercent > 70) {
      recommendations.push('Memory usage is high - consider optimizing memory usage or adding more RAM');
    }

    return recommendations;
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getMetrics();
    const recommendations = this.getRecommendations();

    return {
      timestamp: new Date().toISOString(),
      metrics,
      recommendations,
      capacity: {
        current: metrics.activeUsers,
        estimated_max: this.estimateMaxCapacity(metrics),
        status: this.getCapacityStatus(metrics)
      }
    };
  }

  // Estimate maximum capacity based on current metrics
  estimateMaxCapacity(metrics) {
    const factors = [
      // Database connections factor
      Math.floor((pool.options.max / Math.max(metrics.dbConnections, 1)) * metrics.activeUsers),
      
      // Response time factor (assume 1s is max acceptable)
      Math.floor((1000 / Math.max(metrics.avgResponseTime, 100)) * metrics.activeUsers),
      
      // Memory factor
      Math.floor((metrics.system.totalMemory * 0.8) / (metrics.system.memoryUsage.heapUsed / Math.max(metrics.activeUsers, 1)))
    ];

    return Math.min(...factors.filter(f => f > 0));
  }

  // Get capacity status
  getCapacityStatus(metrics) {
    const estimatedMax = this.estimateMaxCapacity(metrics);
    const currentUsage = metrics.activeUsers / estimatedMax;

    if (currentUsage < 0.5) return 'LOW';
    if (currentUsage < 0.8) return 'MODERATE';
    return 'HIGH';
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor;