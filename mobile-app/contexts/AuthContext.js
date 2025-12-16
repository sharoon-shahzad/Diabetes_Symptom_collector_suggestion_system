import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
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
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      console.log('✅ Login successful!');
      console.log('Response status:', res.status);
      console.log('Response data:', res.data);
      const { accessToken, user: userData } = res.data.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
      console.error('❌ Login failed with Network Error:');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Is network error:', !error.response);
      if (error.code === 'ECONNABORTED') {
        console.error('Timeout occurred. Possible causes: Server not running, wrong IP, firewall blocking, or network issues.');
      }
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request details:', error.request);
      } else {
        console.error('Config:', error.config);
      }
      throw error; // Re-throw to let caller handle
    }
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};