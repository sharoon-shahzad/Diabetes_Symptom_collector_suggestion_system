import axios from 'axios';

// Add this interceptor to include the access token in every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const API_URL = 'http://localhost:5000/api/v1';

export async function fetchDiseases() {
  const res = await axios.get(`${API_URL}/diseases`);
  return res.data.data;
}

export async function addDisease(disease) {
  const res = await axios.post(`${API_URL}/diseases`, disease);
  return res.data.data;
}

export async function updateDisease(id, disease) {
  const res = await axios.put(`${API_URL}/diseases/${id}`, disease);
  return res.data.data;
}

export async function deleteDisease(id) {
  const res = await axios.delete(`${API_URL}/diseases/${id}`);
  return res.data;
}

export const fetchQuestions = async (diseaseId) => {
  try {
    const res = await axios.get(`${API_BASE}/questions/${diseaseId}`);
    return res.data;
  } catch (err) {
    throw new Error('Failed to fetch questions');
  }
};

export const fetchSymptoms = async (diseaseId) => {
  try {
    const res = await axios.get(`${API_BASE}/symptoms/${diseaseId}`);
    return res.data;
  } catch (err) {
    throw new Error('Failed to fetch symptoms');
  }
};

export async function fetchSymptomsByDisease(diseaseId) {
  const res = await axios.get(`${API_URL}/symptoms/${diseaseId}`);
  return res.data.data;
}

export async function addSymptom(diseaseId, symptom) {
  const res = await axios.post(`${API_URL}/symptoms/${diseaseId}`, symptom);
  return res.data.data;
}

export async function updateSymptom(id, symptom) {
  const res = await axios.put(`${API_URL}/symptoms/${id}`, symptom);
  return res.data.data;
}

export async function deleteSymptom(id) {
  const res = await axios.delete(`${API_URL}/symptoms/${id}`);
  return res.data;
}

export async function fetchQuestionsBySymptom(symptomId) {
  const res = await axios.get(`${API_URL}/onboarding/questions/symptom/${symptomId}`);
  return res.data.data;
}

export async function addQuestion(symptomId, question) {
  const res = await axios.post(`${API_URL}/onboarding/questions/symptom/${symptomId}`, question);
  return res.data.data;
}

export async function updateQuestion(id, question) {
  const res = await axios.put(`${API_URL}/onboarding/questions/${id}`, question);
  return res.data.data;
}

export async function deleteQuestion(id) {
  const res = await axios.delete(`${API_URL}/onboarding/questions/${id}`);
  return res.data;
} 