const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class SecurityMonitor {
  constructor() {
    this.alerts = [];
    this.securityEvents = [];
    this.suspiciousIPs = new Map();
    this.rateLimitViolations = new Map();
    this.logDirectory = path.join(__dirname, '../logs');
    this.maxLogSize = 10 * 1024 * 1024; // 10MB
    this.maxLogFiles = 10;
    
    this.initializeLogging();
  }

  async initializeLogging() {
    try {
      await fs.mkdir(this.logDirectory, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  // Security event logging
  async logSecurityEvent(event) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...event,
      id: crypto.randomUUID()
    };

    this.securityEvents.push(logEntry);

    // Write to file
    const logFile = path.join(this.logDirectory, `security-${new Date().toISOString().split('T')[0]}.log`);
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      await fs.appendFile(logFile, logLine);
      await this.rotateLogsIfNeeded(logFile);
    } catch (error) {
      console.error('Failed to write security log:', error);
    }

    // Check for critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      this.createAlert(event);
    }

    // Analyze patterns
    this.analyzeSecurityPatterns(event);
  }

  // Create security alert
  createAlert(event) {
    const alert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: event.type,
      severity: event.severity,
      message: event.message,
      source: event.source,
      details: event.details,
      status: 'active'
    };

    this.alerts.push(alert);

    // Send notification (implement email/SMS/webhook)
    this.sendAlertNotification(alert);

    console.error('🚨 SECURITY ALERT:', alert);
  }

  // Send alert notifications
  async sendAlertNotification(alert) {
    // Implement notification logic (email, SMS, webhook, etc.)
    console.log('Sending security alert notification:', alert.message);
    
    // Example webhook notification
    if (process.env.SECURITY_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.SECURITY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (error) {
        console.error('Failed to send webhook notification:', error);
      }
    }
  }

  // Analyze security patterns
  analyzeSecurityPatterns(event) {
    const ip = event.source?.ip;
    if (!ip) return;

    // Track suspicious IPs
    const ipData = this.suspiciousIPs.get(ip) || {
      events: [],
      riskScore: 0,
      firstSeen: new Date(),
      lastSeen: new Date()
    };

    ipData.events.push(event);
    ipData.lastSeen = new Date();
    ipData.riskScore += this.calculateRiskScore(event);

    this.suspiciousIPs.set(ip, ipData);

    // Auto-block high-risk IPs
    if (ipData.riskScore > 100) {
      this.blockIP(ip, 'High risk score');
    }

    // Detect brute force attacks
    this.detectBruteForce(ip, event);

    // Detect unusual patterns
    this.detectUnusualPatterns(ip, event);
  }

  // Calculate risk score for events
  calculateRiskScore(event) {
    const scores = {
      'failed_login': 10,
      'sql_injection_attempt': 50,
      'xss_attempt': 30,
      'rate_limit_exceeded': 20,
      'suspicious_file_upload': 40,
      'admin_access_attempt': 25,
      'data_breach_attempt': 100,
      'malware_detected': 100
    };

    return scores[event.type] || 5;
  }

  // Detect brute force attacks
  detectBruteForce(ip, event) {
    if (event.type !== 'failed_login') return;

    const recentEvents = this.getRecentEvents(ip, 15 * 60 * 1000); // 15 minutes
    const failedLogins = recentEvents.filter(e => e.type === 'failed_login');

    if (failedLogins.length >= 5) {
      this.logSecurityEvent({
        type: 'brute_force_detected',
        severity: 'high',
        message: `Brute force attack detected from IP ${ip}`,
        source: { ip },
        details: { attempts: failedLogins.length }
      });

      this.blockIP(ip, 'Brute force attack');
    }
  }

  // Detect unusual patterns
  detectUnusualPatterns(ip, event) {
    const recentEvents = this.getRecentEvents(ip, 60 * 60 * 1000); // 1 hour
    
    // Detect rapid requests
    if (recentEvents.length > 1000) {
      this.logSecurityEvent({
        type: 'ddos_attempt',
        severity: 'high',
        message: `Potential DDoS attack from IP ${ip}`,
        source: { ip },
        details: { requestCount: recentEvents.length }
      });
    }

    // Detect scanning behavior
    const uniqueEndpoints = new Set(recentEvents.map(e => e.details?.endpoint)).size;
    if (uniqueEndpoints > 50) {
      this.logSecurityEvent({
        type: 'port_scanning',
        severity: 'medium',
        message: `Port scanning behavior detected from IP ${ip}`,
        source: { ip },
        details: { endpointsAccessed: uniqueEndpoints }
      });
    }
  }

  // Get recent events for an IP
  getRecentEvents(ip, timeWindow) {
    const cutoff = Date.now() - timeWindow;
    return this.securityEvents.filter(event => 
      event.source?.ip === ip && 
      new Date(event.timestamp).getTime() > cutoff
    );
  }

  // Block IP address
  async blockIP(ip, reason) {
    const blockEntry = {
      ip,
      reason,
      timestamp: new Date().toISOString(),
      duration: 24 * 60 * 60 * 1000 // 24 hours
    };

    // Add to blocked IPs file
    const blockedIPsFile = path.join(this.logDirectory, 'blocked-ips.json');
    
    try {
      let blockedIPs = [];
      try {
        const data = await fs.readFile(blockedIPsFile, 'utf8');
        blockedIPs = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, start with empty array
      }

      blockedIPs.push(blockEntry);
      await fs.writeFile(blockedIPsFile, JSON.stringify(blockedIPs, null, 2));

      this.logSecurityEvent({
        type: 'ip_blocked',
        severity: 'medium',
        message: `IP ${ip} has been blocked`,
        source: { ip },
        details: { reason, duration: '24 hours' }
      });

    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  }

  // Check if IP is blocked
  async isIPBlocked(ip) {
    const blockedIPsFile = path.join(this.logDirectory, 'blocked-ips.json');
    
    try {
      const data = await fs.readFile(blockedIPsFile, 'utf8');
      const blockedIPs = JSON.parse(data);
      
      const blockEntry = blockedIPs.find(entry => entry.ip === ip);
      if (!blockEntry) return false;

      // Check if block has expired
      const blockTime = new Date(blockEntry.timestamp).getTime();
      const now = Date.now();
      
      return (now - blockTime) < blockEntry.duration;
    } catch (error) {
      return false;
    }
  }

  // Log rotation
  async rotateLogsIfNeeded(logFile) {
    try {
      const stats = await fs.stat(logFile);
      if (stats.size > this.maxLogSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
        await fs.rename(logFile, rotatedFile);
        
        // Compress old log (optional)
        // await this.compressLog(rotatedFile);
        
        // Clean up old logs
        await this.cleanupOldLogs();
      }
    } catch (error) {
      console.error('Log rotation error:', error);
    }
  }

  // Clean up old log files
  async cleanupOldLogs() {
    try {
      const files = await fs.readdir(this.logDirectory);
      const logFiles = files
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.logDirectory, file),
          time: fs.stat(path.join(this.logDirectory, file)).then(stats => stats.mtime)
        }));

      const sortedFiles = await Promise.all(
        logFiles.map(async file => ({
          ...file,
          time: await file.time
        }))
      );

      sortedFiles.sort((a, b) => b.time - a.time);

      // Keep only the most recent files
      const filesToDelete = sortedFiles.slice(this.maxLogFiles);
      
      for (const file of filesToDelete) {
        await fs.unlink(file.path);
      }
    } catch (error) {
      console.error('Log cleanup error:', error);
    }
  }

  // Get security dashboard data
  getSecurityDashboard() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last7d = now - (7 * 24 * 60 * 60 * 1000);

    const recentEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > last24h
    );

    const weeklyEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > last7d
    );

    return {
      alerts: {
        active: this.alerts.filter(alert => alert.status === 'active').length,
        total: this.alerts.length
      },
      events: {
        last24h: recentEvents.length,
        last7d: weeklyEvents.length,
        byType: this.groupEventsByType(recentEvents)
      },
      suspiciousIPs: {
        total: this.suspiciousIPs.size,
        highRisk: Array.from(this.suspiciousIPs.entries())
          .filter(([ip, data]) => data.riskScore > 50)
          .length
      },
      topThreats: this.getTopThreats(recentEvents)
    };
  }

  // Group events by type
  groupEventsByType(events) {
    const grouped = {};
    events.forEach(event => {
      grouped[event.type] = (grouped[event.type] || 0) + 1;
    });
    return grouped;
  }

  // Get top threats
  getTopThreats(events) {
    const threats = {};
    events.forEach(event => {
      const ip = event.source?.ip;
      if (ip) {
        threats[ip] = (threats[ip] || 0) + 1;
      }
    });

    return Object.entries(threats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, eventCount: count }));
  }
}

