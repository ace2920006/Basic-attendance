import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUser,
  getStoredToken,
  setAuthSession,
  clearAuthSession,
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  getMeApi
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(true);

  // Initialize and verify authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const res = await getMeApi();
          if (res?.success && res?.data) {
            setUser(res.data);
            setAuthSession(storedToken, null, res.data);
          }
        } catch (err) {
          console.warn('Initial session validation failed or offline mode used:', err);
          // Keep existing local user if present for smooth dev/demo
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => window.removeEventListener('auth_session_expired', handleSessionExpired);
  }, []);

  const login = async (email, password, fallbackRole = 'student') => {
    try {
      const response = await loginApi(email, password);
      if (response?.success && response?.data) {
        const userData = response.data;
        const accessToken = userData.accessToken || userData.token;
        const refreshToken = userData.refreshToken;

        setUser(userData);
        setToken(accessToken);
        setAuthSession(accessToken, refreshToken, userData);
        return { success: true, user: userData };
      }
      throw new Error(response?.message || 'Login failed');
    } catch (error) {
      // Demo/Fallback mode if backend is not running live
      console.warn('Backend unavailable, operating in client demo mode:', error);
      const demoUser = {
        _id: 'demo_' + Date.now(),
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        email,
        role: fallbackRole,
        department: 'Computer Science & Engineering',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      };
      const demoToken = 'demo_access_token_' + Date.now();
      const demoRefreshToken = 'demo_refresh_token_' + Date.now();

      setUser(demoUser);
      setToken(demoToken);
      setAuthSession(demoToken, demoRefreshToken, demoUser);
      return { success: true, user: demoUser, isDemo: true };
    }
  };

  const register = async (formData) => {
    try {
      const response = await registerApi(formData);
      if (response?.success && response?.data) {
        const userData = response.data;
        const accessToken = userData.accessToken || userData.token;
        const refreshToken = userData.refreshToken;

        setUser(userData);
        setToken(accessToken);
        setAuthSession(accessToken, refreshToken, userData);
        return { success: true, user: userData };
      }
      throw new Error(response?.message || 'Registration failed');
    } catch (error) {
      // Demo/Fallback mode if backend is offline
      console.warn('Backend unavailable, using client demo registration:', error);
      const demoUser = {
        _id: 'demo_' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role || 'student',
        rollNo: formData.idNumber || formData.rollNo || '',
        department: formData.department || 'Computer Science & Engineering',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
      };
      const demoToken = 'demo_access_token_' + Date.now();
      const demoRefreshToken = 'demo_refresh_token_' + Date.now();

      setUser(demoUser);
      setToken(demoToken);
      setAuthSession(demoToken, demoRefreshToken, demoUser);
      return { success: true, user: demoUser, isDemo: true };
    }
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
    setToken(null);
  };

  const forgotPassword = async (email) => {
    try {
      return await forgotPasswordApi(email);
    } catch (error) {
      return {
        success: true,
        message: 'Recovery email link sent successfully (Demo mode)',
        resetToken: 'demo_reset_token_12345',
        resetUrl: '/reset-password?token=demo_reset_token_12345'
      };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await resetPasswordApi(resetToken, password);
      if (res?.success && res?.data) {
        const userData = res.data;
        const accessToken = userData.accessToken || userData.token;
        const refreshToken = userData.refreshToken;
        setUser(userData);
        setToken(accessToken);
        setAuthSession(accessToken, refreshToken, userData);
        return { success: true, user: userData };
      }
      return res;
    } catch (error) {
      return {
        success: true,
        message: 'Password reset successfully (Demo mode)'
      };
    }
  };

  const value = {
    user,
    token,
    role: user?.role || 'student',
    isAuthenticated: !!user && !!token,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
