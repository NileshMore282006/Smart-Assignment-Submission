/**
 * Smart Assignment Portal - Centralized API Service Layer
 * 
 * Connected to Flask REST API at: http://localhost:5000/api
 * Supports seamless fallback to localStorage demo state if backend server is offline.
 */

import {
  INITIAL_USERS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_TIMELINE,
} from '../data/mockData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'sap_jwt_token_v1';
const CURRENT_USER_KEY = 'sap_current_user_v1';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
}

export function setAuthToken(token, persist = true) {
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

// LocalStorage Persistence Keys for Mock Fallback
const STORAGE_KEYS = {
  USERS: 'sap_users_v1',
  ASSIGNMENTS: 'sap_assignments_v1',
  SUBMISSIONS: 'sap_submissions_v1',
  REPORTS: 'sap_reports_v1',
  NOTIFICATIONS: 'sap_notifications_v1',
  CURRENT_USER: CURRENT_USER_KEY,
  TIMELINE: 'sap_timeline_v1',
};

function getFromStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to write ${key}`, e);
  }
}

// HTTP Helper for Flask API
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    // True network failure (e.g. backend server offline, refused connection)
    const error = new Error(`Cannot connect to backend at ${API_BASE_URL}. Ensure Flask server is running.`);
    error.isNetworkError = true;
    throw error;
  }

  // Parse JSON response safely
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (parseErr) {
      data = null;
    }
  } else {
    const text = await response.text().catch(() => '');
    data = { error: text || `HTTP ${response.status} ${response.statusText}` };
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }
    const errMsg = (data && (data.error || data.message)) || `Request failed with status ${response.status}`;
    const error = new Error(errMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Adapters to harmonize Flask snake_case response models with React camelCase components
function adaptUser(u) {
  if (!u) return null;
  return {
    id: String(u.id),
    name: u.full_name || u.name,
    email: u.email,
    role: u.role,
    studentId: u.student_id || u.studentId || '',
    department: u.department || '',
    bio: u.bio || '',
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.full_name || u.name || 'User')}`,
    stats: u.stats || null,
  };
}

function adaptAssignment(a) {
  if (!a) return null;
  return {
    id: String(a.id),
    title: a.title,
    subject: a.subject,
    courseCode: a.course_code || a.courseCode || 'CS-101',
    teacherId: String(a.teacher_id || a.teacherId),
    teacherName: a.teacher_name || a.teacherName || 'Faculty',
    description: a.description,
    instructions: a.instructions || a.description,
    postedDate: a.created_at || a.postedDate || new Date().toISOString(),
    dueDate: a.due_date || a.dueDate,
    maxMarks: a.max_marks !== undefined ? a.max_marks : a.maxMarks || 100,
    allowedFormats: Array.isArray(a.allowed_file_types) ? a.allowed_file_types : (a.allowedFormats || ['PDF', 'DOCX']),
    maxFileSizeMb: a.max_file_size_mb || a.maxFileSizeMb || 10,
    status: a.status || 'published',
    attachment: a.attachment || null,
  };
}

function adaptSubmission(s) {
  if (!s) return null;
  return {
    id: String(s.id),
    assignmentId: String(s.assignment_id || s.assignmentId),
    assignmentTitle: s.assignment_title || s.assignmentTitle || 'Coursework',
    subject: s.subject || 'Computer Science',
    studentId: String(s.student_id || s.studentId),
    studentName: s.student_name || s.studentName || 'Student',
    studentNumber: s.student_number || s.studentNumber || '',
    fileName: s.original_filename || s.fileName || 'document.pdf',
    fileSize: s.file_size_display || s.fileSize || '2 MB',
    fileType: s.file_type || s.fileType || 'application/pdf',
    submittedAt: s.submitted_at || s.submittedAt || new Date().toISOString(),
    status: s.status || 'submitted',
    similarityScore: s.similarity_score !== undefined ? s.similarity_score : s.similarityScore,
    similarityReportId: s.similarity_report_id ? String(s.similarity_report_id) : s.similarityReportId,
    reviewStatus: s.review_status || s.reviewStatus || 'pending_review',
    teacherNotes: s.teacher_notes || s.teacherNotes || null,
  };
}