// Create singleton instance
const securityMonitor = new SecurityMonitor();

// Middleware to log security events
const securityLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  const logRequest = () => {
    const duration = Date.now() - startTime;
    const event = {
      type: 'request',
      severity: 'info',
      message: `${req.method} ${req.path}`,
      source: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id
      },
      details: {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration,
        contentLength: res.get('Content-Length')
      }
    };

    // Log suspicious requests
    if (res.statusCode >= 400 || duration > 5000) {
      event.severity = res.statusCode >= 500 ? 'high' : 'medium';
      securityMonitor.logSecurityEvent(event);
    }
  };

  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    logRequest();
    originalEnd.apply(this, args);
  };

  next();
};

// IP blocking middleware
const ipBlockingMiddleware = async (req, res, next) => {
  const isBlocked = await securityMonitor.isIPBlocked(req.ip);
  
  if (isBlocked) {
    await securityMonitor.logSecurityEvent({
      type: 'blocked_ip_access',
      severity: 'medium',
      message: `Blocked IP ${req.ip} attempted access`,
      source: { ip: req.ip },
      details: { path: req.path, method: req.method }
    });

    return res.status(403).json({ error: 'Access denied' });
  }

  next();
};

module.exports = {
  SecurityMonitor,
  securityMonitor,
  securityLoggingMiddleware,
  ipBlockingMiddleware
};