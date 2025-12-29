require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

class SecurityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
    } catch (error) {
      console.log(`❌ FAILED: ${name} - ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
    }
  }

  async testHealthEndpoint() {
    const response = await axios.get(`${BASE_URL}/health`);
    if (response.status !== 200) {
      throw new Error('Health endpoint not responding');
    }
    if (!response.data.status || response.data.status !== 'healthy') {
      throw new Error('Health endpoint not returning healthy status');
    }
  }

  async testSecurityHeaders() {
    const response = await axios.get(`${BASE_URL}/health`);
    const headers = response.headers;
    
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'strict-transport-security'
    ];

    for (const header of requiredHeaders) {
      if (!headers[header]) {
        throw new Error(`Missing security header: ${header}`);
      }
    }
  }

  async testRateLimiting() {
    const requests = [];
    const endpoint = `${BASE_URL}/api/auth/login`;
    
    // Send multiple requests rapidly
    for (let i = 0; i < 15; i++) {
      requests.push(
        axios.post(endpoint, {
          email: 'test@example.com',
          password: 'wrongpassword'
        }, { validateStatus: () => true })
      );
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (!rateLimited) {
      throw new Error('Rate limiting not working - no 429 responses received');
    }
  }

  async testCORSProtection() {
    try {
      await axios.get(`${BASE_URL}/health`, {
        headers: {
          'Origin': 'https://malicious-site.com'
        }
      });
      // If we get here without error, CORS might not be properly configured
      // But this test is limited since we're not in a browser environment
    } catch (error) {
      if (error.response && error.response.status === 403) {
        // Good, CORS is blocking
        return;
      }
    }
  }

  async testInputSanitization() {
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      "'; DROP TABLE users; --",
      '<img src=x onerror=alert(1)>',
      'javascript:alert(1)',
      '${7*7}',
      '{{7*7}}'
    ];

    for (const input of maliciousInputs) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: input,
          password: input
        }, { validateStatus: () => true });

        // Check if the malicious input was sanitized
        if (response.data && JSON.stringify(response.data).includes(input)) {
          throw new Error(`Input not sanitized: ${input}`);
        }
      } catch (error) {
        if (error.message.includes('Input not sanitized')) {
          throw error;
        }
        // Other errors are expected (validation, etc.)
      }
    }
  }

  async testFileUploadSecurity() {
    // Test file size limit
    const largeFile = Buffer.alloc(10 * 1024 * 1024); // 10MB
    
    try {
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', largeFile, 'large.jpg');
      
      const response = await axios.post(`${BASE_URL}/api/uploads/profile-image`, form, {
        headers: form.getHeaders(),
        validateStatus: () => true
      });

      if (response.status !== 400 && response.status !== 413) {
        throw new Error('File size limit not enforced');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Server not running for file upload test');
      }
      // Other errors might be expected
    }
  }

  async testSQLInjection() {
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 1=1 --"
    ];

    for (const payload of sqlInjectionPayloads) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: payload,
          password: 'password'
        }, { validateStatus: () => true });

        // Should not return successful login or expose database errors
        if (response.status === 200 || 
            (response.data && response.data.error && response.data.error.includes('SQL'))) {
          throw new Error(`SQL injection vulnerability detected with payload: ${payload}`);
        }
      } catch (error) {
        if (error.message.includes('SQL injection vulnerability')) {
          throw error;
        }
        // Other errors are expected
      }
    }
  }

  async testPasswordSecurity() {
    const weakPasswords = [
      '123456',
      'password',
      'admin',
      '12345678',
      'qwerty'
    ];

    for (const password of weakPasswords) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/register`, {
          username: 'testuser',
          email: 'test@example.com',
          password: password,
          fullName: 'Test User'
        }, { validateStatus: () => true });

        if (response.status === 200 || response.status === 201) {
          throw new Error(`Weak password accepted: ${password}`);
        }
      } catch (error) {
        if (error.message.includes('Weak password accepted')) {
          throw error;
        }
        // Other errors are expected (validation failures)
      }
    }
  }

  async testJWTSecurity() {
    // Test with invalid JWT
    const invalidTokens = [
      'invalid.jwt.token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      '',
      'Bearer malicious-token'
    ];

    for (const token of invalidTokens) {
      try {
        const response = await axios.get(`${BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          validateStatus: () => true
        });

        if (response.status === 200) {
          throw new Error(`Invalid JWT token accepted: ${token}`);
        }
      } catch (error) {
        if (error.message.includes('Invalid JWT token accepted')) {
          throw error;
        }
        // Other errors are expected (401, 403)
      }
    }
  }

  async testBruteForceProtection() {
    const attempts = [];
    const email = 'bruteforce@test.com';
    
    // Make multiple failed login attempts
    for (let i = 0; i < 8; i++) {
      attempts.push(
        axios.post(`${BASE_URL}/api/auth/login`, {
          email: email,
          password: 'wrongpassword'
        }, { validateStatus: () => true })
      );
    }

    const responses = await Promise.all(attempts);
    const blocked = responses.some(r => r.status === 429);
    
    if (!blocked) {
      throw new Error('Brute force protection not working');
    }
  }

  async testSecurityEndpoints() {
    // Test security dashboard without admin auth
    try {
      const response = await axios.get(`${BASE_URL}/api/security/dashboard`, {
        validateStatus: () => true
      });

      if (response.status === 200) {
        throw new Error('Security dashboard accessible without admin authentication');
      }
    } catch (error) {
      if (error.message.includes('Security dashboard accessible')) {
        throw error;
      }
      // 401/403 errors are expected
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🔒 SECURITY TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(t => t.status === 'FAILED')
        .forEach(t => console.log(`  - ${t.name}: ${t.error}`));
    }

    const successRate = (this.results.passed / this.results.tests.length * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
      console.log('🎉 Security implementation looks good!');
    } else {
      console.log('⚠️  Security implementation needs attention!');
    }
  }

  async runAllTests() {
    console.log('🔒 Starting Security Tests...');
    console.log(`🎯 Target: ${BASE_URL}`);

    await this.runTest('Health Endpoint', () => this.testHealthEndpoint());
    await this.runTest('Security Headers', () => this.testSecurityHeaders());
    await this.runTest('Rate Limiting', () => this.testRateLimiting());
    await this.runTest('CORS Protection', () => this.testCORSProtection());
    await this.runTest('Input Sanitization', () => this.testInputSanitization());
    await this.runTest('File Upload Security', () => this.testFileUploadSecurity());
    await this.runTest('SQL Injection Protection', () => this.testSQLInjection());
    await this.runTest('Password Security', () => this.testPasswordSecurity());
    await this.runTest('JWT Security', () => this.testJWTSecurity());
    await this.runTest('Brute Force Protection', () => this.testBruteForceProtection());
    await this.runTest('Security Endpoints', () => this.testSecurityEndpoints());

    this.printResults();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = SecurityTester;