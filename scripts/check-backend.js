const axios = require('axios');

const API_URL = 'http://localhost:4000/api';

async function checkBackend() {
  console.log('🔍 Checking backend connection...');
  console.log('API URL:', API_URL);
  
  try {
    // Test basic health endpoint
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test auth endpoints
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      console.log('✅ Login test passed');
    } catch (loginError) {
      console.log('ℹ️ Login test (expected to work with seeded data):', loginError.response?.data || loginError.message);
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Solution: Make sure the NestJS backend is running on port 4000');
      console.error('   Run: npm run start:dev (in the backend directory)');
    }
    
    process.exit(1);
  }
}

checkBackend();