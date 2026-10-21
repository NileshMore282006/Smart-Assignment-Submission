import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  BookOpen, 
  FileCheck2, 
  FileSpreadsheet, 
  PlusCircle, 
  SlidersHorizontal, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const { user, role, logout, switchRole } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/student/submissions', label: 'My Submissions', icon: FileCheck2 },
    { to: '/student/reports', label: 'Similarity Reports', icon: FileSpreadsheet },
    { to: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teacher/assignments/create', label: 'Create Assignment', icon: PlusCircle },
    { to: '/teacher/assignments', label: 'Manage Assignments', icon: SlidersHorizontal },
    { to: '/teacher/submissions', label: 'All Submissions', icon: FileCheck2 },
    { to: '/teacher/reports', label: 'Similarity Reports', icon: FileSpreadsheet },
    { to: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  const content = (
    <div className="flex flex-col h-full bg-navy-900 text-slate-300 border-r border-navy-800 select-none">
      {/* Brand Header */}
      <div className={`flex items-center h-18 px-4 border-b border-navy-800 transition-all ${
        isCollapsed ? 'justify-center' : 'justify-between'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-900/40 shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-sm font-extrabold text-white tracking-tight leading-tight block truncate">
                Smart Assignment
              </span>
              <span className="text-[10px] font-medium text-brand-400 tracking-wider uppercase block">
                Submit • Compare • Learn
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role Pill Banner */}
      {!isCollapsed && (
        <div className="px-4 py-3 mx-3 my-3 bg-navy-800/80 rounded-xl border border-navy-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${role === 'teacher' ? 'bg-indigo-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-xs font-semibold text-white capitalize">
              {role} Workspace
            </span>
          </div>
          <button
            type="button"
            onClick={() => switchRole(role === 'teacher' ? 'student' : 'teacher')}
            className="text-[11px] font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 hover:underline"
            title={`Switch to ${role === 'teacher' ? 'Student' : 'Teacher'} demo`}
          >
            <ArrowRightLeft className="w-3 h-3" />
            Switch
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 ${
          isCollapsed ? 'text-center' : ''
        }`}>
          {isCollapsed ? '•••' : 'Main Menu'}
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-navy-800'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info / User preview */}
      <div className="p-3 border-t border-navy-800 bg-navy-950/60">
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-navy-800 transition-colors ${
          isCollapsed ? 'justify-center' : ''
        }`}>
          <Avatar user={user} size="sm" showRoleRing={false} />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-navy-700 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-900 z-10 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
