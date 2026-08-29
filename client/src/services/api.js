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
      credentials: 'include',
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

// --- File Upload API ---
export const uploadFileApi = async (file) => {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    headers,
    body: formData
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'File upload failed');
  }
  return data;
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

// --- Class Management API ---
export const getClassesApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.instructorId) queryParams.append('instructorId', params.instructorId);
  if (params.department) queryParams.append('department', params.department);
  if (params.search) queryParams.append('search', params.search);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/classes${queryStr}`, { method: 'GET' });
};

export const createClassApi = async (classData) => {
  return apiRequest('/classes', {
    method: 'POST',
    body: JSON.stringify(classData)
  });
};

export const deleteClassApi = async (id) => {
  return apiRequest(`/classes/${id}`, { method: 'DELETE' });
};

// --- Attendance Management API ---
export const markAttendanceApi = async (attendanceData) => {
  return apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  });
};

export const markBulkAttendanceApi = async (bulkData) => {
  return apiRequest('/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify(bulkData)
  });
};

export const getAttendanceRecordsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.subject) queryParams.append('subject', params.subject);
  if (params.status) queryParams.append('status', params.status);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/attendance${queryStr}`, { method: 'GET' });
};

export const updateAttendanceApi = async (id, attendanceData) => {
  return apiRequest(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(attendanceData)
  });
};

export const deleteAttendanceApi = async (id) => {
  return apiRequest(`/attendance/${id}`, { method: 'DELETE' });
};

// --- Timetable Management API ---
export const getTimetablesApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.day) queryParams.append('day', params.day);
  if (params.department) queryParams.append('department', params.department);
  if (params.section) queryParams.append('section', params.section);
  if (params.instructorId) queryParams.append('instructorId', params.instructorId);
  if (params.search) queryParams.append('search', params.search);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/timetable${queryStr}`, { method: 'GET' });
};

export const getTodayTimetableApi = async (day) => {
  const query = day ? `?day=${encodeURIComponent(day)}` : '';
  return apiRequest(`/timetable/today${query}`, { method: 'GET' });
};

export const getTomorrowTimetableApi = async () => {
  return apiRequest('/timetable/tomorrow', { method: 'GET' });
};

export const getWeeklyTimetableApi = async () => {
  return apiRequest('/timetable/weekly', { method: 'GET' });
};

export const createTimetableApi = async (timetableData) => {
  return apiRequest('/timetable', {
    method: 'POST',
    body: JSON.stringify(timetableData)
  });
};

export const updateTimetableApi = async (id, timetableData) => {
  return apiRequest(`/timetable/${id}`, {
    method: 'PUT',
    body: JSON.stringify(timetableData)
  });
};

export const deleteTimetableApi = async (id) => {
  return apiRequest(`/timetable/${id}`, { method: 'DELETE' });
};

// --- Report Management API ---
export const generateReportApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.append('type', params.type);
  if (params.date) queryParams.append('date', params.date);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.month !== undefined) queryParams.append('month', params.month);
  if (params.year) queryParams.append('year', params.year);
  if (params.semester) queryParams.append('semester', params.semester);
  if (params.department) queryParams.append('department', params.department);
  if (params.course) queryParams.append('course', params.course);
  if (params.subject) queryParams.append('subject', params.subject);
  if (params.studentId) queryParams.append('studentId', params.studentId);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/reports/generate${queryStr}`, { method: 'GET' });
};

export const exportReportApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.format) queryParams.append('format', params.format);
  if (params.type) queryParams.append('type', params.type);
  if (params.date) queryParams.append('date', params.date);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.semester) queryParams.append('semester', params.semester);

  const token = getStoredToken();
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const url = `${API_BASE_URL}/reports/export${queryStr}`;
  
  window.open(url, '_blank');
};

