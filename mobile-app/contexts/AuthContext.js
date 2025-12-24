import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getBackendURL, getCachedIP } from '../utils/ipDiscovery';
import config from '../config';

// Dynamic API URL - will be set after IP discovery
let API_BASE_URL = null;

// Create axios instance that will be configured dynamically
const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: false,
});

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiReady, setApiReady] = useState(false);

  // Initialize API URL on mount
  useEffect(() => {
    const initializeAPI = async () => {
      try {
        console.log('🔍 Initializing backend connection...');
        
        // Try configured IP first
        if (config.BACKEND_IP) {
          const configuredURL = config.API_URL;
          console.log('📝 Testing configured IP:', configuredURL);
          
          try {
            const response = await axios.get(`${configuredURL.replace('/api/v1', '')}/api/v1/server-info`, {
              timeout: config.DISCOVERY_TIMEOUT
            });
            
            if (response.data && response.data.success) {
              API_BASE_URL = configuredURL;
              api.defaults.baseURL = configuredURL;
              console.log('✅ Using configured backend URL:', configuredURL);
              setApiReady(true);
              return;
            }
          } catch (error) {
            console.log('⚠️ Configured IP not reachable, trying auto-discovery...');
          }
        }
        
        // Fall back to auto-discovery if enabled
        if (config.ENABLE_AUTO_DISCOVERY) {
          console.log('🔍 Starting auto-discovery...');
          const backendURL = await getBackendURL(true); // Full discovery
          API_BASE_URL = backendURL;
          api.defaults.baseURL = backendURL;
          console.log('✅ Backend URL set to:', backendURL);
          setApiReady(true);
        } else {
          throw new Error('Cannot connect to backend and auto-discovery is disabled');
        }
      } catch (error) {
        console.error('❌ Failed to connect to backend:', error.message);
        console.error('💡 Please update BACKEND_IP in config.js with your computer\'s IP address');
        setApiReady(false);
        setLoading(false);
      }
    };
    initializeAPI();
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      if (!apiReady) return; // Wait for API to be ready
      
      const storedToken = await AsyncStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        // Fetch user
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data.data);
        } catch (err) {
          await AsyncStorage.removeItem('accessToken');
          setToken(null);
        }
      }
      setLoading(false);
    };
    loadToken();
  }, [apiReady]);

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login...');
      console.log('📡 API URL:', api.defaults.baseURL);
      
      const res = await api.post('/auth/login', { email, password });
      
      console.log('✅ Login successful!');
      console.log('Response status:', res.status);
      
      const { accessToken, user: userData } = res.data.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      setUser(userData);
      
      // Set header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
    } catch (error) {
      console.error('❌ Login failed:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Is network error:', !error.response);
      
      if (!error.response) {
        const cachedIP = await getCachedIP();
        console.error('⚠️ Cannot reach server at:', api.defaults.baseURL);
        console.error('Please ensure:');
        console.error('1. Backend server is running on port 5000');
        console.error(`2. Your computer IP is ${cachedIP || 'correct'}`);
        console.error('3. Both devices are on the same WiFi network');
        console.error('4. Firewall is not blocking port 5000');
      }
      
      if (error.code === 'ECONNABORTED') {
        console.error('Timeout occurred. Possible causes: Server not running, wrong IP, firewall blocking, or network issues.');
      }
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request was made but no response received');
      }
      throw error; // Re-throw to let caller handle
    }
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      // Clear tokens from storage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      
      // Clear axios headers
      delete api.defaults.headers.common['Authorization'];
      
      // Clear state
      setToken(null);
      setUser(null);
      
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if there's an error, clear the state
      setToken(null);
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  };

  // Set up global handler for 401 errors
  useEffect(() => {
    global.handleUnauthorized = () => {
      console.log('⚠️ Unauthorized access detected - logging out');
      logout();
    };
    return () => {
      delete global.handleUnauthorized;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, register, logout, loading, apiReady }}>
      {children}
    </AuthContext.Provider>
  );
};