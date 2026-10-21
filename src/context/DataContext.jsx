import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { assignmentsApi, submissionsApi, reportsApi, statsApi, notificationsApi, timelineApi, systemApi } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [asgs, subs, reps, notifs, acts] = await Promise.all([
        assignmentsApi.getAll(),
        submissionsApi.getAll(),
        reportsApi.getAll(),
        notificationsApi.getForUser(user?.id),
        timelineApi.getRecent(10),
      ]);
      setAssignments(asgs);
      setSubmissions(subs);
      setReports(reps);
      setNotifications(notifs);
      setTimeline(acts);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setAssignments([]);
      setSubmissions([]);
      setReports([]);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, refreshData]);

  // Assignment actions
  const createAssignment = async (data) => {
    const created = await assignmentsApi.create(data);
    await refreshData();
    toast.success('Assignment created and published!');
    return created;
  };

  const updateAssignment = async (id, data) => {
    const updated = await assignmentsApi.update(id, data);
    await refreshData();
    toast.success('Assignment updated successfully.');
    return updated;
  };

  const deleteAssignment = async (id) => {
    await assignmentsApi.delete(id);
    await refreshData();
    toast.success('Assignment deleted.');
  };

  const duplicateAssignment = async (id) => {
    const dup = await assignmentsApi.duplicate(id);
    await refreshData();
    toast.success('Assignment duplicated as draft.');
    return dup;
  };

  // Submission actions
  const submitAssignment = async (submitPayload) => {
    const submission = await submissionsApi.create(submitPayload);
    await refreshData();
    toast.success('Document submitted successfully!');
    return submission;
  };

  const updateReview = async (submissionId, reviewStatus, notes) => {
    const updated = await submissionsApi.updateReviewStatus(submissionId, reviewStatus, notes);
    await refreshData();
    toast.success(`Submission marked as ${reviewStatus.replace('_', ' ')}.`);
    return updated;
  };

  // Notifications
  const markNotificationRead = async (id) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = async (userId) => {
    await notificationsApi.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  // System reset
  const resetDemoState = async () => {
    await systemApi.resetDemoData();
    await refreshData();
    toast.success('Demo data restored to initial state.');
  };

  return (
    <DataContext.Provider
      value={{
        assignments,
        submissions,
        reports,
        notifications,
        timeline,
        loading,
        refreshData,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        duplicateAssignment,
        submitAssignment,
        updateReview,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoState,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
