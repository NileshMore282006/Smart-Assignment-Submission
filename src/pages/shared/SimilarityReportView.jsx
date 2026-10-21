import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  BookOpen, 
  Layers, 
  Cpu, 
  Download,
  Clock,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import SimilarityScore from '../../components/common/SimilarityScore';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function SimilarityReportView() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const { reports, submissions, updateReview } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('passages'); // 'passages' | 'documents' | 'summary'
  const [selectedPassageId, setSelectedPassageId] = useState(null);
  const [teacherReviewNote, setTeacherReviewNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const report = useMemo(() => {
    return reports.find(r => String(r.id) === String(id));
  }, [reports, id]);

  const submission = useMemo(() => {
    if (!report?.submissionId) return null;
    return submissions.find(s => String(s.id) === String(report.submissionId));
  }, [submissions, report]);

  if (!report) {
    return (
      <EmptyState
        title="Report Not Found"
        description={`No similarity report exists with identifier "${id}".`}
        action={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            Go Back
          </button>
        }
      />
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateReviewStatus = async (newStatus) => {
    if (!submission) return;
    setIsUpdating(true);
    try {
      await updateReview(submission.id, newStatus, teacherReviewNote);
      toast.success(`Report review status updated to: ${newStatus.replace('_', ' ')}`);
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 print-card">
      {/* Top Back bar & Actions (no-print) */}
      <div className="no-print flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous screen</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => toast.success('Simulated export: Report PDF saved to downloads.')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF (Demo)</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
                Official Similarity Report
              </span>
              <span className="text-xs font-mono text-slate-400">
                ID: {report.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Generated {new Date(report.generatedAt).toLocaleString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.assignmentTitle}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
              <span>Author: <strong className="text-slate-800">{report.studentName}</strong> ({report.studentNumber})</span>
              <span>Document: <strong className="font-mono text-slate-700">{submission?.fileName || 'Uploaded_Document.pdf'}</strong></span>
            </div>
          </div>

          {/* Hero Circular Score Gauge */}
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 shrink-0 min-w-[180px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Overall Match Score
            </span>
            <SimilarityScore score={report.overallScore} size="lg" showLabel={true} />
            <span className="text-[10px] text-slate-400 mt-2 font-mono">
              OCR Engine: Textract
            </span>
          </div>
        </div>

        {/* Ethical Academic Advisory Notice */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700 leading-relaxed">
          <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <p>
            <strong>Academic Evaluation Advisory:</strong> Similarity indicates overlapping textual patterns against indexed journals, open internet sources, and institutional repositories. It is <em>not</em> an automated accusation or confirmation of academic misconduct. All highlighted passages require objective faculty appraisal for proper attribution and quotation standards.
          </p>
        </div>

        {/* Metadata summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Pages Extracted</span>
            <span className="font-bold text-slate-800">{report.textractMetadata.pagesExtracted} Pages</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Word Count</span>
            <span className="font-bold text-slate-800">{report.textractMetadata.wordsCount.toLocaleString()} Words</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">OCR Confidence</span>
            <span className="font-bold text-emerald-700">{report.textractMetadata.confidenceScore}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Review Disposition</span>
            <StatusBadge status={report.reviewStatus} size="sm" />
          </div>
        </div>

        {/* Teacher Review Actions (Teacher only, or when viewing as faculty) */}
        {role === 'teacher' && (
          <div className="no-print p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Faculty Review Actions
              </span>
              <span className="text-[11px] text-indigo-700">Currently: <strong className="capitalize">{report.reviewStatus?.replace('_', ' ')}</strong></span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateReviewStatus('reviewed')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Reviewed (Clear)</span>
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateReviewStatus('needs_further_review')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Flag for Further Investigation</span>
              </button>

              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleUpdateReviewStatus('pending_review')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                Reset to Pending
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="no-print border-b border-slate-200 flex items-center gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('passages')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'passages'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Matching Passages ({report.matchingPassages?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'documents'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matched Sources ({report.matchedDocuments?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Textract OCR & Metrics</span>
        </button>
      </div>

      {/* Tab 1: Matching Passages */}
      {activeTab === 'passages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Side-by-side comparative inspection of flagged passages</span>
            <span className="font-semibold text-slate-700">Highlighted fragments indicate similarity &gt; 80%</span>
          </div>

          <div className="space-y-4">
            {report.matchingPassages?.map((passage, idx) => (
              <div
                key={passage.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Page {passage.page}, Paragraph {passage.paragraph}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {passage.matchType}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    {passage.similarity}% Text Match
                  </span>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Paper Column */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Student Submitted Text
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed font-sans">
                      <mark className="bg-rose-200/80 text-rose-950 font-medium px-1 py-0.5 rounded">
                        {passage.studentExcerpt}
                      </mark>
                    </p>
                  </div>

                  {/* Matched Source Column */}
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                        Matched External Source
                      </span>
                      <span className="text-[10px] font-semibold text-amber-900 truncate max-w-[200px]">
                        {passage.sourceTitle}
                      </span>
                    </div>
                    <p className="text-xs text-amber-950 leading-relaxed font-sans">
                      <mark className="bg-amber-200/80 text-amber-950 font-medium px-1 py-0.5 rounded">
                        {passage.sourceExcerpt}
                      </mark>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Matched Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Matched Sources & Repositories
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of sources contributing to the overall similarity percentage
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {report.matchedDocuments?.map((doc) => (
              <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                      {doc.sourceType}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {doc.matchedWordCount} words matched
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {doc.title}
                  </h4>

                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 hover:underline"
                  >
                    <span className="truncate max-w-md">{doc.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-slate-900 block leading-tight">
                      {doc.matchPercentage}%
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Total Document
                    </span>
                  </div>
                  <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, doc.matchPercentage * 2)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Textract OCR & Synthesis Metrics */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Amazon Textract OCR Analysis Telemetry
              </h3>
              <p className="text-xs text-slate-500">
                Optical character recognition metrics generated from the submitted binary
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Detected Language</span>
                <span className="text-sm font-bold text-slate-800">{report.textractMetadata.detectedLanguage}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Total Characters</span>
                <span className="text-sm font-bold text-slate-800">{report.textractMetadata.charactersCount.toLocaleString()}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">OCR Model Confidence</span>
                <span className="text-sm font-bold text-emerald-700">{report.textractMetadata.confidenceScore}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Automated Integrity Synthesis
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {report.summaryNotes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
