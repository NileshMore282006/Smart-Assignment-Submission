import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Layout & Guards
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage';
import AssignmentDetailsPage from './pages/student/AssignmentDetailsPage';
import AssignmentSubmissionPage from './pages/student/AssignmentSubmissionPage';
import MySubmissionsPage from './pages/student/MySubmissionsPage';
import StudentReportsPage from './pages/student/StudentReportsPage';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import CreateAssignmentPage from './pages/teacher/CreateAssignmentPage';
import ManageAssignmentsPage from './pages/teacher/ManageAssignmentsPage';
import AllSubmissionsPage from './pages/teacher/AllSubmissionsPage';
import TeacherReportsPage from './pages/teacher/TeacherReportsPage';

// Shared Pages
import SimilarityReportView from './pages/shared/SimilarityReportView';
import ProfileSettingsPage from './pages/shared/ProfileSettingsPage';
import NotFoundPage from './pages/shared/NotFoundPage';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0F172A',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Root Route Redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard" element={<RootRedirect />} />

            {/* Authenticated Layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Student Role Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <RoleGuard allowedRole="student">
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <RoleGuard allowedRole="student">
                    <StudentAssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/assignments/:id"
                element={
                  <RoleGuard allowedRole="student">
                    <AssignmentDetailsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/assignments/:id/submit"
                element={
                  <RoleGuard allowedRole="student">
                    <AssignmentSubmissionPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/submissions"
                element={
                  <RoleGuard allowedRole="student">
                    <MySubmissionsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/reports"
                element={
                  <RoleGuard allowedRole="student">
                    <StudentReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/reports/:id"
                element={
                  <RoleGuard allowedRole="student">
                    <SimilarityReportView />
                  </RoleGuard>
                }
              />

              {/* Teacher Role Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <RoleGuard allowedRole="teacher">
                    <TeacherDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <RoleGuard allowedRole="teacher">
                    <ManageAssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/assignments/create"
                element={
                  <RoleGuard allowedRole="teacher">
                    <CreateAssignmentPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/submissions"
                element={
                  <RoleGuard allowedRole="teacher">
                    <AllSubmissionsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <RoleGuard allowedRole="teacher">
                    <TeacherReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/reports/:id"
                element={
                  <RoleGuard allowedRole="teacher">
                    <SimilarityReportView />
                  </RoleGuard>
                }
              />

              {/* Shared Authenticated Routes */}
              <Route path="/profile" element={<ProfileSettingsPage />} />
              <Route path="/settings" element={<Navigate to="/profile" replace />} />

              {/* 404 Route within layout */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
