import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  FileCheck2, 
  Download, 
  Upload, 
  ArrowLeft, 
  AlertCircle, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  Award,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import SimilarityScore from '../../components/common/SimilarityScore';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AssignmentDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { assignments, submissions, reports } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'submission' | 'report'

  const assignment = useMemo(() => {
    return assignments.find(a => String(a.id) === String(id));
  }, [assignments, id]);

  const submission = useMemo(() => {
    return submissions.find(s => String(s.assignmentId) === String(id) && String(s.studentId) === String(user?.id));
  }, [submissions, id, user?.id]);

  const report = useMemo(() => {
    if (!submission?.similarityReportId) return null;
    return reports.find(r => String(r.id) === String(submission.similarityReportId));
  }, [reports, submission]);

  if (!assignment) {
    return (
      <EmptyState
        title="Assignment not found"
        description={`No assignment was located with identifier "${id}".`}
        action={
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to assignments
          </Link>
        }
      />
    );
  }

  const isPastDue = new Date(assignment.dueDate) < new Date();

  const handleDownloadAttachment = (attachment) => {
    toast.success(`Downloading reference material: ${attachment.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignment Directory</span>
        </Link>
      </div>

      {/* Hero Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                {assignment.subject}
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                {assignment.courseCode}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Posted {new Date(assignment.postedDate).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {assignment.title}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {assignment.description}
            </p>
          </div>

          {/* Submission CTA Box */}
          <div className="lg:w-80 shrink-0 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Your Status
              </span>
              <div className="flex items-center justify-between">
                {submission ? (
                  <StatusBadge status="submitted" size="md" />
                ) : isPastDue ? (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Deadline Overdue
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    Not Submitted
                  </span>
                )}

                {submission?.similarityScore !== null && submission?.similarityScore !== undefined && (
                  <SimilarityScore score={submission.similarityScore} size="badge" showLabel={false} />
                )}
              </div>
            </div>

            {submission ? (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Submitted file: <span className="font-semibold text-slate-800">{submission.fileName}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('submission')}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
                  >
                    View Details
                  </button>
                  {report && (
                    <Link
                      to={`/student/reports/${report.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 text-center transition-colors shadow-xs"
                    >
                      View Report
                    </Link>
                  )}
                </div>
              </div>
            ) : isPastDue ? (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs text-rose-600 font-medium">
                  The deadline for this assignment expired on {new Date(assignment.dueDate).toLocaleDateString()}. New submissions are locked.
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <Link
                  to={`/student/assignments/${assignment.id}/submit`}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit Assignment</span>
                </Link>
                <p className="text-[11px] text-center text-slate-500">
                  Due {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata quick strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Instructor</span>
            <span className="font-bold text-slate-800">{assignment.teacherName}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Submission Deadline</span>
            <span className={`font-bold ${isPastDue ? 'text-rose-600' : 'text-slate-800'}`}>
              {new Date(assignment.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Permitted Formats</span>
            <span className="font-bold text-slate-800 font-mono">{assignment.allowedFormats.join(', ')}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[11px] mb-0.5">Grading Scale</span>
            <span className="font-bold text-slate-800">{assignment.maxMarks} Total Marks</span>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('instructions')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'instructions'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Instructions & Rubrics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submission')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'submission'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Submission Status</span>
          {submission && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        {report && (
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'report'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Similarity Scan ({report.overallScore}%)</span>
          </button>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'instructions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3">
                Comprehensive Instructions
              </h3>
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-5 rounded-xl border border-slate-100">
                {assignment.instructions}
              </div>
            </div>

            {/* Reference Attachment */}
            {assignment.attachment && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Course Attachment & Specifications
                </h4>
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 text-brand-600 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{assignment.attachment.name}</p>
                      <p className="text-[11px] text-slate-500">{assignment.attachment.size} • PDF Document</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadAttachment(assignment.attachment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Rules Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" />
                Submission Guidelines
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Maximum file size is restricted to <strong>{assignment.maxFileSizeMb || 10} MB</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Ensure diagrams and formulas are clearly legible for OCR extraction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Use standard academic IEEE / ACM citation formats for external sources.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'submission' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
          {submission ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Submitted Document</h3>
                  <p className="text-xs text-slate-500">Record ID: {submission.id}</p>
                </div>
                <StatusBadge status={submission.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">File Name</span>
                  <span className="text-xs font-bold text-slate-800 break-all">{submission.fileName}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Submission Date</span>
                  <span className="text-xs font-bold text-slate-800">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">File Size</span>
                  <span className="text-xs font-bold text-slate-800">{submission.fileSize}</span>
                </div>
              </div>

              {submission.teacherNotes && (
                <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-xl">
                  <h4 className="text-xs font-bold text-brand-900 mb-1">Faculty Feedback:</h4>
                  <p className="text-xs text-brand-800">{submission.teacherNotes}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="No submission found"
              description="You have not yet submitted a document for this assignment."
              action={
                !isPastDue && (
                  <Link
                    to={`/student/assignments/${assignment.id}/submit`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Submission</span>
                  </Link>
                )
              }
            />
          )}
        </div>
      )}

      {activeTab === 'report' && report && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Document Similarity Preview</h3>
              <p className="text-xs text-slate-500">Scan ID: {report.id}</p>
            </div>
            <Link
              to={`/student/reports/${report.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <span>Open Full Interactive Report</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <SimilarityScore score={report.overallScore} size="lg" showDisclaimer={false} />
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-900">
                OCR Textract Extraction Completed
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extracted {report.textractMetadata.wordsCount.toLocaleString()} words across {report.textractMetadata.pagesExtracted} pages with {report.textractMetadata.confidenceScore} OCR confidence.
              </p>
              <div className="pt-2">
                <Link
                  to={`/student/reports/${report.id}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-xs"
                >
                  View Matched Passages & Sources
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
