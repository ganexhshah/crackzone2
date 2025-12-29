// Check Google OAuth configuration status
const https = require('https');

const checkGoogleOAuth = async () => {
  console.log('🔐 Checking Google OAuth Configuration');
  console.log('====================================');
  
  const backendUrl = 'https://crackzone2.onrender.com';
  const frontendUrl = 'https://crackzone-frontend.vercel.app';
  
  console.log(`\n🌐 Frontend: ${frontendUrl}`);
  console.log(`🖥️  Backend:  ${backendUrl}`);
  
  // Test Google OAuth endpoint
  console.log('\n1️⃣ Testing Google OAuth endpoint...');
  try {
    const oauthResponse = await new Promise((resolve, reject) => {
      https.get(`${backendUrl}/api/auth/google`, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        if (res.statusCode === 302) {
          const location = res.headers.location;
          if (location && location.includes('accounts.google.com')) {
            console.log('✅ Google OAuth redirect working');
            console.log(`Redirects to: ${location.substring(0, 50)}...`);
          } else {
            console.log('⚠️  Unexpected redirect location');
          }
        } else if (res.statusCode === 400) {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.error === 'Google OAuth not configured') {
                console.log('❌ Google OAuth not configured');
                console.log('   Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
              }
            } catch (e) {
              console.log('❌ OAuth configuration error');
            }
          });
        }
        resolve({ status: res.statusCode, headers: res.headers });
      }).on('error', reject);
    });
    
  } catch (error) {
    console.log(`❌ OAuth endpoint error: ${error.message}`);
  }
  
  // Check if frontend has Google client ID
  console.log('\n2️⃣ Checking frontend configuration...');
  try {
    const frontendResponse = await new Promise((resolve, reject) => {
      https.get(frontendUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      }).on('error', reject);
    });
    
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend is accessible');
      // Note: Can't check environment variables from client-side
      console.log('ℹ️  Frontend environment variables need to be checked in Vercel dashboard');
    } else {
      console.log(`⚠️  Frontend status: ${frontendResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Frontend check error: ${error.message}`);
  }
  
  console.log('\n📋 Google OAuth Setup Status:');
  console.log('=============================');
  
  console.log('\n🔧 Required Setup Steps:');
  console.log('1. Create Google Cloud Console project');
  console.log('2. Enable Google+ API');
  console.log('3. Create OAuth 2.0 credentials');
  console.log('4. Set authorized origins: https://crackzone-frontend.vercel.app');
  console.log('5. Set redirect URI: https://crackzone2.onrender.com/api/auth/google/callback');
  console.log('6. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Render');
  console.log('7. Add VITE_GOOGLE_CLIENT_ID to Vercel');
  
  console.log('\n📖 Detailed Guide:');
  console.log('See GOOGLE_OAUTH_PRODUCTION_SETUP.md for complete instructions');
  
  console.log('\n🎯 Test URLs:');
  console.log(`- OAuth Start: ${backendUrl}/api/auth/google`);
  console.log(`- OAuth Callback: ${backendUrl}/api/auth/google/callback`);
  console.log(`- Login Page: ${frontendUrl}/login`);
};

checkGoogleOAuth().catch(console.error);