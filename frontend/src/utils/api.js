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

// Removed fetchQuestions and fetchSymptoms using API_BASE as API_BASE is not defined. Use fetchSymptomsByDisease and fetchQuestionsBySymptom instead.

export async function fetchSymptomsByDisease(diseaseId) {
  const res = await axios.get(`${API_URL}/questions/symptoms/${diseaseId}`);
  // Accept both direct array and { data: array }
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  return [];
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
  const res = await axios.get(`${API_URL}/questions/questions/symptom/${symptomId}`);
  // Accept both direct array and { data: array }
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export async function addQuestion(symptomId, question) {
  const res = await axios.post(`${API_URL}/questions/questions/symptom/${symptomId}`, question);
  return res.data.data;
}

export async function updateQuestion(id, question) {
  const res = await axios.put(`${API_URL}/questions/questions/${id}`, question);
  return res.data.data;
}

export async function deleteQuestion(id) {
  const res = await axios.delete(`${API_URL}/questions/questions/${id}`);
  return res.data;
}

export async function fetchMyDiseaseData() {
  const res = await axios.get(`${API_URL}/users/my-disease-data`);
  return res.data.data;
}

// Disease data editing functions
export async function fetchDiseaseDataForEditing() {
  const res = await axios.get(`${API_URL}/users/disease-data-for-editing`);
  return res.data.data;
}

export async function updateDiseaseDataAnswer(questionId, answerText) {
  const res = await axios.put(`${API_URL}/users/update-disease-data-answer`, {
    questionId,
    answerText
  });
  return res.data;
}

export async function submitDiseaseData() {
  const res = await axios.post(`${API_URL}/users/submit-disease-data`);
  return res.data;
} 