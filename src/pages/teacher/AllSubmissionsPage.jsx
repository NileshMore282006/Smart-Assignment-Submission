import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  Eye, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Download,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import StatusBadge from '../../components/common/StatusBadge';
import SimilarityScore from '../../components/common/SimilarityScore';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function AllSubmissionsPage() {
  const { submissions, assignments, updateReview } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [similarityBracket, setSimilarityBracket] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [teacherNotes, setTeacherNotes] = useState('');
  const pageSize = 8;

  // Assignment options
  const assignmentOptions = useMemo(() => {
    return assignments.map(a => ({ value: a.id, label: a.title }));
  }, [assignments]);

  // Filtered Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesSearch = 
        (sub.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.studentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.assignmentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.fileName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAssignment = assignmentFilter === 'all' || String(sub.assignmentId) === String(assignmentFilter);
      const matchesReview = reviewFilter === 'all' || sub.reviewStatus === reviewFilter;

      let matchesSimilarity = true;
      if (similarityBracket === 'low') {
        matchesSimilarity = (sub.similarityScore || 0) <= 20;
      } else if (similarityBracket === 'medium') {
        matchesSimilarity = (sub.similarityScore || 0) > 20 && (sub.similarityScore || 0) <= 50;
      } else if (similarityBracket === 'high') {
        matchesSimilarity = (sub.similarityScore || 0) > 50;
      }

      return matchesSearch && matchesAssignment && matchesReview && matchesSimilarity;
    });
  }, [submissions, searchQuery, assignmentFilter, reviewFilter, similarityBracket]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage]);

  const handleUpdateStatus = async (subId, newStatus) => {
    await updateReview(subId, newStatus, teacherNotes);
    if (activeSubmission && activeSubmission.id === subId) {
      setActiveSubmission(prev => ({ ...prev, reviewStatus: newStatus, teacherNotes }));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAssignmentFilter('all');
    setReviewFilter('all');
    setSimilarityBracket('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Student Submissions Management"
        description="Monitor submitted papers across all courses, audit OCR confidence, and conduct similarity determinations."
        badge={`${submissions.length} Submissions`}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            placeholder="Search student name, ID, or file..."
          />

          <FilterDropdown
            label="Assignment"
            value={assignmentFilter}
            onChange={(val) => { setAssignmentFilter(val); setCurrentPage(1); }}
            options={assignmentOptions}
          />

          <FilterDropdown
            label="Review Status"
            value={reviewFilter}
            onChange={(val) => { setReviewFilter(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Review States' },
              { value: 'pending_review', label: 'Pending Review' },
              { value: 'reviewed', label: 'Reviewed (Clear)' },
              { value: 'needs_further_review', label: 'Needs Further Review' },
            ]}
          />

          <FilterDropdown
            label="Similarity Range"
            value={similarityBracket}
            onChange={(val) => { setSimilarityBracket(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Ranges' },
              { value: 'low', label: 'Low (≤ 20%)' },
              { value: 'medium', label: 'Moderate (21% - 50%)' },
              { value: 'high', label: 'High Flagged (> 50%)' },
            ]}
          />
        </div>

        {(searchQuery || assignmentFilter !== 'all' || reviewFilter !== 'all' || similarityBracket !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering {filteredSubmissions.length} of {submissions.length} total records</span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title="No submissions found"
          description="Try broadening your criteria or reset the search filters."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Student Info</th>
                  <th className="py-3.5 px-4">Assignment</th>
                  <th className="py-3.5 px-4">Document File</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4">Similarity Score</th>
                  <th className="py-3.5 px-4">Review Disposition</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-slate-900 block">{sub.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{sub.studentNumber}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800 block truncate max-w-[180px]">
                        {sub.assignmentTitle}
                      </span>
                      <span className="text-[11px] text-brand-600 font-medium">{sub.subject}</span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-700 truncate max-w-[140px] block">
                          {sub.fileName}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      <span className="block font-medium">
                        {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      {sub.similarityScore !== null ? (
                        <SimilarityScore score={sub.similarityScore} size="badge" showLabel={true} />
                      ) : (
                        <span className="text-slate-400 italic text-xs">Scanning...</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={sub.reviewStatus} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSubmission(sub);
                            setTeacherNotes(sub.teacherNotes || '');
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Inspect Details & Add Notes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {sub.similarityReportId && (
                          <Link
                            to={`/teacher/reports/${sub.similarityReportId}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                          >
                            <span>Report</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredSubmissions.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSubmissions.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Quick Review & Inspection Modal */}
      {activeSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submission Audit & Triage
                </h3>
                <p className="text-xs text-slate-500">
                  {activeSubmission.studentName} • {activeSubmission.studentNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 text-[11px] block">Assignment</span>
                <span className="font-bold text-slate-900 text-sm block">{activeSubmission.assignmentTitle}</span>
                <span className="text-slate-600 block">File: <strong className="font-mono">{activeSubmission.fileName}</strong> ({activeSubmission.fileSize})</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[11px] block mb-1">OCR Status</span>
                  <StatusBadge status={activeSubmission.status} />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 text-[11px] block mb-1">Similarity Match</span>
                  {activeSubmission.similarityScore !== null ? (
                    <SimilarityScore score={activeSubmission.similarityScore} size="badge" />
                  ) : (
                    <span>Pending</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Instructor Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  value={teacherNotes}
                  onChange={(e) => setTeacherNotes(e.target.value)}
                  placeholder="Record verification notes, citation approvals, or flags for discussion..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="p-3 bg-slate-100/70 rounded-xl space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Update Review Disposition:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeSubmission.id, 'reviewed')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    Mark Reviewed (Clear)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeSubmission.id, 'needs_further_review')}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
                  >
                    Flag for Review
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Demo download started: ${activeSubmission.fileName}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Document</span>
              </button>

              {activeSubmission.similarityReportId && (
                <Link
                  to={`/teacher/reports/${activeSubmission.similarityReportId}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700"
                >
                  Open Full Report
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
