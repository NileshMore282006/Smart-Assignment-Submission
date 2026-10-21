import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  RotateCcw, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import StatusBadge from '../../components/common/StatusBadge';
import SimilarityScore from '../../components/common/SimilarityScore';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function TeacherReportsPage() {
  const { reports } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'high_similarity' | 'pending_review' | 'reviewed'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((rep) => {
      const matchesSearch = 
        (rep.studentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rep.assignmentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(rep.id).toLowerCase().includes(searchQuery.toLowerCase());

      let matchesType = true;
      if (filterType === 'high_similarity') {
        matchesType = rep.overallScore > 35;
      } else if (filterType === 'pending_review') {
        matchesType = rep.reviewStatus === 'pending_review';
      } else if (filterType === 'reviewed') {
        matchesType = rep.reviewStatus === 'reviewed';
      } else if (filterType === 'flagged') {
        matchesType = rep.reviewStatus === 'needs_further_review';
      }

      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, filterType]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Similarity Reports Audit"
        description="Comprehensive repository of Textract document scans and vector similarity indices requiring faculty adjudication."
        badge={`${reports.length} Generated Reports`}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full sm:max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            placeholder="Search report ID, student, assignment..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterDropdown
            label="Filter Category"
            value={filterType}
            onChange={(val) => { setFilterType(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Reports' },
              { value: 'high_similarity', label: 'High Similarity (> 35%)' },
              { value: 'pending_review', label: 'Pending Review' },
              { value: 'flagged', label: 'Flagged for Review' },
              { value: 'reviewed', label: 'Reviewed (Clear)' },
            ]}
          />

          {(searchQuery || filterType !== 'all') && (
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

      {/* Reports Table */}
      {filteredReports.length === 0 ? (
        <EmptyState
          title="No reports match your filters"
          description="Adjust your search criteria to locate reports."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Assignment & Subject</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Similarity Score</th>
                  <th className="py-3.5 px-4">Matched Sources</th>
                  <th className="py-3.5 px-4">Review Disposition</th>
                  <th className="py-3.5 px-4">Generated Date</th>
                  <th className="py-3.5 px-4 text-right">Report Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-slate-900 block truncate max-w-xs">
                        {rep.assignmentTitle}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Report ID: {rep.id}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-900 block">{rep.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{rep.studentNumber}</span>
                    </td>

                    <td className="py-4 px-4">
                      <SimilarityScore score={rep.overallScore} size="badge" showLabel={true} />
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-semibold text-slate-800">
                        {rep.matchedDocuments?.length || 0} Sources
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {rep.matchingPassages?.length || 0} excerpts
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={rep.reviewStatus} size="sm" />
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {new Date(rep.generatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/teacher/reports/${rep.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors shadow-2xs"
                      >
                        <span>Audit Report</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredReports.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredReports.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}
