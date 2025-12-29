// Simple authentication test
const https = require('https');

const testAuth = async () => {
  console.log('🔍 Simple Authentication Test');
  console.log('=============================');
  
  // Test login
  console.log('\n1️⃣ Testing login...');
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
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      
      // Wait a moment for deployment
      console.log('\n⏳ Waiting for deployment...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Test /me endpoint
      console.log('\n2️⃣ Testing /me endpoint...');
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
        console.log('✅ Authentication working!');
        console.log('User:', meResponse.data.user);
        
        console.log('\n🎉 SUCCESS: Authentication is fixed!');
        console.log('Users can now login and access protected routes.');
        
      } else {
        console.log(`❌ /me failed: ${meResponse.status}`);
        console.log('Error:', meResponse.data);
        
        if (meResponse.status === 403) {
          console.log('\n🔧 Still getting 403 - deployment may not be complete');
          console.log('Wait a few more minutes and try again');
        }
      }
      
    } else {
      console.log(`❌ Login failed: ${loginResponse.status}`);
      console.log('Error:', loginResponse.data);
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
};

testAuth().catch(console.error);