import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    if (userInfo) {
      // Set auth token for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userInfo.token}`;
      setUser(userInfo);
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/users/login', { email, password });
      
      // Save user info to local storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set auth token for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  };
  
  const register = async (userData) => {
    try {
      const { data } = await api.post('/users', userData);
      
      // Save user info to local storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Set auth token for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };
  
  const logout = () => {
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  const updateProfile = async (userData) => {
    try {
      const { data } = await api.put('/users/profile', userData);
      
      // Update user info in local storage
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      setUser(data);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Profile update failed';
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;