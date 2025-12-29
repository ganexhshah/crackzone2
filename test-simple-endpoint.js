// Test a simple endpoint to see if deployment updated
const https = require('https');

const testSimpleEndpoint = async () => {
  console.log('🔍 Testing simple endpoint...');
  
  try {
    // Test the dashboard stats endpoint which was working
    const loginData = JSON.stringify({
      email: 'admin@crackzone.com',
      password: 'a9c9e9cc59a16ea73653d31c2066c9f3'
    });
    
    const loginResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'crackzone2.onrender.com',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(loginData)
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      
      req.on('error', reject);
      req.write(loginData);
      req.end();
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.token;
    
    // Test upcoming tournaments endpoint
    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'crackzone2.onrender.com',
        port: 443,
        path: '/api/dashboard/upcoming-tournaments',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

testSimpleEndpoint();