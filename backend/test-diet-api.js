// Quick test script to check if diet plan routes are accessible
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

// You'll need to update these with a valid token from a logged-in user
const getToken = () => {
  // For testing, we need a valid JWT token
  // This should be taken from the browser's localStorage after login
  return localStorage?.getItem?.('accessToken') || '';
};

const testDietPlanRoutes = async () => {
  try {
    console.log('🧪 Testing Diet Plan Routes...\n');

    // Test 1: Check region coverage
    console.log('Test 1: Check Region Coverage');
    console.log('Endpoint: GET /diet-plan/region-coverage');
    try {
      const response = await axios.get(`${BASE_URL}/diet-plan/region-coverage`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Get diet history
    console.log('\nTest 2: Get Diet History');
    console.log('Endpoint: GET /diet-plan/history');
    try {
      const response = await axios.get(`${BASE_URL}/diet-plan/history?limit=5`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Generate diet plan
    console.log('\nTest 3: Generate Diet Plan');
    console.log('Endpoint: POST /diet-plan/generate');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    try {
      const response = await axios.post(`${BASE_URL}/diet-plan/generate`, 
        { target_date: dateString },
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          }
        }
      );
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.error('❌ Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Test suite error:', error);
  }
};

testDietPlanRoutes();
