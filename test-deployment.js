// Quick deployment test script
const https = require('https');

const testEndpoint = (url, description) => {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing ${description}...`);
    console.log(`📡 URL: ${url}`);
    
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const duration = Date.now() - startTime;
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`⏱️  Response time: ${duration}ms`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`📄 Response:`, json);
        } catch (e) {
          console.log(`📄 Response (text):`, data.substring(0, 200));
        }
        resolve({ status: res.statusCode, duration, data });
      });
    }).on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ error: err.message });
    });
  });
};

const runTests = async () => {
  console.log('🚀 CrackZone Deployment Test');
  console.log('============================');
  
  const baseUrl = 'https://crackzone2.onrender.com';
  
  // Test endpoints
  await testEndpoint(`${baseUrl}/health`, 'Health Check');
  await testEndpoint(`${baseUrl}/api/auth/status`, 'Auth Status');
  await testEndpoint(`${baseUrl}/`, 'Root Endpoint');
  
  console.log('\n🎯 Production URLs:');
  console.log('Frontend: https://crackzone-frontend.vercel.app');
  console.log('Backend:  https://crackzone2.onrender.com');
  console.log('Admin:    https://crackzone-frontend.vercel.app/admin');
  
  console.log('\n🔐 Admin Credentials:');
  console.log('Username: admin');
  console.log('Password: a9c9e9cc59a16ea73653d31c2066c9f3');
};

runTests().catch(console.error);