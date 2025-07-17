import axios from 'axios';

const API_URL = 'http://localhost:5000';

export async function refreshToken() {
  try {
    const res = await axios.post(`${API_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
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
  await axios.get(`${API_URL}/api/auth/logout`, { withCredentials: true });
  localStorage.removeItem('accessToken');
}

export async function getCurrentUser() {
  const token = localStorage.getItem('accessToken');
  const res = await axios.get(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data.data.user;
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
      // If refresh fails, redirect to login
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
); 