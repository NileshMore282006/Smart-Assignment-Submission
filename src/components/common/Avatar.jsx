import React from 'react';

export default function Avatar({ user, size = 'md', showRoleRing = true, className = '' }) {
  const name = user?.name || 'User';
  const role = user?.role || 'student';
  const avatarUrl = user?.avatar;

  const initials = name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg font-semibold',
    xl: 'w-20 h-20 text-2xl font-bold',
  }[size] || 'w-10 h-10 text-sm';

  const ringClass = showRoleRing
    ? role === 'teacher'
      ? 'ring-2 ring-indigo-500 ring-offset-2'
      : 'ring-2 ring-brand-500 ring-offset-2'
    : '';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`rounded-full object-cover shrink-0 bg-slate-100 ${sizeClasses} ${ringClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-medium shrink-0 ${
        role === 'teacher'
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white'
          : 'bg-gradient-to-br from-brand-600 to-brand-800 text-white'
      } ${sizeClasses} ${ringClass} ${className}`}
    >
      {initials}
    </div>
  );
}
