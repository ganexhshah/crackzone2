const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

class QuickPerformanceTest {
  constructor() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const startTime = Date.now();
    
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        timeout: 5000,
        validateStatus: () => true // Don't throw on HTTP errors
      };
      
      if (data) {
        config.data = data;
        config.headers = { 'Content-Type': 'application/json' };
      }
      
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      this.results.totalRequests++;
      this.results.responseTimes.push(responseTime);
      
      if (response.status >= 200 && response.status < 400) {
        this.results.successfulRequests++;
      } else {
        this.results.failedRequests++;
      }
      
      return { status: response.status, responseTime, data: response.data };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.results.totalRequests++;
      this.results.failedRequests++;
      this.results.responseTimes.push(responseTime);
      this.results.errors.push(error.message);
      
      return { status: 'ERROR', responseTime, error: error.message };
    }
  }

  async runConcurrentRequests(endpoint, count, method = 'GET', data = null) {
    console.log(`🚀 Running ${count} concurrent requests to ${endpoint}...`);
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(this.makeRequest(endpoint, method, data));
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Completed ${count} requests in ${totalTime}ms`);
    console.log(`📊 Average response time: ${Math.round(totalTime / count)}ms per request`);
    
    return results;
  }

  async testHealthEndpoint() {
    console.log('\n🏥 Testing Health Endpoint Performance...');
    await this.runConcurrentRequests('/health', 50);
  }

  async testAuthEndpoint() {
    console.log('\n🔐 Testing Auth Endpoint Performance...');
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };
    await this.runConcurrentRequests('/api/auth/login', 20, 'POST', loginData);
  }

  async testDatabaseEndpoints() {
    console.log('\n🗄️ Testing Database-Heavy Endpoints...');
    
    // Test user-related endpoints
    await this.runConcurrentRequests('/api/tournaments', 30);
    await this.runConcurrentRequests('/api/leaderboard', 25);
  }

  async simulateUserLoad() {
    console.log('\n👥 Simulating Real User Load...');
    
    const userActions = [
      { endpoint: '/health', weight: 10 },
      { endpoint: '/api/tournaments', weight: 30 },
      { endpoint: '/api/leaderboard', weight: 20 },
      { endpoint: '/api/auth/login', weight: 15, method: 'POST', data: { email: 'test@example.com', password: 'test' } },
      { endpoint: '/api/notifications', weight: 25 }
    ];
    
    const requests = [];
    userActions.forEach(action => {
      for (let i = 0; i < action.weight; i++) {
        requests.push(this.makeRequest(action.endpoint, action.method || 'GET', action.data));
      }
    });
    
    // Shuffle requests to simulate random user behavior
    for (let i = requests.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [requests[i], requests[j]] = [requests[j], requests[i]];
    }
    
    console.log(`🎯 Simulating ${requests.length} mixed user requests...`);
    const startTime = Date.now();
    await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ Completed user simulation in ${totalTime}ms`);
  }

  getStatistics() {
    const responseTimes = this.results.responseTimes;
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const successRate = (this.results.successfulRequests / this.results.totalRequests) * 100;
    
    // Calculate percentiles
    const sortedTimes = [...responseTimes].sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];
    
    return {
      totalRequests: this.results.totalRequests,
      successfulRequests: this.results.successfulRequests,
      failedRequests: this.results.failedRequests,
      successRate: successRate.toFixed(2),
      avgResponseTime: Math.round(avgResponseTime),
      minResponseTime,
      maxResponseTime,
      p50ResponseTime: p50,
      p95ResponseTime: p95,
      p99ResponseTime: p99,
      errorCount: this.results.errors.length
    };
  }

  printResults() {
    const stats = this.getStatistics();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`🎯 Total Requests: ${stats.totalRequests}`);
    console.log(`✅ Successful: ${stats.successfulRequests} (${stats.successRate}%)`);
    console.log(`❌ Failed: ${stats.failedRequests}`);
    console.log(`⚡ Average Response Time: ${stats.avgResponseTime}ms`);
    console.log(`🚀 Fastest Response: ${stats.minResponseTime}ms`);
    console.log(`🐌 Slowest Response: ${stats.maxResponseTime}ms`);
    console.log(`📈 50th Percentile: ${stats.p50ResponseTime}ms`);
    console.log(`📈 95th Percentile: ${stats.p95ResponseTime}ms`);
    console.log(`📈 99th Percentile: ${stats.p99ResponseTime}ms`);
    
    // Performance assessment
    console.log('\n🎯 PERFORMANCE ASSESSMENT:');
    
    if (stats.avgResponseTime < 100) {
      console.log('🟢 EXCELLENT - Your server can handle high load smoothly');
    } else if (stats.avgResponseTime < 300) {
      console.log('🟡 GOOD - Your server performs well under normal load');
    } else if (stats.avgResponseTime < 1000) {
      console.log('🟠 ACCEPTABLE - Your server handles moderate load');
    } else {
      console.log('🔴 NEEDS OPTIMIZATION - Consider scaling or optimization');
    }
    
    // Capacity estimation
    const estimatedConcurrentUsers = this.estimateCapacity(stats);
    console.log(`\n👥 ESTIMATED CAPACITY:`);
    console.log(`🎮 Concurrent Active Users: ${estimatedConcurrentUsers.concurrent}`);
    console.log(`📊 Total Registered Users: ${estimatedConcurrentUsers.total}`);
    console.log(`🏆 Tournament Peak Users: ${estimatedConcurrentUsers.tournament}`);
  }

  estimateCapacity(stats) {
    // Base capacity estimation on response times and success rate
    let baseCapacity = 1000; // Starting estimate
    
    // Adjust based on average response time
    if (stats.avgResponseTime < 100) {
      baseCapacity *= 2; // Can handle 2x more
    } else if (stats.avgResponseTime > 500) {
      baseCapacity *= 0.5; // Reduce capacity
    }
    
    // Adjust based on success rate
    if (stats.successRate < 95) {
      baseCapacity *= 0.7; // Reduce if high error rate
    }
    
    // Adjust based on 95th percentile
    if (stats.p95ResponseTime > 1000) {
      baseCapacity *= 0.6; // Reduce if high tail latency
    }
    
    return {
      concurrent: Math.round(baseCapacity),
      total: Math.round(baseCapacity * 50), // 50:1 ratio
      tournament: Math.round(baseCapacity * 0.3) // 30% for peak events
    };
  }

  async runFullTest() {
    console.log('🚀 Starting CrackZone Performance Test...');
    console.log(`🎯 Target: ${BASE_URL}`);
    
    try {
      await this.testHealthEndpoint();
      await this.testAuthEndpoint();
      await this.testDatabaseEndpoints();
      await this.simulateUserLoad();
      
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
}

// Run test if called directly
if (require.main === module) {
  const test = new QuickPerformanceTest();
  test.runFullTest().then(() => {
    console.log('\n🎉 Performance test completed!');
    process.exit(0);
  }).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = QuickPerformanceTest;