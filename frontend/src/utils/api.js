import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

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