import axiosInstance from './axiosInstance';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
}
export const getCurrentUser = async () => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    
    // Make authenticated request to get current user
    const res = await axiosInstance.get('/auth/profile', {
      withCredentials: true,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (res.data && res.data.data && res.data.data.user) {
      // Store userId in localStorage for future use
      localStorage.setItem('userId', res.data.data.user._id);
      console.log('Current user fetched successfully:', res.data.data.user);
      return res.data.data.user;
    } else {
      console.log('User data incomplete, clearing auth data');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
      return null;
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Clear invalid tokens on 401 errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication token invalid, clearing auth data');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userId');
    }
    return null;
  }
};
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
      // If refresh fails, redirect to login
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);