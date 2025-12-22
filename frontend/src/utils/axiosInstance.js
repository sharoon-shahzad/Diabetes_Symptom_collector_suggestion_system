import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`
});

// Request interceptor: Attach access token
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

// Response interceptor: Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip redirect for certain paths
    const noRedirectPaths = ['/auth/login', '/auth/register', '/auth/refresh-token'];
    const isNoRedirectPath = noRedirectPaths.some(path => originalRequest.url?.includes(path));
    
    if (error.response?.status === 401 && !originalRequest._retry && !isNoRedirectPath) {
      originalRequest._retry = true;
      try {
        // Try to refresh token
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {}, { withCredentials: true });
        if (res.data?.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${res.data.data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        localStorage.removeItem('accessToken');
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = '/signin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 