// Test login endpoint to see the exact error
const https = require('https');

const testLogin = async () => {
  console.log('🧪 Testing Login Endpoint');
  console.log('========================');
  
  const backendUrl = 'https://crackzone2.onrender.com';
  
  // Test with dummy credentials to see the error
  const testData = {
    email: 'test@example.com',
    password: 'testpassword'
  };
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'crackzone2.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'https://crackzone-frontend.vercel.app'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response:', data);
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed Response:', parsed);
      } catch (e) {
        console.log('Raw Response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
  });
  
  req.write(postData);
  req.end();
};

testLogin();