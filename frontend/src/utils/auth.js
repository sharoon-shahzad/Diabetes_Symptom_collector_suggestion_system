import axiosInstance from './axiosInstance';
import axios from 'axios';
import { clearPermissionsCache } from './permissions';

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
  // Clear permission cache on logout
  clearPermissionsCache();
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

// NOTE: Token refresh interceptor is handled in axiosInstance.js
// Do NOT add duplicate interceptors here to avoid infinite loops 