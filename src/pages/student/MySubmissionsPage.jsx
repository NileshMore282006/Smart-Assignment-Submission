import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileCheck2, 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  FileText, 
  Eye, 
  Calendar,
  Clock,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import StatusBadge from '../../components/common/StatusBadge';
import SimilarityScore from '../../components/common/SimilarityScore';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function MySubmissionsPage() {
  const { user } = useAuth();
  const { submissions, assignments } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const pageSize = 8;

  // Filter submissions by current user
  const mySubmissions = useMemo(() => {
    return submissions.filter(s => String(s.studentId) === String(user?.id));
  }, [submissions, user?.id]);

  // Assignments mapping for deadline status
  const assignmentsMap = useMemo(() => {
    const map = {};
    assignments.forEach(a => {
      map[String(a.id)] = a;
    });
    return map;
  }, [assignments]);

  // Filtered
  const filteredSubmissions = useMemo(() => {
    return mySubmissions.filter((sub) => {
      const matchesSearch = 
        sub.assignmentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [mySubmissions, searchQuery, statusFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="My Submission Records"
        description="Track uploaded documents, monitor OCR processing stages, and review document similarity scores."
        badge={`${mySubmissions.length} Submissions`}
        actions={
          <Link
            to="/student/assignments"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <span>Submit New Assignment</span>
          </Link>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full sm:max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            placeholder="Search by assignment, file name..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'under_review', label: 'Under Review' },
              { value: 'processing', label: 'Processing' },
            ]}
          />

          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={clearFilters}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Submissions Table */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title="No submissions found"
          description={
            mySubmissions.length === 0
              ? 'You have not submitted any coursework yet. Browse assignments to get started.'
              : 'No submissions match your search query.'
          }
          action={
            <Link
              to="/student/assignments"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              Browse Assignments
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Assignment & Subject</th>
                  <th className="py-3.5 px-4">Uploaded File</th>
                  <th className="py-3.5 px-4">Submission Date</th>
                  <th className="py-3.5 px-4">Processing Status</th>
                  <th className="py-3.5 px-4">Similarity Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map((sub) => {
                  const assignment = assignmentsMap[sub.assignmentId];
                  const isLate = assignment && new Date(sub.submittedAt) > new Date(assignment.dueDate);

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-bold text-slate-900 block truncate max-w-xs">
                          {sub.assignmentTitle}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-slate-500">{sub.subject}</span>
                          {isLate && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Late
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                              {sub.fileName}
                            </span>
                            <span className="text-[11px] text-slate-400">{sub.fileSize}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-slate-800 font-medium block">
                          {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={sub.status} />
                      </td>

                      <td className="py-4 px-4">
                        {sub.similarityScore !== null && sub.similarityScore !== undefined ? (
                          <SimilarityScore score={sub.similarityScore} size="badge" showLabel={true} />
                        ) : (
                          <span className="text-xs text-slate-400 italic">Processing OCR...</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {sub.similarityReportId && (
                            <Link
                              to={`/student/reports/${sub.similarityReportId}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                            >
                              <span>Report</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submission Details
                </h3>
                <p className="text-xs text-slate-500">Record ID: {selectedSubmission.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Assignment</span>
                <span className="font-bold text-slate-900 text-sm">{selectedSubmission.assignmentTitle}</span>
                <span className="text-[11px] text-brand-600 font-semibold block mt-0.5">{selectedSubmission.subject}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Document File</span>
                  <span className="font-bold text-slate-800 break-all">{selectedSubmission.fileName}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedSubmission.fileSize}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px]">Timestamp</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px] mb-1">Status</span>
                  <StatusBadge status={selectedSubmission.status} />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block text-[11px] mb-1">Similarity Result</span>
                  {selectedSubmission.similarityScore !== null ? (
                    <SimilarityScore score={selectedSubmission.similarityScore} size="badge" />
                  ) : (
                    <span className="text-slate-500 font-medium">Scanning</span>
                  )}
                </div>
              </div>

              {selectedSubmission.teacherNotes && (
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl">
                  <span className="text-brand-900 font-bold block mb-1">Faculty Feedback:</span>
                  <p className="text-brand-800">{selectedSubmission.teacherNotes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Demo file download started: ${selectedSubmission.fileName}`);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Copy</span>
              </button>

              {selectedSubmission.similarityReportId && (
                <Link
                  to={`/student/reports/${selectedSubmission.similarityReportId}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-xs"
                >
                  View Similarity Report
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
