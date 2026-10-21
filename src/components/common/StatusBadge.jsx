import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle,
  Archive,
  Edit3
} from 'lucide-react';

const STATUS_CONFIGS = {
  // Submission & Processing Statuses
  not_submitted: {
    label: 'Not Submitted',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: Clock
  },
  submitted: {
    label: 'Submitted',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: FileText
  },
  processing: {
    label: 'Processing',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: Clock,
    animate: true
  },
  completed: {
    label: 'Completed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: AlertTriangle
  },
  reviewed: {
    label: 'Reviewed',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: ShieldCheck
  },
  needs_further_review: {
    label: 'Needs Further Review',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: AlertCircle
  },
  failed: {
    label: 'Failed',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    icon: XCircle
  },
  late: {
    label: 'Late Submission',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: Clock
  },

  // Assignment Lifecycle Statuses
  published: {
    label: 'Published',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: CheckCircle2
  },
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    icon: Edit3
  },
  archived: {
    label: 'Archived',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: Archive
  }
};

export default function StatusBadge({ status, size = 'sm', className = '' }) {
  const normalizedKey = (status || '').toLowerCase().replace(/[\s-]/g, '_');
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: FileText
  };

  const Icon = config.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${
        isSm ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${className}`}
    >
      <Icon className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${config.animate ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
