import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileCheck2, 
  AlertTriangle, 
  Clock, 
  PlusCircle, 
  SlidersHorizontal, 
  FileSpreadsheet, 
  Users, 
  TrendingUp, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  Legend 
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import SimilarityScore from '../../components/common/SimilarityScore';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { assignments, submissions, reports } = useData();
  const navigate = useNavigate();

  // Metrics
  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const pendingReview = submissions.filter(s => s.reviewStatus === 'pending_review' || s.reviewStatus === 'needs_further_review').length;
  const highSimilarityCases = submissions.filter(s => (s.similarityScore || 0) >= 36).length;

  // Chart 1: Submission Activity by Day (Simulated realistic series)
  const activityData = [
    { day: 'Mon', submissions: 3, reviewed: 2 },
    { day: 'Tue', submissions: 7, reviewed: 5 },
    { day: 'Wed', submissions: 12, reviewed: 9 },
    { day: 'Thu', submissions: 8, reviewed: 6 },
    { day: 'Fri', submissions: 15, reviewed: 11 },
    { day: 'Sat', submissions: 6, reviewed: 5 },
    { day: 'Sun', submissions: 4, reviewed: 4 },
  ];

  // Chart 2: Similarity Score Distribution
  const distributionData = useMemo(() => {
    let low = 0; // 0 - 15%
    let moderate = 0; // 16 - 35%
    let high = 0; // 36%+

    submissions.forEach(s => {
      const score = s.similarityScore;
      if (score !== null && score !== undefined) {
        if (score <= 15) low++;
        else if (score <= 35) moderate++;
        else high++;
      }
    });

    return [
      { name: '0 - 15% (Low)', count: low, fill: '#10B981' },
      { name: '16 - 35% (Moderate)', count: moderate, fill: '#F59E0B' },
      { name: '36%+ (High / Flagged)', count: high, fill: '#EF4444' },
    ];
  }, [submissions]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Teacher Faculty Greeting */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <span>Faculty Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {user?.name || 'Professor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {user?.department || 'Department of Computer Science'} • Manage student coursework, configure assignment parameters, and review OCR similarity findings.
          </p>
        </div>

        {/* Quick Action buttons */}
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          <Link
            to="/teacher/assignments/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Assignment</span>
          </Link>
          <Link
            to="/teacher/submissions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Review Submissions</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assignments"
          value={totalAssignments}
          subtitle="Coursework items across courses"
          icon={BookOpen}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          onClick={() => navigate('/teacher/assignments')}
        />
        <StatCard
          title="Total Submissions"
          value={totalSubmissions}
          subtitle="Processed student papers"
          icon={FileCheck2}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
          trend="+5 new today"
          trendDirection="up"
          onClick={() => navigate('/teacher/submissions')}
        />
        <StatCard
          title="Pending Review"
          value={pendingReview}
          subtitle="Awaiting instructor verification"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          onClick={() => navigate('/teacher/submissions')}
        />
        <StatCard
          title="Flagged High Similarity"
          value={highSimilarityCases}
          subtitle="Matching score ≥ 36%"
          icon={ShieldAlert}
          iconColor="text-rose-600"
          iconBg="bg-rose-50"
          trend="Requires human review"
          trendDirection="down"
          onClick={() => navigate('/teacher/reports')}
        />
      </div>

      {/* Recharts Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Submission Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Weekly Submission Throughput
              </h3>
              <p className="text-xs text-slate-500">
                Volume of incoming uploads versus completed instructor reviews
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Current Week</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="reviewed" name="Reviewed" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Similarity Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Similarity Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Cohort breakdown by match bracket
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" name="Papers" radius={[6, 6, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Submissions Triage Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Recent Submissions Requiring Attention
            </h3>
            <p className="text-xs text-slate-500">
              Real-time student document receipts with OCR similarity indexing
            </p>
          </div>
          <Link
            to="/teacher/submissions"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View all ({totalSubmissions})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Student & ID</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Similarity Score</th>
                <th className="py-3 px-4">Review Disposition</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {submissions.slice(0, 5).map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{sub.studentNumber}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-slate-800 block truncate max-w-[200px]">
                      {sub.assignmentTitle}
                    </span>
                    <span className="text-[11px] text-brand-600 font-semibold">{sub.subject}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 truncate max-w-[150px]">
                    {sub.fileName}
                  </td>
                  <td className="py-3.5 px-4">
                    {sub.similarityScore !== null ? (
                      <SimilarityScore score={sub.similarityScore} size="badge" showLabel={true} />
                    ) : (
                      <span className="text-slate-400 italic">Processing</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={sub.reviewStatus} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {sub.similarityReportId ? (
                      <Link
                        to={`/teacher/reports/${sub.similarityReportId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                      >
                        <span>Audit Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Queued</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
