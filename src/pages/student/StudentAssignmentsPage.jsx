import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileCheck2, 
  Upload, 
  Filter, 
  RotateCcw, 
  Search, 
  ArrowUpDown,
  FileText,
  User,
  ChevronRight,
  LayoutGrid,
  List
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

export default function StudentAssignmentsPage() {
  const { user } = useAuth();
  const { assignments, submissions } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDateAsc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const pageSize = 6;

  // Filter to published assignments
  const publishedAssignments = useMemo(() => {
    return assignments.filter(a => a.status === 'published');
  }, [assignments]);

  // Unique subjects
  const subjects = useMemo(() => {
    const set = new Set(publishedAssignments.map(a => a.subject));
    return Array.from(set);
  }, [publishedAssignments]);

  // My submissions mapping
  const submissionsMap = useMemo(() => {
    const map = {};
    submissions.filter(s => String(s.studentId) === String(user?.id)).forEach(s => {
      map[String(s.assignmentId)] = s;
    });
    return map;
  }, [submissions, user?.id]);

  // Filtered & Sorted
  const filteredAssignments = useMemo(() => {
    return publishedAssignments.filter((asg) => {
      // Search
      const matchesSearch = 
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Subject
      const matchesSubject = subjectFilter === 'all' || asg.subject === subjectFilter;

      // Status
      const submission = submissionsMap[String(asg.id)];
      const isPastDue = new Date(asg.dueDate) < new Date();
      let matchesStatus = true;
      if (statusFilter === 'submitted') {
        matchesStatus = !!submission;
      } else if (statusFilter === 'pending') {
        matchesStatus = !submission && !isPastDue;
      } else if (statusFilter === 'overdue') {
        matchesStatus = !submission && isPastDue;
      }

      return matchesSearch && matchesSubject && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'dueDateAsc') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'dueDateDesc') {
        return new Date(b.dueDate) - new Date(a.dueDate);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [publishedAssignments, searchQuery, subjectFilter, statusFilter, sortBy, submissionsMap]);

  // Pagination slice
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, currentPage]);

  const hasActiveFilters = searchQuery || subjectFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'dueDateAsc';

  const clearFilters = () => {
    setSearchQuery('');
    setSubjectFilter('all');
    setStatusFilter('all');
    setSortBy('dueDateAsc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Coursework Assignments"
        description="Explore published problem sets, read submission guidelines, and upload documents for automated similarity analysis."
        badge={`${filteredAssignments.length} Available`}
        actions={
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-brand-50 text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-brand-50 text-brand-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            placeholder="Search by title, subject..."
          />

          <FilterDropdown
            label="Subject"
            value={subjectFilter}
            onChange={(val) => { setSubjectFilter(val); setCurrentPage(1); }}
            options={subjects}
          />

          <FilterDropdown
            label="Status"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending Submission' },
              { value: 'submitted', label: 'Submitted' },
              { value: 'overdue', label: 'Past Deadline' },
            ]}
          />

          <FilterDropdown
            icon={ArrowUpDown}
            value={sortBy}
            onChange={(val) => { setSortBy(val); setCurrentPage(1); }}
            options={[
              { value: 'dueDateAsc', label: 'Due Date: Earliest First' },
              { value: 'dueDateDesc', label: 'Due Date: Latest First' },
              { value: 'title', label: 'Alphabetical: A to Z' },
            ]}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Filtering {filteredAssignments.length} of {publishedAssignments.length} assignments</span>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Content Rendering: Grid vs Table */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments match your criteria"
          description="Try modifying your keyword search or adjusting the subject/status filters."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
            >
              Clear Filters
            </button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((asg) => {
            const submission = submissionsMap[asg.id];
            const isPastDue = new Date(asg.dueDate) < new Date();

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-brand-300 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-100">
                      {asg.subject}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {asg.courseCode}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors line-clamp-2">
                    <Link to={`/student/assignments/${asg.id}`}>
                      {asg.title}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Instructor
                      </span>
                      <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                        {asg.teacherName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline
                      </span>
                      <span className={`font-semibold ${isPastDue ? 'text-rose-600' : 'text-slate-700'}`}>
                        {new Date(asg.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Allowed Formats</span>
                      <span className="font-mono text-[11px] text-slate-700">
                        {asg.allowedFormats.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {submission ? (
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status="submitted" />
                        {submission.similarityScore !== null && (
                          <SimilarityScore score={submission.similarityScore} size="badge" showLabel={false} />
                        )}
                      </div>
                    ) : isPastDue ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-500">
                        Overdue
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/student/assignments/${asg.id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Details
                    </Link>

                    {!submission && !isPastDue && (
                      <Link
                        to={`/student/assignments/${asg.id}/submit`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Assignment</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map((asg) => {
                  const submission = submissionsMap[asg.id];
                  const isPastDue = new Date(asg.dueDate) < new Date();

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          to={`/student/assignments/${asg.id}`}
                          className="font-bold text-slate-900 hover:text-brand-600 block line-clamp-1"
                        >
                          {asg.title}
                        </Link>
                        <span className="text-xs text-slate-400 font-mono">{asg.courseCode}</span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {asg.subject}
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {asg.teacherName}
                      </td>
                      <td className="py-4 px-4">
                        <span className={isPastDue ? 'text-rose-600 font-semibold' : 'text-slate-700'}>
                          {new Date(asg.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {submission ? (
                          <div className="flex items-center gap-1.5">
                            <StatusBadge status="submitted" />
                            {submission.similarityScore !== null && (
                              <SimilarityScore score={submission.similarityScore} size="badge" showLabel={false} />
                            )}
                          </div>
                        ) : isPastDue ? (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-500">
                            Overdue
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/student/assignments/${asg.id}`}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            View
                          </Link>
                          {!submission && !isPastDue && (
                            <Link
                              to={`/student/assignments/${asg.id}/submit`}
                              className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors"
                            >
                              Submit
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
      {filteredAssignments.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredAssignments.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}
