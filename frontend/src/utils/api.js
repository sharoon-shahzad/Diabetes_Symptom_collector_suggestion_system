import axiosInstance from './axiosInstance';

// Add this interceptor to include the access token in every request
axiosInstance.interceptors.request.use(
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
  const res = await axiosInstance.get(`/diseases`);
  return res.data.data;
}

export async function addDisease(disease) {
  const res = await axiosInstance.post(`/diseases`, disease);
  return res.data.data;
}

export async function updateDisease(id, disease) {
  const res = await axiosInstance.put(`/diseases/${id}`, disease);
  return res.data.data;
}

export async function deleteDisease(id) {
  const res = await axiosInstance.delete(`/diseases/${id}`);
  return res.data;
}

// Removed fetchQuestions and fetchSymptoms using API_BASE as API_BASE is not defined. Use fetchSymptomsByDisease and fetchQuestionsBySymptom instead.

export async function fetchSymptomsByDisease(diseaseId) {
  const res = await axiosInstance.get(`/symptoms/${diseaseId}`);
  return res.data.data || [];
}

export async function addSymptom(diseaseId, symptom) {
  const res = await axiosInstance.post(`/symptoms/${diseaseId}`, symptom);
  return res.data.data;
}

export async function updateSymptom(id, symptom) {
  const res = await axiosInstance.put(`/symptoms/${id}`, symptom);
  return res.data.data;
}

export async function deleteSymptom(id) {
  const res = await axiosInstance.delete(`/symptoms/${id}`);
  return res.data;
}

export async function fetchQuestionsBySymptom(symptomId) {
  const res = await axiosInstance.get(`/questions/questions/symptom/${symptomId}`);
  // Accept both direct array and { data: array }
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data.data)) return res.data.data;
  return [];
}

export async function addQuestion(symptomId, question) {
  const res = await axiosInstance.post(`/questions/questions/symptom/${symptomId}`, question);
  return res.data.data;
}

export async function updateQuestion(id, question) {
  const res = await axiosInstance.put(`/questions/questions/${id}`, question);
  return res.data.data;
}

export async function deleteQuestion(id) {
  const res = await axiosInstance.delete(`/questions/questions/${id}`);
  return res.data;
}

export async function fetchMyDiseaseData() {
  const res = await axiosInstance.get(`/users/my-disease-data`);
  return res.data.data;
}

// Disease data editing functions
export async function fetchDiseaseDataForEditing() {
  const res = await axiosInstance.get(`/users/disease-data-for-editing`);
  return res.data.data;
}

export async function updateDiseaseDataAnswer(questionId, answerText) {
  const res = await axiosInstance.put(`/users/update-disease-data-answer`, {
    questionId,
    answerText
  });
  return res.data;
}

export async function submitDiseaseData() {
  const res = await axiosInstance.post(`/users/submit-disease-data`);
  return res.data;
} 

export async function assessDiabetesRisk() {
  const res = await axiosInstance.post(`/assessment/diabetes`);
  return res.data.data;
}

// CMS API Functions
// Categories
export async function fetchCategories(status = 'active') {
  const res = await axiosInstance.get(`/categories?status=${status}`);
  return res.data.data;
}

export async function fetchCategory(id) {
  const res = await axiosInstance.get(`/categories/${id}`);
  return res.data.data;
}

export async function createCategory(category) {
  const res = await axiosInstance.post(`/categories`, category);
  return res.data.data;
}

export async function updateCategory(id, category) {
  const res = await axiosInstance.put(`/categories/${id}`, category);
  return res.data.data;
}

export async function deleteCategory(id) {
  const res = await axiosInstance.delete(`/categories/${id}`);
  return res.data;
}

export async function fetchCategoryStats() {
  const res = await axiosInstance.get(`/categories/stats`);
  return res.data.data;
}

// Content
export async function fetchContent(params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const res = await axiosInstance.get(`/content?${queryParams}`);
  return res.data;
}

export async function fetchContentById(id) {
  const res = await axiosInstance.get(`/content/${id}`);
  return res.data.data;
}

export async function fetchContentBySlug(slug) {
  const res = await axiosInstance.get(`/content/slug/${slug}`);
  return res.data.data;
}

export async function createContent(content) {
  const res = await axiosInstance.post(`/content`, content);
  return res.data.data;
}

export async function updateContent(id, content) {
  const res = await axiosInstance.put(`/content/${id}`, content);
  return res.data.data;
}

export async function deleteContent(id) {
  const res = await axiosInstance.delete(`/content/${id}`);
  return res.data;
}

export async function fetchContentStats() {
  const res = await axiosInstance.get(`/content/stats`);
  return res.data.data;
}

export async function fetchRelatedContent(id) {
  const res = await axiosInstance.get(`/content/${id}/related`);
  return res.data.data;
}