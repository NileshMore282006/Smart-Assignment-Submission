import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your current filters or search criteria.',
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">
        {title}
      </h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}
