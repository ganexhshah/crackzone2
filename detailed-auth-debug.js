// Detailed authentication debugging
const https = require('https');
const jwt = require('jsonwebtoken');

const detailedDebug = async () => {
  console.log('🔍 Detailed Authentication Debug');
  console.log('================================');
  
  const backendUrl = 'https://crackzone2.onrender.com';
  
  // Test login and get token
  console.log('\n1️⃣ Getting fresh token...');
  try {
    const loginResponse = await new Promise((resolve, reject) => {
      const loginData = JSON.stringify({
        email: 'admin@crackzone.com',
        password: 'a9c9e9cc59a16ea73653d31c2066c9f3'
      });
      
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
      console.log(`❌ Login failed: ${loginResponse.status}`);
      console.log('Response:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 50)}...`);
    
    // Decode token to see its contents
    console.log('\n2️⃣ Analyzing token...');
    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('Token header:', decoded.header);
      console.log('Token payload:', decoded.payload);
      console.log('Token expires:', new Date(decoded.payload.exp * 1000));
      console.log('Current time:', new Date());
      
      // Check if token is expired
      if (decoded.payload.exp * 1000 < Date.now()) {
        console.log('❌ Token is expired!');
      } else {
        console.log('✅ Token is not expired');
      }
    } catch (error) {
      console.log('❌ Failed to decode token:', error.message);
    }
    
    // Test /me endpoint with detailed error logging
    console.log('\n3️⃣ Testing /me endpoint...');
    try {
      const meResponse = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'crackzone2.onrender.com',
          port: 443,
          path: '/api/auth/me',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
        
        console.log('Request headers:', options.headers);
        
        const req = https.request(options, (res) => {
          console.log('Response status:', res.statusCode);
          console.log('Response headers:', res.headers);
          
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
      
      if (meResponse.status === 200) {
        console.log('✅ /me endpoint working!');
        console.log('User data:', meResponse.data);
      } else {
        console.log(`❌ /me endpoint failed: ${meResponse.status}`);
        console.log('Error response:', meResponse.data);
      }
    } catch (error) {
      console.log(`❌ /me request failed: ${error.message}`);
    }
    
    // Test other endpoints
    console.log('\n4️⃣ Testing other protected endpoints...');
    const endpoints = [
      '/api/dashboard/stats',
      '/api/wallet',
      '/api/notifications?limit=5'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await new Promise((resolve, reject) => {
          const options = {
            hostname: 'crackzone2.onrender.com',
            port: 443,
            path: endpoint,
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
              resolve({ status: res.statusCode });
            });
          });
          
          req.on('error', reject);
          req.end();
        });
        
        if (response.status === 200) {
          console.log(`✅ ${endpoint} - Working`);
        } else {
          console.log(`❌ ${endpoint} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log(`❌ Debug failed: ${error.message}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('===========');
  console.log('If /me endpoint still fails after login works,');
  console.log('the issue is in the authentication middleware.');
  console.log('Check Render logs for detailed error messages.');
};

detailedDebug().catch(console.error);