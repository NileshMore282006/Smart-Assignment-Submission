import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-200 rounded w-24"></div>
              <div className="h-7 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-2.5 bg-slate-100 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div className="h-4 bg-slate-200 rounded w-36"></div>
        <div className="h-8 bg-slate-200 rounded w-48"></div>
      </div>
      <div className="divide-y divide-slate-100 p-4 space-y-4">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4 pt-2">
            {Array.from({ length: cols }).map((_, c) => (
              <div
                key={c}
                className="h-4 bg-slate-200/80 rounded"
                style={{ width: `${Math.max(15, Math.floor(100 / cols))}%` }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'card', count = 4 }) {
  if (type === 'table') return <TableSkeleton rows={count} />;
  return <CardSkeleton count={count} />;
}
