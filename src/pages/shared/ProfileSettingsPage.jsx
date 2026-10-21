import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  Bell, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Database, 
  Cloud, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { authApi } from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import toast from 'react-hot-toast';

export default function ProfileSettingsPage() {
  const { user, role, updateProfile } = useAuth();
  const { resetDemoState } = useData();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'preferences' | 'architecture'
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  // Password state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailOnSubmission: true,
    emailOnReportReady: true,
    deadlineAlerts: true,
  });

  // Reset confirmation modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ name: displayName, bio });
      toast.success('Profile changes saved successfully');
    } catch (e) {
      toast.error('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordState.currentPassword || !passwordState.newPassword) {
      toast.error('Please complete all password fields');
      return;
    }
    if (passwordState.newPassword.length < 6) {
      toast.error('New password must contain at least 6 characters');
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const res = await authApi.changePassword(user?.id, {
        currentPassword: passwordState.currentPassword,
        newPassword: passwordState.newPassword,
      });
      toast.success(res?.message || 'Password updated successfully!');
      setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    }
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetDemoState();
      setShowResetConfirm(false);
      toast.success('Application demo data reset to seed state.');
    } catch (e) {
      toast.error('Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Account & Portal Settings"
        description="Manage your institutional identity, notification preferences, security, and demo workspace."
      />

      {/* Profile Overview Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar user={user} size="xl" showRoleRing={true} />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {user?.name}
            </h2>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200 capitalize">
              {role} Account
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-mono">
            {user?.email}
          </p>

          <div className="pt-1 flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
            <span>
              <strong>{role === 'teacher' ? 'Department' : 'Roll / ID'}:</strong>{' '}
              {user?.department || user?.studentId || 'N/A'}
            </span>
            {user?.semester && (
              <span>
                <strong>Term:</strong> {user?.semester}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password & Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Preferences & Reset</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Flask & AWS Integration</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Personal Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address (Fixed by Institution)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {role === 'teacher' ? 'Faculty Department' : 'Student Roll Number'}
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.department || user?.studentId || ''}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Academic Bio & Research Interests
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your research specializations, current projects, or lab affiliations..."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Account Security & Credentials
          </h3>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
            <strong>Demo Notice:</strong> Password updates are persisted locally for demo verification. When connected to the Flask backend, passwords will be encrypted using Argon2 / bcrypt.
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordState.currentPassword}
                onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="togglePass"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300"
              />
              <label htmlFor="togglePass" className="text-xs text-slate-600 cursor-pointer">
                Show passwords
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Preferences & Reset Demo Data */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Notification Preferences
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Email on Document Submission</p>
                  <p className="text-[11px] text-slate-500">Send an automated delivery receipt with timestamp</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailOnSubmission}
                  onChange={(e) => setNotifications({ ...notifications, emailOnSubmission: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Similarity Report Completion Alert</p>
                  <p className="text-[11px] text-slate-500">Notify as soon as Amazon Textract completes vector indexing</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailOnReportReady}
                  onChange={(e) => setNotifications({ ...notifications, emailOnReportReady: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-800">Coursework Deadline Reminders</p>
                  <p className="text-[11px] text-slate-500">Receive alerts 48 hours and 24 hours prior to deadline expiration</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.deadlineAlerts}
                  onChange={(e) => setNotifications({ ...notifications, deadlineAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 border-slate-300"
                />
              </label>
            </div>
          </div>

          {/* Reset Demo State Card */}
          <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Reset Demo Application Data
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Revert all assignments, student submissions, OCR similarity scores, and demo notifications back to their pristine initial seed state. This will erase any new records created in localStorage during this browser session.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Future Flask & AWS Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Future Architecture Blueprint
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              Python Flask REST API + AWS Cloud Pipeline
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              This frontend has been engineered with zero direct browser AWS SDK dependencies. All cloud calls route through a secured Python Flask REST API server with granular authorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">1. Flask REST API</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized in <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">src/services/api.js</code> with <code className="font-mono text-brand-700">VITE_API_BASE_URL</code>. Validates MIME types, JWT tokens, and rate limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">2. Amazon S3 Storage</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submissions stream into private, server-side encrypted S3 buckets with time-limited pre-signed download URLs for faculty reviews.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">3. Amazon Textract OCR</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Executes asynchronous <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">StartDocumentTextDetection</code> to extract text from PDFs and scanned images with high confidence scores.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono space-y-1">
            <div className="text-slate-400"># Flask Connection Configuration</div>
            <div># Create .env.local with:</div>
            <div className="text-emerald-400">VITE_API_BASE_URL=http://localhost:5000/api/v1</div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset Demo Data to Initial State?"
        message="This will immediately overwrite localStorage with the factory seed data, restoring initial assignments, submissions, and reports."
        confirmText="Confirm Reset"
        isDestructive={true}
        loading={isResetting}
      />
    </div>
  );
}