export const getChartAnalyticsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.department) queryParams.append('department', params.department);
  if (params.course) queryParams.append('course', params.course);
  if (params.subject) queryParams.append('subject', params.subject);
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.timeframe) queryParams.append('timeframe', params.timeframe);

  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/charts/analytics${queryStr}`, { method: 'GET' });
};

// Notification APIs
export const getNotificationsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly);
  if (params.limit) queryParams.append('limit', params.limit);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/notifications${queryStr}`, { method: 'GET' });
};

export const markNotificationReadApi = async (id) => {
  return apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
};

export const markAllNotificationsReadApi = async () => {
  return apiRequest('/notifications/read-all', { method: 'PUT' });
};

export const deleteNotificationApi = async (id) => {
  return apiRequest(`/notifications/${id}`, { method: 'DELETE' });
};

export const sendAnnouncementApi = async (announcementData) => {
  return apiRequest('/notifications/announcement', {
    method: 'POST',
    body: JSON.stringify(announcementData)
  });
};

export const registerFCMTokenApi = async (token) => {
  return apiRequest('/notifications/fcm-token', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
};

// AI Features APIs (Phase 14)
export const getAttendancePredictionApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.target) queryParams.append('target', params.target);
  if (params.remaining) queryParams.append('remaining', params.remaining);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/ai/predict${queryStr}`, { method: 'GET' });
};

export const sendAiChatMessageApi = async (message) => {
  return apiRequest('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
};

export const getSuspiciousAttendanceApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.append('type', params.type);
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.search) queryParams.append('search', params.search);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/ai/suspicious-detection${queryStr}`, { method: 'GET' });
};

// Phase 15 Analytics Dashboard APIs
export const getAnalyticsDashboardApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.date) queryParams.append('date', params.date);
  if (params.department) queryParams.append('department', params.department);
  if (params.search) queryParams.append('search', params.search);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/analytics/dashboard${queryStr}`, { method: 'GET' });
};

export const getMostAbsentStudentsApi = async () => {
  return apiRequest('/analytics/most-absent', { method: 'GET' });
};

export const getBestAttendanceApi = async () => {
  return apiRequest('/analytics/best-attendance', { method: 'GET' });
};

export const getDepartmentRankingApi = async () => {
  return apiRequest('/analytics/department-ranking', { method: 'GET' });
};

export const getTeacherPerformanceApi = async () => {
  return apiRequest('/analytics/teacher-performance', { method: 'GET' });
};

export const getDailyAttendanceApi = async (date) => {
  const queryStr = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiRequest(`/analytics/daily-attendance${queryStr}`, { method: 'GET' });
};

// Phase 16 Security & Audit Log APIs
export const getAuditLogsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.role) queryParams.append('role', params.role);
  if (params.action) queryParams.append('action', params.action);
  if (params.resource) queryParams.append('resource', params.resource);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/audit-logs${queryStr}`, { method: 'GET' });
};

export const getAuditLogStatsApi = async () => {
  return apiRequest('/audit-logs/stats', { method: 'GET' });
};

export const exportAuditLogsApi = async () => {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}/audit-logs/export`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to export audit logs');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

// Phase 18 Academic Year & Semester Engine APIs
export const getAcademicHierarchyApi = async () => {
  return apiRequest('/academic/hierarchy', { method: 'GET' });
};

export const getAcademicYearsApi = async () => {
  return apiRequest('/academic/years', { method: 'GET' });
};

export const createAcademicYearApi = async (data) => {
  return apiRequest('/academic/years', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateAcademicYearApi = async (id, data) => {
  return apiRequest(`/academic/years/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteAcademicYearApi = async (id) => {
  return apiRequest(`/academic/years/${id}`, { method: 'DELETE' });
};

export const setCurrentAcademicYearApi = async (id) => {
  return apiRequest(`/academic/years/${id}/set-current`, { method: 'PATCH' });
};

export const getSemestersApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.academicYear) queryParams.append('academicYear', params.academicYear);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/academic/semesters${queryStr}`, { method: 'GET' });
};

export const createSemesterApi = async (data) => {
  return apiRequest('/academic/semesters', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateSemesterApi = async (id, data) => {
  return apiRequest(`/academic/semesters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteSemesterApi = async (id) => {
  return apiRequest(`/academic/semesters/${id}`, { method: 'DELETE' });
};

