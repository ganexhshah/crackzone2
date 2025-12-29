// Debug authentication issue
const https = require('https');

const debugAuth = async () => {
  console.log('🔍 Debugging Authentication Issue');
  console.log('=================================');
  
  const backendUrl = 'https://crackzone2.onrender.com';
  
  // Test 1: Check database status
  console.log('\n1️⃣ Checking database status...');
  try {
    const dbResponse = await new Promise((resolve, reject) => {
      https.get(`${backendUrl}/api/setup/database-status`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, data });
          }
        });
      }).on('error', reject);
    });
    
    if (dbResponse.status === 200) {
      console.log('✅ Database connected');
      console.log(`Tables: ${dbResponse.data.tables.join(', ')}`);
      console.log(`Users: ${dbResponse.data.user_count}`);
    } else {
      console.log(`❌ Database status: ${dbResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Database check failed: ${error.message}`);
  }
  
  // Test 2: Try to login with admin credentials
  console.log('\n2️⃣ Testing admin login...');
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
    
    if (loginResponse.status === 200) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;
      console.log(`Token received: ${token.substring(0, 20)}...`);
      
      // Test 3: Use token to access /me endpoint
      console.log('\n3️⃣ Testing /me endpoint with token...');
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
        
        if (meResponse.status === 200) {
          console.log('✅ /me endpoint working');
          console.log('User data:', meResponse.data.user);
        } else {
          console.log(`❌ /me endpoint failed: ${meResponse.status}`);
          console.log('Error:', meResponse.data);
        }
      } catch (error) {
        console.log(`❌ /me test failed: ${error.message}`);
      }
      
    } else {
      console.log(`❌ Admin login failed: ${loginResponse.status}`);
      console.log('Error:', loginResponse.data);
    }
  } catch (error) {
    console.log(`❌ Login test failed: ${error.message}`);
  }
  
  console.log('\n📋 Diagnosis:');
  console.log('=============');
  console.log('The 403 errors suggest:');
  console.log('1. User is not logged in (no token)');
  console.log('2. Token is invalid/expired');
  console.log('3. Database schema mismatch (missing columns)');
  console.log('4. Authentication middleware issue');
  
  console.log('\n🔧 Solutions:');
  console.log('1. User needs to login first');
  console.log('2. Check if database has required columns');
  console.log('3. Fix authentication middleware');
};

debugAuth().catch(console.error);