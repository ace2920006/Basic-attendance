const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getStoredToken = () => localStorage.getItem('token');
export const getStoredRefreshToken = () => localStorage.getItem('refreshToken');
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

export const setAuthSession = (token, refreshToken, user) => {
  if (token) localStorage.setItem('token', token);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (user) localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

export const apiRequest = async (endpoint, options = {}, isRetry = false) => {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      // Attempt token refresh
      const refreshed = await refreshTokenApi();
      if (refreshed?.success) {
        return apiRequest(endpoint, options, true);
      } else {
        clearAuthSession();
        window.dispatchEvent(new Event('auth_session_expired'));
      }
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const loginApi = async (email, password) => {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

export const registerApi = async (userData) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const logoutApi = async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch (err) {
    // Continue clearing local session even if server request fails
  } finally {
    clearAuthSession();
  }
};

export const refreshTokenApi = async () => {
  const rfToken = getStoredRefreshToken();
  if (!rfToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rfToken })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      setAuthSession(data.data.accessToken || data.data.token, data.data.refreshToken, null);
      return data;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }
  return null;
};

export const forgotPasswordApi = async (email) => {
  return apiRequest('/auth/forgotpassword', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const resetPasswordApi = async (token, password) => {
  return apiRequest(`/auth/resetpassword/${token}`, {
    method: 'PUT',
    body: JSON.stringify({ password, resetToken: token })
  });
};

export const getMeApi = async () => {
  return apiRequest('/auth/me', { method: 'GET' });
};
