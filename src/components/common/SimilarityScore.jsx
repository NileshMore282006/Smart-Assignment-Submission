import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function SimilarityScore({ score, size = 'md', showLabel = true, showDisclaimer = false, className = '' }) {
  if (score === null || score === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
        <HelpCircle className="w-3.5 h-3.5" />
        Pending Scan
      </span>
    );
  }

  // Bracket categorization
  let category = 'low';
  let categoryLabel = 'Low Similarity';
  let strokeColor = '#10B981'; // emerald-500
  let textColor = 'text-emerald-700';
  let bgBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (score > 35) {
    category = 'high';
    categoryLabel = 'High Similarity';
    strokeColor = '#EF4444'; // rose-500
    textColor = 'text-rose-700';
    bgBadge = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = AlertCircle;
  } else if (score > 15) {
    category = 'moderate';
    categoryLabel = 'Moderate Similarity';
    strokeColor = '#F59E0B'; // amber-500
    textColor = 'text-amber-800';
    bgBadge = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  }

  // Compact badge mode
  if (size === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgBadge} ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: strokeColor }} />
        <span>{score}%</span>
        {showLabel && <span className="opacity-80">({categoryLabel})</span>}
      </span>
    );
  }

  // Gauge dimensions
  const dimensions = {
    sm: { size: 48, strokeWidth: 4, text: 'text-sm font-bold' },
    md: { size: 76, strokeWidth: 6, text: 'text-xl font-bold' },
    lg: { size: 120, strokeWidth: 8, text: 'text-3xl font-extrabold' },
  }[size] || { size: 76, strokeWidth: 6, text: 'text-xl font-bold' };

  const radius = (dimensions.size - dimensions.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimensions.size}
          height={dimensions.size}
          className="transform -rotate-90"
        >
          {/* Background circle track */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={dimensions.strokeWidth}
            fill="transparent"
          />
          {/* Animated score indicator */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${dimensions.text} text-slate-800 tracking-tight leading-none`}>
            {score}<span className="text-[70%] font-semibold">%</span>
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-2 text-center">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${bgBadge}`}>
            <Icon className="w-3 h-3" />
            {categoryLabel}
          </span>
        </div>
      )}

      {showDisclaimer && (
        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed text-left flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            <strong>Academic Note:</strong> Similarity indicates matching text segments against indexed repositories, not a confirmed plagiarism finding. All matches require professional human review.
          </p>
        </div>
      )}
    </div>
  );
}