export const getDivisionsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.academicYear) queryParams.append('academicYear', params.academicYear);
  if (params.semester) queryParams.append('semester', params.semester);
  if (params.department) queryParams.append('department', params.department);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/academic/divisions${queryStr}`, { method: 'GET' });
};

export const createDivisionApi = async (data) => {
  return apiRequest('/academic/divisions', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const deleteDivisionApi = async (id) => {
  return apiRequest(`/academic/divisions/${id}`, { method: 'DELETE' });
};

export const promoteStudentsApi = async (data) => {
  return apiRequest('/academic/promote', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const enrollStudentsApi = async (data) => {
  return apiRequest('/academic/enroll', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const allocateSubjectApi = async (data) => {
  return apiRequest('/academic/allocations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Phase 19 Advanced Attendance Rules Engine APIs
export const getAttendanceRulesApi = async () => {
  return apiRequest('/attendance-rules', { method: 'GET' });
};

export const updateAttendanceRulesApi = async (data) => {
  return apiRequest('/attendance-rules', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const resetAttendanceRulesApi = async () => {
  return apiRequest('/attendance-rules/reset', { method: 'POST' });
};

export const evaluateRuleSandboxApi = async (data) => {
  return apiRequest('/attendance-rules/evaluate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Phase 20 Attendance Session Engine APIs
export const startAttendanceSessionApi = async (data) => {
  return apiRequest('/sessions/start', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getActiveSessionApi = async (classId = '') => {
  const query = classId ? `?classId=${classId}` : '';
  return apiRequest(`/sessions/active${query}`, { method: 'GET' });
};

export const getSessionQRTokenApi = async (sessionId) => {
  return apiRequest(`/sessions/${sessionId}/qr-token`, { method: 'GET' });
};

export const stopAttendanceSessionApi = async (sessionId) => {
  return apiRequest(`/sessions/${sessionId}/stop`, { method: 'POST' });
};

export const getSessionDetailsApi = async (sessionId) => {
  return apiRequest(`/sessions/${sessionId}`, { method: 'GET' });
};

export const getAttendanceSessionsApi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/sessions?${queryString}`, { method: 'GET' });
};

// Phase 21 Anti-Proxy Attendance System APIs
export const getFlaggedAntiProxyRecordsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.riskLevel) queryParams.append('riskLevel', params.riskLevel);
  if (params.reviewStatus) queryParams.append('reviewStatus', params.reviewStatus);
  if (params.classId) queryParams.append('classId', params.classId);
  if (params.subjectCode) queryParams.append('subjectCode', params.subjectCode);
  if (params.search) queryParams.append('search', params.search);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/anti-proxy/flagged${queryStr}`, { method: 'GET' });
};

export const reviewAntiProxyRecordApi = async (id, data) => {
  return apiRequest(`/anti-proxy/review/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const bulkReviewAntiProxyRecordsApi = async (data) => {
  return apiRequest('/anti-proxy/bulk-review', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getAntiProxyAnalyticsApi = async () => {
  return apiRequest('/anti-proxy/analytics', { method: 'GET' });
};

export const getDeviceSharingClustersApi = async () => {
  return apiRequest('/anti-proxy/device-clusters', { method: 'GET' });
};

// Phase 23 Attendance Correction Workflow APIs
export const createCorrectionRequestApi = async (data) => {
  return apiRequest('/attendance-corrections', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const getCorrectionRequestsApi = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.studentId) queryParams.append('studentId', params.studentId);
  if (params.subject) queryParams.append('subject', params.subject);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
  return apiRequest(`/attendance-corrections${queryStr}`, { method: 'GET' });
};

export const reviewCorrectionRequestApi = async (id, data) => {
  return apiRequest(`/attendance-corrections/${id}/review`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const getAttendanceAuditTrailApi = async (attendanceId) => {
  return apiRequest(`/attendance-corrections/history/${attendanceId}`, { method: 'GET' });
};
