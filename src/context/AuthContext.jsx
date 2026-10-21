import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, getAuthToken } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authApi.getCurrentUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getAuthToken();
      if (!token) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const verifiedUser = await authApi.getMe();
        if (isMounted) {
          setUser(verifiedUser);
        }
      } catch (err) {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const result = await authApi.login(email, password, role);
      setUser(result.user);
      toast.success(`Welcome back, ${result.user.name}!`);
      return result.user;
    } catch (err) {
      toast.error(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registrationData) => {
    setLoading(true);
    try {
      const result = await authApi.register(registrationData);
      toast.success('Registration successful! You can now log in.');
      return result.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      toast.success('Signed out successfully.');
    }
  };

  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      if (targetRole === 'teacher') {
        const result = await authApi.login('teacher@demo.com', 'Teacher123!', 'teacher');
        setUser(result.user);
        toast.success('Switched to Teacher account (Dr. Alan Vance)');
        return result.user;
      } else {
        const result = await authApi.login('student@demo.com', 'Student123!', 'student');
        setUser(result.user);
        toast.success('Switched to Student account (Alex Johnson)');
        return result.user;
      }
    } catch (err) {
      toast.error(err.message || 'Could not switch demo role');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedFields) => {
    if (!user) return;
    try {
      const updated = await authApi.updateProfile(user.id, updatedFields);
      setUser(updated);
      toast.success('Profile updated successfully');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
