import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  Search, 
  Sparkles, 
  Calendar, 
  Layers, 
  ChevronRight, 
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import SimilarityScore from '../../components/common/SimilarityScore';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

export default function StudentReportsPage() {
  const { user } = useAuth();
  const { reports } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter student reports
  const myReports = useMemo(() => {
    return reports.filter(r => String(r.studentId) === String(user?.id));
  }, [reports, user?.id]);

  const filteredReports = useMemo(() => {
    return myReports.filter(r =>
      (r.assignmentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(r.id).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [myReports, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Similarity Reports"
        description="Review detailed document analysis, matched academic sources, and citation integrity feedback."
        badge={`${myReports.length} Reports`}
      />

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card">
        <SearchInput
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          placeholder="Search by assignment title or report ID..."
          className="max-w-md"
        />
      </div>

      {filteredReports.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No reports available"
          description={
            myReports.length === 0
              ? 'No similarity reports have been generated yet. Submit coursework to generate reports.'
              : 'No reports matched your search term.'
          }
          action={
            <Link
              to="/student/assignments"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700"
            >
              Browse Assignments
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {rep.id}
                  </span>
                  <StatusBadge status={rep.reviewStatus} size="sm" />
                </div>

                <div className="py-4 flex items-center gap-4">
                  <SimilarityScore score={rep.overallScore} size="sm" showLabel={false} />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                      <Link to={`/student/reports/${rep.id}`} className="hover:text-brand-600 transition-colors">
                        {rep.assignmentTitle}
                      </Link>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(rep.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Matched Sources</span>
                    <span className="font-bold text-slate-700">{rep.matchedDocuments?.length || 0} Documents</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flagged Passages</span>
                    <span className="font-bold text-slate-700">{rep.matchingPassages?.length || 0} Sections</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <Link
                  to={`/student/reports/${rep.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition-colors"
                >
                  <span>Open Full Analysis</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
