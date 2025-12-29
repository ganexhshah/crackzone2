// Setup production database with all necessary tables
const https = require('https');

const runDatabaseSetup = async () => {
  console.log('🗄️  Setting up Production Database');
  console.log('==================================');
  
  const backendUrl = 'https://crackzone2.onrender.com';
  
  // Test database connection first
  console.log('\n1️⃣ Testing database connection...');
  try {
    const healthResponse = await new Promise((resolve, reject) => {
      https.get(`${backendUrl}/health`, (res) => {
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
    
    if (healthResponse.status === 200 && healthResponse.data.database === 'connected') {
      console.log('✅ Database connection verified');
    } else {
      console.log('❌ Database connection failed');
      return;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to backend: ${error.message}`);
    return;
  }
  
  console.log('\n2️⃣ Database setup needed...');
  console.log('The database tables need to be created.');
  console.log('This requires running migration scripts on the server.');
  
  console.log('\n📋 Required Actions:');
  console.log('===================');
  console.log('1. The database is connected but tables may not exist');
  console.log('2. We need to run database migrations');
  console.log('3. This can be done through Render console or by adding a migration endpoint');
  
  console.log('\n🔧 Solutions:');
  console.log('=============');
  console.log('Option 1: Add a setup endpoint to the backend');
  console.log('Option 2: Run migrations through Render console');
  console.log('Option 3: Create tables manually');
  
  console.log('\n⚡ Quick Fix:');
  console.log('I will create a setup endpoint that can be called once to initialize the database.');
};

runDatabaseSetup().catch(console.error);