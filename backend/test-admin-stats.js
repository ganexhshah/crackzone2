require('dotenv').config();
const axios = require('axios');

async function testAdminStats() {
  try {
    console.log('Testing admin login...');
    
    // First login to get admin token
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    
    console.log('Login successful, token received');
    const token = loginResponse.data.token;
    
    // Test stats endpoint
    console.log('Testing admin stats endpoint...');
    const statsResponse = await axios.get('http://localhost:5000/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Stats response:', statsResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAdminStats();