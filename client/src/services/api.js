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

// --- Admin Analytics API ---
export const getAdminAnalyticsApi = async () => {
  return apiRequest('/attendance/analytics', { method: 'GET' });
};

// --- Department API ---
export const getDepartmentsApi = async () => {
  return apiRequest('/departments', { method: 'GET' });
};

export const createDepartmentApi = async (deptData) => {
  return apiRequest('/departments', {
    method: 'POST',
    body: JSON.stringify(deptData)
  });
};

export const deleteDepartmentApi = async (id) => {
  return apiRequest(`/departments/${id}`, { method: 'DELETE' });
};

// --- Course API ---
export const getCoursesApi = async (department) => {
  const query = department ? `?department=${encodeURIComponent(department)}` : '';
  return apiRequest(`/courses${query}`, { method: 'GET' });
};

export const createCourseApi = async (courseData) => {
  return apiRequest('/courses', {
    method: 'POST',
    body: JSON.stringify(courseData)
  });
};

export const deleteCourseApi = async (id) => {
  return apiRequest(`/courses/${id}`, { method: 'DELETE' });
};

// --- Subject API ---
export const getSubjectsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.department) queryParams.append('department', params.department);
  if (params.course) queryParams.append('course', params.course);
  if (params.teacherId) queryParams.append('teacherId', params.teacherId);
  if (params.search) queryParams.append('search', params.search);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/subjects${queryStr}`, { method: 'GET' });
};

export const createSubjectApi = async (subjectData) => {
  return apiRequest('/subjects', {
    method: 'POST',
    body: JSON.stringify(subjectData)
  });
};

export const assignTeacherToSubjectApi = async (subjectId, teacherId) => {
  return apiRequest(`/subjects/${subjectId}/assign-teacher`, {
    method: 'POST',
    body: JSON.stringify({ teacherId })
  });
};

export const assignStudentsToSubjectApi = async (subjectId, studentIds) => {
  return apiRequest(`/subjects/${subjectId}/assign-students`, {
    method: 'POST',
    body: JSON.stringify({ studentIds })
  });
};

export const deleteSubjectApi = async (id) => {
  return apiRequest(`/subjects/${id}`, { method: 'DELETE' });
};

// --- User Management API (Teachers & Students) ---
export const getUsersApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.role) queryParams.append('role', params.role);
  if (params.department) queryParams.append('department', params.department);
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/users${queryStr}`, { method: 'GET' });
};

export const createUserApi = async (userData) => {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const updateUserApi = async (id, userData) => {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
};

export const assignSubjectsToUserApi = async (userId, subjectIds) => {
  return apiRequest(`/users/${userId}/assign-subjects`, {
    method: 'POST',
    body: JSON.stringify({ subjectIds })
  });
};

export const deleteUserApi = async (id) => {
  return apiRequest(`/users/${id}`, { method: 'DELETE' });
};

// --- Leave Management API ---
export const applyLeaveApi = async (leaveData) => {
  return apiRequest('/leaves', {
    method: 'POST',
    body: JSON.stringify(leaveData)
  });
};

export const getMyLeavesApi = async () => {
  return apiRequest('/leaves/my', { method: 'GET' });
};

export const getAllLeavesApi = async (status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiRequest(`/leaves${query}`, { method: 'GET' });
};

export const updateLeaveStatusApi = async (id, statusData) => {
  return apiRequest(`/leaves/${id}`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  });
};


