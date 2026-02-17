/**
 * API Client with Axios
 * Handles authentication, token refresh, and request/response interceptors
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getApiUrl, AUTH_CONFIG } from '@utils/constants';
import { secureStorage } from '@utils/storage';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if a token refresh is in progress
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get token from secure storage
    const token = await secureStorage.getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const response = await axios.post(
          `${getApiUrl()}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            timeout: 10000,
          }
        );

        const { accessToken } = response.data.data;

        // Save new token
        await secureStorage.setAccessToken(accessToken);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Process queued requests
        processQueue(null, accessToken);

        isRefreshing = false;

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Token refresh failed - clear tokens and reject
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        await secureStorage.clearAll();

        // Notify app to redirect to login (will be handled by Redux)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Error Handler
 */
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response) {
      // Server responded with error
      const message = 
        axiosError.response.data?.message || 
        axiosError.response.data?.error ||
        'An error occurred';
      return message;
    } else if (axiosError.request) {
      // Request made but no response
      return 'Network error. Please check your connection.';
    }
  }
  
  return error?.message || 'An unexpected error occurred';
};

/**
 * Check if error is unauthorized
 */
export const isUnauthorizedError = (error: any): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

/**
 * Check if error is network error
 */
export const isNetworkError = (error: any): boolean => {
  return axios.isAxiosError(error) && !error.response;
};

/**
 * RTK Query base query helper
 * For use with RTK Query APIs (feature-level createApi files).
 * Wraps fetchBaseQuery with automatic token refresh on 401.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiUrl(),
  prepareHeaders: async (headers) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include', // For refresh token cookies
});

/**
 * Enhanced base query with automatic re-authentication.
 * Catches 401, refreshes the access token via /auth/refresh-token,
 * stores the new token, and retries the original request.
 */
export const baseQuery: typeof rawBaseQuery = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt to refresh the token
    try {
      const refreshResponse = await axios.post(
        `${getApiUrl()}/auth/refresh-token`,
        {},
        { withCredentials: true, timeout: 10000 }
      );

      const newToken = refreshResponse.data?.data?.accessToken;

      if (newToken) {
        // Persist new token
        await secureStorage.setAccessToken(newToken);

        // Retry original request with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh succeeded but no token — clear auth state
        await secureStorage.clearAll();
      }
    } catch {
      // Refresh failed entirely — clear tokens so user gets redirected to login
      await secureStorage.clearAll();
    }
  }

  return result;
};

export default apiClient;