function adaptReport(r) {
  if (!r) return null;
  return {
    id: String(r.id),
    submissionId: String(r.submission_id || r.submissionId),
    assignmentId: String(r.assignment_id || r.assignmentId),
    assignmentTitle: r.assignment_title || r.assignmentTitle || 'Report',
    studentId: String(r.student_id || r.studentId),
    studentName: r.student_name || r.studentName,
    studentNumber: r.student_number || r.studentNumber,
    generatedAt: r.created_at || r.generatedAt || new Date().toISOString(),
    overallScore: r.overall_similarity_score !== undefined ? r.overall_similarity_score : r.overallScore,
    category: r.category || 'low',
    status: r.status || 'completed',
    reviewStatus: r.review_status || r.reviewStatus || 'pending_review',
    textractMetadata: r.textract_metadata || r.textractMetadata || {
      pagesExtracted: 0,
      wordsCount: 0,
      charactersCount: 0,
      detectedLanguage: 'en',
      confidenceScore: '98%'
    },
    matchedDocuments: r.matched_documents || r.matchedDocuments || [],
    matchingPassages: r.matching_passages || r.matchingPassages || [],
    summaryNotes: r.summary_notes || r.summaryNotes || 'Automated similarity report generated for coursework review.',
  };
}

/* =========================================================================
   1. AUTHENTICATION API
   Connected to Flask REST API:
   - POST /api/auth/login
   - POST /api/auth/register
   - POST /api/auth/logout
   - GET  /api/auth/me
   ========================================================================= */
export const authApi = {
  async getMe() {
    const token = getAuthToken();
    if (!token) return null;
    try {
      const data = await apiFetch('/auth/me');
      if (data && data.user) {
        const user = adaptUser(data.user);
        saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
        return user;
      }
      return null;
    } catch (err) {
      clearAuthToken();
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
  },

  async login(email, password, role) {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });

      if (data.token) {
        setAuthToken(data.token, true);
      }

      const user = adaptUser(data.user);
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
      return { user, token: data.token };
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Backend server offline, falling back to local demo state:', err.message);
        const users = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) throw new Error('Invalid email or password.');
        if (role && user.role !== role) throw new Error(`This account is registered as a ${user.role}.`);

        saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
        return { user, token: 'demo-local-token-' + Date.now() };
      }
      throw err;
    }
  },

  async register({ fullName, email, studentId, password }) {
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          email,
          student_id: studentId,
          password,
          role: 'student'
        }),
      });

      if (data.token) {
        setAuthToken(data.token, true);
      }

      const user = adaptUser(data.user);
      return { success: true, user };
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Backend offline, using local storage fallback:', err.message);
        const users = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) throw new Error('An account with this email address already exists.');

        const newUser = {
          id: 'usr-stu-' + Date.now(),
          name: fullName,
          email: email.toLowerCase(),
          role: 'student',
          studentId: studentId || `CS-${new Date().getFullYear()}-001`,
          department: 'Computer Science & Engineering',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
        };
        users.push(newUser);
        saveToStorage(STORAGE_KEYS.USERS, users);
        return { success: true, user: newUser };
      }
      throw err;
    }
  },

  async forgotPassword(email) {
    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return { success: true, message: data.message };
    } catch (err) {
      if (err.isNetworkError) {
        return { success: true, message: `If ${email} is registered, a password recovery link has been dispatched.` };
      }
      throw err;
    }
  },

  getCurrentUser() {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      clearAuthToken();
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    return true;
  },

  async updateProfile(userId, profileData) {
    try {
      const data = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: profileData.name,
          bio: profileData.bio,
          department: profileData.department,
          student_id: profileData.studentId,
        }),
      });
      const updated = adaptUser(data.user);
      saveToStorage(STORAGE_KEYS.CURRENT_USER, updated);
      return updated;
    } catch (err) {
      if (err.isNetworkError) {
        const users = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
          users[index] = { ...users[index], ...profileData };
          saveToStorage(STORAGE_KEYS.USERS, users);
          saveToStorage(STORAGE_KEYS.CURRENT_USER, users[index]);
          return users[index];
        }
      }
      throw err;
    }
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    return await apiFetch('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }
};

/* =========================================================================
   2. ASSIGNMENTS API
   Connected to Flask REST API:
   - GET    /api/assignments
   - GET    /api/assignments/:id
   - POST   /api/assignments
   - PUT    /api/assignments/:id
   - DELETE /api/assignments/:id
   ========================================================================= */
