const axios = require('axios');
const { performance } = require('perf_hooks');

class LoadTester {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }

  // Simulate user registration
  async simulateRegistration() {
    const userData = {
      username: `testuser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`,
      password: 'TestPassword123!'
    };

    try {
      const startTime = performance.now();
      const response = await axios.post(`${this.baseURL}/api/auth/register`, userData);
      const endTime = performance.now();
      
      this.recordSuccess(endTime - startTime);
      return response.data;
    } catch (error) {
      this.recordError(error);
      return null;
    }
  }

  // Simulate user login
  async simulateLogin(email, password) {
    try {
      const startTime = performance.now();
      const response = await axios.post(`${this.baseURL}/api/auth/login`, {
        email,
        password
      });
      const endTime = performance.now();
      
      this.recordSuccess(endTime - startTime);
      return response.data.token;
    } catch (error) {
      this.recordError(error);
      return null;
    }
  }

  // Simulate dashboard access
  async simulateDashboard(token) {
    try {
      const startTime = performance.now();
      const response = await axios.get(`${this.baseURL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const endTime = performance.now();
      
      this.recordSuccess(endTime - startTime);
      return response.data;
    } catch (error) {
      this.recordError(error);
      return null;
    }
  }

  // Simulate tournament browsing
  async simulateTournaments(token) {
    try {
      const startTime = performance.now();
      const response = await axios.get(`${this.baseURL}/api/tournaments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const endTime = performance.now();
      
      this.recordSuccess(endTime - startTime);
      return response.data;
    } catch (error) {
      this.recordError(error);
      return null;
    }
  }

  // Record successful request
  recordSuccess(responseTime) {
    this.results.totalRequests++;
    this.results.successfulRequests++;
    this.results.responseTimes.push(responseTime);
  }

  // Record failed request
  recordError(error) {
    this.results.totalRequests++;
    this.results.failedRequests++;
    this.results.errors.push({
      message: error.message,
      status: error.response?.status,
      timestamp: new Date().toISOString()
    });
  }

  // Simulate a complete user journey
  async simulateUserJourney() {
    console.log('Starting user journey simulation...');
    
    // Register user
    const registrationData = await this.simulateRegistration();
    if (!registrationData) {
      console.log('Registration failed');
      return;
    }

    // Login user
    const token = await this.simulateLogin(registrationData.user.email, 'TestPassword123!');
    if (!token) {
      console.log('Login failed');
      return;
    }

    // Access dashboard
    await this.simulateDashboard(token);
    
    // Browse tournaments
    await this.simulateTournaments(token);
    
    console.log('User journey completed');
  }

  // Run concurrent load test
  async runLoadTest(concurrentUsers = 10, duration = 60000) {
    console.log(`\n🚀 Starting load test with ${concurrentUsers} concurrent users for ${duration/1000} seconds`);
    
    const startTime = Date.now();
    const promises = [];
    
    // Create concurrent user simulations
    for (let i = 0; i < concurrentUsers; i++) {
      const userPromise = this.runContinuousUserSimulation(duration);
      promises.push(userPromise);
    }
    
    // Wait for all simulations to complete
    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    this.printResults(totalTime);
  }

  // Run continuous user simulation for specified duration
  async runContinuousUserSimulation(duration) {
    const endTime = Date.now() + duration;
    
    while (Date.now() < endTime) {
      await this.simulateUserJourney();
      
      // Small delay between journeys
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Print test results
  printResults(totalTime) {
    const avgResponseTime = this.results.responseTimes.length > 0 
      ? this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length 
      : 0;
    
    const minResponseTime = Math.min(...this.results.responseTimes);
    const maxResponseTime = Math.max(...this.results.responseTimes);
    const successRate = (this.results.successfulRequests / this.results.totalRequests * 100).toFixed(2);
    const requestsPerSecond = (this.results.totalRequests / (totalTime / 1000)).toFixed(2);

    console.log('\n📊 Load Test Results:');
    console.log('='.repeat(50));
    console.log(`Total Requests: ${this.results.totalRequests}`);
    console.log(`Successful Requests: ${this.results.successfulRequests}`);
    console.log(`Failed Requests: ${this.results.failedRequests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log(`Requests/Second: ${requestsPerSecond}`);
    console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`Min Response Time: ${minResponseTime.toFixed(2)}ms`);
    console.log(`Max Response Time: ${maxResponseTime.toFixed(2)}ms`);
    console.log(`Total Test Duration: ${(totalTime / 1000).toFixed(2)}s`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      const errorCounts = {};
      this.results.errors.forEach(error => {
        const key = `${error.status || 'Unknown'}: ${error.message}`;
        errorCounts[key] = (errorCounts[key] || 0) + 1;
      });
      
      Object.entries(errorCounts).forEach(([error, count]) => {
        console.log(`   ${error} (${count} times)`);
      });
    }
    
    console.log('='.repeat(50));
  }

  // Reset results
  reset() {
    this.results = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimes: [],
      errors: []
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const concurrentUsers = parseInt(args[0]) || 10;
  const duration = parseInt(args[1]) * 1000 || 60000; // Convert to milliseconds
  const baseURL = args[2] || 'http://localhost:5000';
  
  const loadTester = new LoadTester(baseURL);
  
  console.log('🧪 CrackZone Load Tester');
  console.log(`Target: ${baseURL}`);
  console.log(`Concurrent Users: ${concurrentUsers}`);
  console.log(`Duration: ${duration/1000} seconds`);
  
  loadTester.runLoadTest(concurrentUsers, duration)
    .then(() => {
      console.log('\n✅ Load test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Load test failed:', error);
      process.exit(1);
    });
}

module.exports = LoadTester;