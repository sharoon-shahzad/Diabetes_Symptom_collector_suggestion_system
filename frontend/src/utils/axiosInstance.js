import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://zeeshanasghar02-diavise-backend.hf.space';

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

// Global refresh state — ensures only ONE refresh runs at a time across all concurrent requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: Handle 401 and refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip redirect and token refresh for public paths or when no token exists
    const publicPaths = ['/auth/login', '/auth/register', '/auth/refresh-token', '/public', '/diseases/public', '/symptoms/public'];
    const isPublicPath = publicPaths.some(path => originalRequest.url?.includes(path));
    const hasToken = localStorage.getItem('accessToken');

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicPath && hasToken) {
      if (isRefreshing) {
        // Another refresh is already in flight — wait for it to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_URL}/api/v1/auth/refresh-token`, {}, { withCredentials: true });
        if (res.data?.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          isRefreshing = false;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
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
