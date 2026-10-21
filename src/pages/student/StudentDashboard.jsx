import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileCheck2, 
  Clock, 
  Percent, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Upload,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import SimilarityScore from '../../components/common/SimilarityScore';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { assignments, submissions, reports, timeline } = useData();
  const navigate = useNavigate();

  // Published assignments
  const activeAssignments = useMemo(() => {
    return assignments.filter(a => a.status === 'published');
  }, [assignments]);

  // Current student submissions
  const mySubmissions = useMemo(() => {
    return submissions.filter(s => String(s.studentId) === String(user?.id));
  }, [submissions, user?.id]);

  // Calculations
  const totalCount = activeAssignments.length;
  const submittedCount = mySubmissions.length;
  const pendingCount = Math.max(0, totalCount - submittedCount);

  const scores = mySubmissions
    .map(s => s.similarityScore)
    .filter(sc => typeof sc === 'number');
  const avgSimilarity = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  // Upcoming deadlines (sort by dueDate ascending)
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return [...activeAssignments]
      .filter(a => new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }, [activeAssignments]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Personalized Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-card">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs text-white border border-white/20 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-200" />
            <span>Academic Portal • Spring Term 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 mt-2 leading-relaxed">
            You are enrolled in <span className="font-semibold text-white">{user?.department || 'Computer Science'}</span> ({user?.studentId || 'CS-2024'}). You have <strong className="text-white underline">{pendingCount} assignments</strong> awaiting submission.
          </p>

          {/* Quick Actions */}
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Link
              to="/student/assignments"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-700 font-bold text-xs sm:text-sm hover:bg-brand-50 shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Assignments</span>
            </Link>
            <Link
              to="/student/submissions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-800/80 hover:bg-brand-800 text-white font-semibold text-xs sm:text-sm border border-brand-500/30 transition-all"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>My Submissions</span>
            </Link>
            <Link
              to="/student/reports"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Similarity Reports</span>
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Assignments"
          value={totalCount}
          subtitle="Curriculum coursework"
          icon={BookOpen}
          iconColor="text-brand-600"
          iconBg="bg-brand-50"
          trend="+2 new this week"
          trendDirection="up"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          title="Submitted Works"
          value={submittedCount}
          subtitle="Passed initial integrity check"
          icon={FileCheck2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={`${Math.round((submittedCount / (totalCount || 1)) * 100)}% completed`}
          trendDirection="up"
          onClick={() => navigate('/student/submissions')}
        />
        <StatCard
          title="Pending Submissions"
          value={pendingCount}
          subtitle="Requires document upload"
          icon={Clock}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          title="Avg. Similarity Score"
          value={`${avgSimilarity}%`}
          subtitle="Low similarity (healthy citations)"
          icon={Percent}
          iconColor={avgSimilarity > 35 ? 'text-rose-600' : avgSimilarity > 15 ? 'text-amber-600' : 'text-emerald-600'}
          iconBg={avgSimilarity > 35 ? 'bg-rose-50' : avgSimilarity > 15 ? 'bg-amber-50' : 'bg-emerald-50'}
          onClick={() => navigate('/student/reports')}
        />
      </div>

      {/* Main Grid: Active Assignments & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Assignments Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Current Assignments
              </h2>
              <p className="text-xs text-slate-500">
                Assignments posted by department faculty
              </p>
            </div>
            <Link
              to="/student/assignments"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View all ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {activeAssignments.slice(0, 4).map((asg) => {
              const submission = mySubmissions.find(s => s.assignmentId === asg.id);
              const isOverdue = new Date(asg.dueDate) < new Date();

              return (
                <div key={asg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {asg.subject}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {asg.courseCode} • Prof. {asg.teacherName}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                      <Link to={`/student/assignments/${asg.id}`}>
                        {asg.title}
                      </Link>
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Due {new Date(asg.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[11px]">
                        Max: {asg.maxMarks} marks
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {submission ? (
                      <div className="flex items-center gap-2">
                        <StatusBadge status="submitted" />
                        {submission.similarityScore !== null && (
                          <SimilarityScore score={submission.similarityScore} size="badge" showLabel={false} />
                        )}
                        <Link
                          to={`/student/reports/${submission.similarityReportId || ''}`}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View similarity report"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : isOverdue ? (
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500">
                        Deadline Passed
                      </span>
                    ) : (
                      <Link
                        to={`/student/assignments/${asg.id}/submit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deadlines Panel & Activity */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Upcoming Deadlines
              </h3>
              <span className="text-[10px] font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
                Active Term
              </span>
            </div>

            <div className="space-y-3">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No imminent deadlines!</p>
              ) : (
                upcomingDeadlines.map((item) => {
                  const daysLeft = Math.ceil((new Date(item.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <Link
                      key={item.id}
                      to={`/student/assignments/${item.id}`}
                      className="block p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.title}
                        </p>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0 ${
                            daysLeft <= 3
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {daysLeft <= 0 ? 'Due Today' : `${daysLeft}d left`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {item.subject} • Due {new Date(item.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* Academic Integrity Reminder */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Similarity Guidance</span>
            </div>
            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Every document you upload is processed through our OCR pipeline to match against academic databases. Keep your citations properly attributed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
