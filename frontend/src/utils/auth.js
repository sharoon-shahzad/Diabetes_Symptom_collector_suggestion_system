import axiosInstance from './axiosInstance';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export async function refreshToken() {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {}, { withCredentials: true });
    if (res.data?.data?.accessToken) {
      localStorage.setItem('accessToken', res.data.data.accessToken);
      return res.data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logout() {
  await axiosInstance.get(`/auth/logout`, { withCredentials: true });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('roles');
}
export async function getCurrentUser() {
  try {
    const res = await axiosInstance.get(`/auth/profile`);
    console.log('Current user fetched successfully:', res.data.data.user);
    return res.data.data.user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    throw err;
  }
}
// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      }
      // If refresh fails, clear any stale token and send user to 404/unauthorized page
      localStorage.removeItem('accessToken');
      localStorage.removeItem('roles');
      window.location.href = '/not-found';
    }
    return Promise.reject(error);
  }
); 