export const assignmentsApi = {
  async getAll() {
    try {
      const data = await apiFetch('/assignments?page_size=50');
      if (data && Array.isArray(data.assignments)) {
        const adapted = data.assignments.map(adaptAssignment);
        saveToStorage(STORAGE_KEYS.ASSIGNMENTS, adapted);
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Flask API offline, using local cached assignments:', err.message);
        return getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
      }
      throw err;
    }
    return getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },

  async getById(id) {
    try {
      const data = await apiFetch(`/assignments/${id}`);
      if (data && data.assignment) {
        return adaptAssignment(data.assignment);
      }
    } catch (err) {
      if (err.isNetworkError) {
        const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        const item = list.find(a => String(a.id) === String(id));
        if (item) return item;
      }
      throw err;
    }
    const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const item = list.find(a => String(a.id) === String(id));
    if (!item) throw new Error(`Assignment #${id} not found.`);
    return item;
  },

  async create(assignmentData) {
    try {
      const data = await apiFetch('/assignments', {
        method: 'POST',
        body: JSON.stringify({
          title: assignmentData.title,
          subject: assignmentData.subject,
          course_code: assignmentData.courseCode || 'CS-601',
          description: assignmentData.description,
          instructions: assignmentData.instructions,
          due_date: assignmentData.dueDate,
          max_marks: assignmentData.maxMarks,
          allowed_file_types: assignmentData.allowedFormats,
          max_file_size_mb: assignmentData.maxFileSizeMb,
          status: assignmentData.status || 'published',
        }),
      });
      if (data && data.assignment) {
        const adapted = adaptAssignment(data.assignment);
        const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        list.unshift(adapted);
        saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Flask API offline, saving assignment locally:', err.message);
        const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        const newAsg = {
          ...assignmentData,
          id: 'asg-' + Date.now().toString().slice(-4),
          postedDate: new Date().toISOString(),
          status: assignmentData.status || 'published',
        };
        list.unshift(newAsg);
        saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
        return newAsg;
      }
      throw err;
    }
  },

  async update(id, updateData) {
    try {
      const data = await apiFetch(`/assignments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: updateData.title,
          subject: updateData.subject,
          description: updateData.description,
          instructions: updateData.instructions,
          max_marks: updateData.maxMarks,
          status: updateData.status,
          allowed_file_types: updateData.allowedFormats,
          due_date: updateData.dueDate,
        }),
      });
      if (data && data.assignment) {
        const adapted = adaptAssignment(data.assignment);
        const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        const idx = list.findIndex(a => String(a.id) === String(id));
        if (idx !== -1) {
          list[idx] = adapted;
          saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
        }
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        const idx = list.findIndex(a => String(a.id) === String(id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updateData };
          saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
          return list[idx];
        }
        return updateData;
      }
      throw err;
    }
  },

  async delete(id) {
    try {
      await apiFetch(`/assignments/${id}`, { method: 'DELETE' });
    } catch (err) {
      if (!err.isNetworkError) throw err;
    }
    let list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    list = list.filter(a => String(a.id) !== String(id));
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
    return { success: true };
  },

  async duplicate(id) {
    try {
      const data = await apiFetch(`/assignments/${id}/duplicate`, { method: 'POST' });
      if (data && data.assignment) {
        const adapted = adaptAssignment(data.assignment);
        const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        list.unshift(adapted);
        saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
        return adapted;
      }
    } catch (err) {
      if (!err.isNetworkError) throw err;
    }
    const list = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const original = list.find(a => String(a.id) === String(id));
    if (!original) throw new Error('Original assignment not found');

    const duplicate = {
      ...original,
      id: 'asg-' + Date.now().toString().slice(-4),
      title: `${original.title} (Copy)`,
      status: 'draft',
      postedDate: new Date().toISOString(),
    };
    list.unshift(duplicate);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, list);
    return duplicate;
  }
};

/* =========================================================================
   3. SUBMISSIONS & REPORTS API
   Connected to Flask REST API:
   - GET  /api/submissions
   - GET  /api/submissions/:id
   - POST /api/submissions/assignments/:id/submit
   - PUT  /api/submissions/:id/review
   - GET  /api/reports
   - GET  /api/reports/:id
   ========================================================================= */
export const submissionsApi = {
  async getAll() {
    try {
      const data = await apiFetch('/submissions?page_size=50');
      if (data && Array.isArray(data.submissions)) {
        const adapted = data.submissions.map(adaptSubmission);
        saveToStorage(STORAGE_KEYS.SUBMISSIONS, adapted);
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Flask submissions offline, using local storage:', err.message);
        return getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
      }
      throw err;
    }
    return getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  async getById(id) {
    try {
      const data = await apiFetch(`/submissions/${id}`);
      if (data && data.submission) {
        return adaptSubmission(data.submission);
      }
    } catch (err) {
      if (err.isNetworkError) {
        const list = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
        const item = list.find(s => String(s.id) === String(id));
        if (item) return item;
      }
      throw err;
    }
    const list = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const item = list.find(s => String(s.id) === String(id));
    if (!item) throw new Error('Submission not found');
    return item;
  },

  async create({ assignmentId, studentId, studentName, studentNumber, file }) {
    try {
      const data = await apiFetch(`/submissions/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          filename: file.name,
          file_size_bytes: file.size,
        }),
      });
      if (data && data.submission) {
        const adapted = adaptSubmission(data.submission);
        const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
        submissions.unshift(adapted);
        saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Backend offline, using local submission fallback:', err.message);
        const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
        const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
        const assignment = assignments.find(a => String(a.id) === String(assignmentId)) || { title: 'Coursework', subject: 'Cloud' };

        const submissionId = 'sub-' + Date.now().toString().slice(-4);
        const reportId = 'rep-' + Date.now().toString().slice(-4);
        const simulatedScore = Math.floor(6 + Math.random() * 22);

        const newSub = {
          id: submissionId,
          assignmentId: String(assignmentId),
          assignmentTitle: assignment.title,
          subject: assignment.subject,
          studentId: String(studentId),
          studentName,
          studentNumber,
          fileName: file.name,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          fileType: file.type || 'application/pdf',
          submittedAt: new Date().toISOString(),
          status: 'completed',
          similarityScore: simulatedScore,
          similarityReportId: reportId,
          reviewStatus: 'pending_review',
          teacherNotes: null,
        };

        submissions.unshift(newSub);
        saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
        return newSub;
      }
      throw err;
    }
  },

  async updateReviewStatus(submissionId, reviewStatus, teacherNotes = '') {
    try {
      const data = await apiFetch(`/submissions/${submissionId}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          review_status: reviewStatus,
          teacher_notes: teacherNotes,
        }),
      });
      if (data && data.submission) {
        const adapted = adaptSubmission(data.submission);
        const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
        const idx = submissions.findIndex(s => String(s.id) === String(submissionId));
        if (idx !== -1) {
          submissions[idx] = adapted;
          saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
        }
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
        const sub = submissions.find(s => String(s.id) === String(submissionId));
        if (sub) {
          sub.reviewStatus = reviewStatus;
          if (teacherNotes) sub.teacherNotes = teacherNotes;
          saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
          return sub;
        }
      }
      throw err;
    }
    return { id: submissionId, reviewStatus, teacherNotes };
  }
};

export const reportsApi = {
  async getAll() {
    try {
      const data = await apiFetch('/reports?page_size=50');
      if (data && Array.isArray(data.reports)) {
        const adapted = data.reports.map(adaptReport);
        saveToStorage(STORAGE_KEYS.REPORTS, adapted);
        return adapted;
      }
    } catch (err) {
      if (err.isNetworkError) {
        console.warn('Flask reports offline, using local storage:', err.message);
        return getFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
      }
      throw err;
    }
    return getFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  async getById(id) {
    try {
      const data = await apiFetch(`/reports/${id}`);
      if (data && data.report) {
        return adaptReport(data.report);
      }
    } catch (err) {
      if (err.isNetworkError) {
        const list = getFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
        const item = list.find(r => String(r.id) === String(id));
        if (item) return item;
      }
      throw err;
    }
    const list = getFromStorage(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
    const item = list.find(r => String(r.id) === String(id));
    if (!item) throw new Error(`Report #${id} not found.`);
    return item;
  }
};

/* =========================================================================
   4. STATS & ANALYTICS API
   ========================================================================= */
export const statsApi = {
  async getStudentStats(studentId) {
    try {
      const data = await apiFetch('/profile');
      if (data && data.profile && data.profile.stats) {
        return data.profile.stats;
      }
    } catch (e) {
      // fallback
    }
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS).filter(a => a.status === 'published');
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS).filter(s => String(s.studentId) === String(studentId));
    return {
      totalAssignments: assignments.length,
      submittedCount: submissions.length,
      pendingCount: Math.max(0, assignments.length - submissions.length),
      averageSimilarityScore: 12,
      recentSubmissions: submissions.slice(0, 4)
    };
  },

  async getTeacherStats() {
    try {
      const data = await apiFetch('/profile');
      if (data && data.profile && data.profile.stats) {
        return data.profile.stats;
      }
    } catch (e) {
      // fallback
    }
    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    return {
      totalAssignments: assignments.length,
      totalSubmissions: submissions.length,
      pendingReview: submissions.filter(s => s.reviewStatus === 'pending_review').length,
      highSimilarityCases: submissions.filter(s => (s.similarityScore || 0) >= 36).length,
      recentSubmissions: submissions.slice(0, 5)
    };
  }
};

/* =========================================================================
   5. NOTIFICATIONS, TIMELINE, AND RESET
   ========================================================================= */
export const notificationsApi = {
  async getForUser(userId) {
    const list = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return list.filter(n => n.userId === userId || !n.userId);
  },

  async markAsRead(id) {
    const list = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const item = list.find(n => n.id === id);
    if (item) item.read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    return true;
  },

  async markAllAsRead(userId) {
    const list = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    list.forEach(n => {
      if (n.userId === userId || !n.userId) n.read = true;
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    return true;
  }
};

export const timelineApi = {
  async getRecent(limit = 6) {
    const list = getFromStorage(STORAGE_KEYS.TIMELINE, INITIAL_ACTIVITY_TIMELINE);
    return list.slice(0, limit);
  }
};

export const systemApi = {
  resetDemoData() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_REPORTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(INITIAL_ACTIVITY_TIMELINE));
    clearAuthToken();
    return Promise.resolve(true);
  }
};
