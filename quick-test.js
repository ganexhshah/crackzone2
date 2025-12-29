// Quick test to check if server is running
const https = require('https');

const testServer = async () => {
  console.log('🔍 Testing server status...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      https.get('https://crackzone2.onrender.com/api/setup/database-status', (res) => {
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
    
    if (response.status === 200) {
      console.log('✅ Server is running!');
      console.log('Database status:', response.data);
    } else {
      console.log(`❌ Server returned status: ${response.status}`);
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
  }
};

testServer();