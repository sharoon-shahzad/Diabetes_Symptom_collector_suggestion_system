import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // Increased timeout to 60 seconds for ML processing
  withCredentials: true, // Required for CORS with credentials
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const assessDiabetesRisk = async () => {
  const res = await api.post('/assessment/diabetes', {}, { timeout: 60000 });
  return res.data.data;
};

export const fetchMyDiseaseData = async () => {
  const res = await api.get('/users/my-disease-data');
  return res.data.data;
};

export const fetchSymptoms = async () => {
  const res = await api.get('/symptoms/public/Diabetes');
  return res.data.data;
};

export const fetchQuestionsBySymptom = async (symptomId) => {
  const res = await api.get(`/questions/public/symptom/${symptomId}`);
  return res.data.data;
};

export const submitAnswer = async (questionId, answerText) => {
  const res = await api.post('/questions/answer', { questionId, answerText });
  return res.data;
};

export const fetchUserAnswers = async () => {
  const res = await api.get('/users/my-disease-data');
  return res.data.data.answers || [];
};

export default api;