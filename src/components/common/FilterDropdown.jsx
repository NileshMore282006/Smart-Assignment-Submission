import React from 'react';
import { Filter } from 'lucide-react';

export default function FilterDropdown({
  label,
  value,
  onChange,
  options = [],
  id = 'filter-dropdown',
  className = '',
  icon: Icon = Filter,
}) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="relative flex items-center w-full">
        <Icon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm cursor-pointer"
        >
          {label && <option value="all">All {label}s</option>}
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
    </div>
  );
}
