import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function RoleGuard({ allowedRole, children }) {
  const { user, switchRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-card text-center">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Access Restricted: {allowedRole.toUpperCase()} Area
        </h2>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          You are currently signed in as <strong>{user.name}</strong> ({user.role}).
          This section is only accessible to users with the <strong>{allowedRole}</strong> role.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Go to My Dashboard
          </Link>
          <button
            type="button"
            onClick={() => switchRole(allowedRole)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-600 text-white text-xs sm:text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm"
          >
            Switch to Demo {allowedRole === 'teacher' ? 'Teacher' : 'Student'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return children;
}
