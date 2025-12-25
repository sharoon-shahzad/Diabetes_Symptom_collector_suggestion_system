import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBackendURL } from './ipDiscovery';
import config from '../config';

// Create a default axios instance that will be updated
const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track if we've already logged out to prevent infinite loops
let isLoggingOut = false;

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;
      console.log('🔐 401 Unauthorized - Session expired. Please login again.');
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      // Emit custom event for AuthContext to handle
      if (global.handleUnauthorized) {
        global.handleUnauthorized();
      }
      isLoggingOut = false;
    }
    return Promise.reject(error);
  }
);

// Initialize API with dynamic IP discovery
let isInitialized = false;

async function initializeAPI() {
  if (isInitialized) {
    return api;
  }

  try {
    console.log('🔍 Initializing API with IP discovery...');
    
    // Try configured IP first
    if (config.BACKEND_IP) {
      const configuredURL = config.API_URL;
      console.log('📝 Testing configured IP:', configuredURL);
      
      try {
        const response = await axios.get(`${configuredURL.replace('/api/v1', '')}/api/v1/server-info`, {
          timeout: config.DISCOVERY_TIMEOUT
        });
        
        if (response.data && response.data.success) {
          api.defaults.baseURL = configuredURL;
          console.log('✅ API initialized with configured URL:', configuredURL);
          isInitialized = true;
          return api;
        }
      } catch (error) {
        console.log('⚠️ Configured IP not reachable, trying auto-discovery...');
      }
    }
    
    // Fall back to auto-discovery if enabled
    if (config.ENABLE_AUTO_DISCOVERY) {
      const backendURL = await getBackendURL(true); // Use full scan
      console.log('📡 API Base URL:', backendURL);
      api.defaults.baseURL = backendURL;
      isInitialized = true;
      return api;
    }
    
    throw new Error('Cannot connect to backend and auto-discovery is disabled');
  } catch (error) {
    console.error('❌ Failed to initialize API:', error.message);
    isInitialized = false;
    throw new Error(
      'Cannot connect to backend server.\n\n' +
      'Please ensure:\n' +
      '• Backend server is running on port 5000\n' +
      '• Both devices are on the same WiFi network\n' +
      '• Firewall is not blocking connections\n' +
      '• Update BACKEND_IP in config.js if needed\n\n' +
      'Error: ' + error.message
    );
  }
}

// Initialize immediately on module load
const initPromise = initializeAPI();

// Get API instance (wait for initialization if needed)
async function getAPI() {
  await initPromise;
  return api;
}

export const assessDiabetesRisk = async () => {
  await initPromise; // Ensure API is initialized
  const res = await api.post('/assessment/diabetes', {}, { timeout: 60000 });
  return res.data.data;
};

export const fetchMyDiseaseData = async () => {
  await initPromise;
  const res = await api.get('/users/my-disease-data');
  return res.data.data;
};

export const fetchSymptoms = async () => {
  await initPromise;
  const res = await api.get('/symptoms/public/Diabetes');
  return res.data.data;
};

export const fetchQuestionsBySymptom = async (symptomId) => {
  await initPromise;
  const res = await api.get(`/questions/public/symptom/${symptomId}`);
  return res.data.data;
};

export const submitAnswer = async (questionId, answerText) => {
  await initPromise;
  const res = await api.post('/questions/answer', { questionId, answerText });
  return res.data;
};

export const fetchUserAnswers = async () => {
  await initPromise;
  const res = await api.get('/users/my-disease-data');
  const data = res.data.data;
  
  // Convert grouped symptoms structure to flat array of answers
  if (!data.symptoms || !Array.isArray(data.symptoms)) {
    return [];
  }
  
  const flatAnswers = [];
  data.symptoms.forEach(symptom => {
    if (symptom.questions && Array.isArray(symptom.questions)) {
      symptom.questions.forEach(q => {
        flatAnswers.push({
          question_id: q.question_id,
          answer: q.answer,
          createdAt: q.date
        });
      });
    }
  });
  
  return flatAnswers;
};

export const sendChatMessage = async (message, history = []) => {
  await initPromise;
  const res = await api.post('/chat/complete', {
    message,
    history
  }, { timeout: 60000 });
  return res.data;
};

// Feedback API functions
export const fetchAllFeedback = async (page = 1, limit = 10) => {
  await initPromise;
  const res = await api.get('/feedback', { params: { page, limit } });
  return res.data.data;
};

export const fetchFeedbackStats = async () => {
  await initPromise;
  const res = await api.get('/feedback/stats');
  return res.data.data;
};

export const fetchMyFeedback = async () => {
  await initPromise;
  const res = await api.get('/feedback/my-feedback');
  return res.data.data;
};

export const submitFeedback = async (feedbackData) => {
  await initPromise;
  const res = await api.post('/feedback', feedbackData);
  return res.data.data;
};

export const updateFeedback = async (id, feedbackData) => {
  await initPromise;
  const res = await api.put(`/feedback/${id}`, feedbackData);
  return res.data.data;
};

export const deleteFeedback = async (id) => {
  await initPromise;
  const res = await api.delete(`/feedback/${id}`);
  return res.data;
};

export const changePassword = async (passwordData) => {
  await initPromise;
  const res = await api.post('/auth/change-password', passwordData);
  return res.data;
};

// Export API instance and helper function
export { getAPI, initPromise };
export default api;