import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-600',
  iconBg = 'bg-brand-50',
  trend,
  trendDirection = 'up',
  onClick,
  className = '',
}) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 text-left w-full ${
        onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </h3>
            {trend && (
              <span
                className={`inline-flex items-center text-xs font-semibold ${
                  trendDirection === 'up' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {trendDirection === 'up' ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl shrink-0 ${iconBg} ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Component>
  );
}
