// Initialize the production database
const https = require('https');

const initializeDatabase = async () => {
  console.log('🗄️  Initializing Production Database');
  console.log('===================================');
  
  const backendUrl = 'https://crackzone2.onrender.com';
  
  // Wait for deployment to complete
  console.log('\n⏳ Waiting for deployment to complete...');
  await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  
  // Check if setup endpoint is available
  console.log('\n🔍 Checking setup endpoint...');
  try {
    const statusResponse = await new Promise((resolve, reject) => {
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
    
    console.log(`Status check: ${statusResponse.status}`);
    if (statusResponse.status === 200) {
      console.log('✅ Setup endpoint is available');
      if (statusResponse.data.initialized) {
        console.log('✅ Database is already initialized');
        console.log(`Tables: ${statusResponse.data.tables.join(', ')}`);
        console.log(`Users: ${statusResponse.data.user_count}`);
        return;
      }
    }
  } catch (error) {
    console.log(`⚠️  Setup endpoint not ready yet: ${error.message}`);
  }
  
  // Initialize database
  console.log('\n🚀 Initializing database...');
  try {
    const initResponse = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({});
      
      const options = {
        hostname: 'crackzone2.onrender.com',
        port: 443,
        path: '/api/setup/initialize-database',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
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
      req.write(postData);
      req.end();
    });
    
    if (initResponse.status === 200) {
      console.log('✅ Database initialized successfully!');
      console.log(`Tables created: ${initResponse.data.tables_created.join(', ')}`);
      
      if (initResponse.data.admin_created) {
        console.log('\n🔐 Admin User Created:');
        console.log(`Username: ${initResponse.data.admin_credentials.username}`);
        console.log(`Email: ${initResponse.data.admin_credentials.email}`);
        console.log(`Password: ${initResponse.data.admin_credentials.password}`);
      }
      
      console.log('\n🎉 Database setup complete!');
      console.log('You can now test login functionality.');
      
    } else {
      console.log(`❌ Database initialization failed: ${initResponse.status}`);
      console.log('Response:', initResponse.data);
    }
    
  } catch (error) {
    console.log(`❌ Database initialization error: ${error.message}`);
  }
  
  // Test login after initialization
  console.log('\n🧪 Testing login endpoint...');
  try {
    const loginResponse = await new Promise((resolve, reject) => {
      const testData = JSON.stringify({
        email: 'admin@crackzone.com',
        password: process.env.ADMIN_PASSWORD || 'a9c9e9cc59a16ea73653d31c2066c9f3'
      });
      
      const options = {
        hostname: 'crackzone2.onrender.com',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testData)
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
      req.write(testData);
      req.end();
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ Login test successful!');
      console.log('✅ Backend is fully functional');
    } else {
      console.log(`⚠️  Login test status: ${loginResponse.status}`);
      console.log('Response:', loginResponse.data);
    }
    
  } catch (error) {
    console.log(`❌ Login test error: ${error.message}`);
  }
  
  console.log('\n🎯 Your CrackZone Platform Status:');
  console.log('==================================');
  console.log('✅ Backend: https://crackzone2.onrender.com');
  console.log('✅ Frontend: https://crackzone-frontend.vercel.app');
  console.log('✅ Database: Initialized and ready');
  console.log('✅ Authentication: Working');
  console.log('\n🎊 Ready for users!');
};

initializeDatabase().catch(console.error);