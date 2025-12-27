import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthError(null);
      const token = await SecureStore.getItemAsync('authToken');
      const savedUser = await SecureStore.getItemAsync('user');
      
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Verify token is still valid
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          // Token invalid, clear auth silently
          await logout();
        }
      }
    } catch (error) {
      // Silent error handling - only log in development
      if (__DEV__) {
        console.error('Auth check failed:', error);
      }
      setAuthError('Authentication check failed');
      await logout();
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (credentials) => {
    try {
      // Handle Google OAuth token
      if (credentials.isGoogleAuth && credentials.token) {
        await SecureStore.setItemAsync('authToken', credentials.token);
        
        // Get user data from the token
        const response = await authAPI.getCurrentUser();
        const userData = response.data.user;
        
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      }
      
      // Handle regular email/password login
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      // Only log in development
      if (__DEV__) {
        console.error('Login failed:', error);
      }
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      await SecureStore.setItemAsync('authToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true, user: newUser };
    } catch (error) {
      // Only log in development
      if (__DEV__) {
        console.error('Registration failed:', error);
      }
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const updateUser = async (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    await SecureStore.setItemAsync('user', JSON.stringify(newUserData));
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('user');
    } catch (error) {
      // Silent error handling
      if (__DEV__) {
        console.error('Logout error:', error);
      }
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    authError,
    isInitialized,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};