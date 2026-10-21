import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Archive, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  RotateCcw,
  BookOpen,
  Calendar,
  Users
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import SearchInput from '../../components/common/SearchInput';
import FilterDropdown from '../../components/common/FilterDropdown';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

export default function ManageAssignmentsPage() {
  const { assignments, submissions, deleteAssignment, duplicateAssignment, updateAssignment } = useData();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Subject options
  const subjects = useMemo(() => {
    return Array.from(new Set(assignments.map(a => a.subject)));
  }, [assignments]);

  // Submission counts mapping
  const submissionCounts = useMemo(() => {
    const counts = {};
    assignments.forEach(a => {
      const subs = submissions.filter(s => String(s.assignmentId) === String(a.id));
      counts[String(a.id)] = {
        total: subs.length,
        reviewed: subs.filter(s => s.reviewStatus === 'reviewed').length,
        pending: subs.filter(s => s.reviewStatus !== 'reviewed').length,
      };
    });
    return counts;
  }, [assignments, submissions]);

  // Filtered
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchesSearch = 
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = subjectFilter === 'all' || asg.subject === subjectFilter;
      const matchesStatus = statusFilter === 'all' || asg.status === statusFilter;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [assignments, searchQuery, subjectFilter, statusFilter]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAssignments.slice(start, start + pageSize);
  }, [filteredAssignments, currentPage]);

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteAssignment(assignmentToDelete.id);
      setAssignmentToDelete(null);
    } catch (e) {
      toast.error('Failed to delete assignment');
    }
  };

  const handleDuplicate = async (id) => {
    await duplicateAssignment(id);
  };

  const handleToggleArchive = async (asg) => {
    const nextStatus = asg.status === 'archived' ? 'published' : 'archived';
    await updateAssignment(asg.id, { status: nextStatus });
    toast.success(`Assignment marked as ${nextStatus}.`);
  };

  const handlePublishDraft = async (asg) => {
    await updateAssignment(asg.id, { status: 'published' });
    toast.success('Draft published to student directory!');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingAssignment) return;
    try {
      await updateAssignment(editingAssignment.id, {
        title: editingAssignment.title,
        subject: editingAssignment.subject,
        maxMarks: Number(editingAssignment.maxMarks),
      });
      setEditingAssignment(null);
    } catch (e) {
      toast.error('Failed to save changes');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Manage Assignments"
        description="Administer active coursework, review submission tallies, duplicate drafts, or archive completed modules."
        badge={`${assignments.length} Total`}
        actions={
          <Link
            to="/teacher/assignments/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Assignment</span>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full sm:max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }}
            placeholder="Search assignments by title or code..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Drafts' },
              { value: 'archived', label: 'Archived' },
            ]}
          />

          {(searchQuery || subjectFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSubjectFilter('all'); setStatusFilter('all'); setCurrentPage(1); }}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title="No assignments found"
          description="No assignments matched your search or filter configuration."
          action={
            <Link
              to="/teacher/assignments/create"
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Create New Assignment
            </Link>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Assignment Details</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedItems.map((asg) => {
                  const counts = submissionCounts[asg.id] || { total: 0, pending: 0 };
                  const isPastDue = new Date(asg.dueDate) < new Date();

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-bold text-slate-900 block truncate max-w-sm">
                          {asg.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {asg.courseCode} • Created {new Date(asg.postedDate).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700">
                        {asg.subject}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`block font-medium ${isPastDue ? 'text-rose-600' : 'text-slate-800'}`}>
                          {new Date(asg.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(asg.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {counts.total}
                          </span>
                          {counts.pending > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {counts.pending} to review
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={asg.status} />
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {asg.status === 'draft' ? (
                            <button
                              type="button"
                              onClick={() => handlePublishDraft(asg)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                              title="Publish Draft"
                            >
                              Publish
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleArchive(asg)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title={asg.status === 'archived' ? 'Unarchive' : 'Archive'}
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setEditingAssignment(asg)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Assignment"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(asg.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Duplicate Assignment"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setAssignmentToDelete(asg)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Assignment?"
        message={`Are you sure you want to delete "${assignmentToDelete?.title}"? All associated submission records will be impacted.`}
        confirmText="Delete Assignment"
        isDestructive={true}
      />

      {/* Quick Edit Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-popover border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Quick Edit Assignment
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editingAssignment.title}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={editingAssignment.subject}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={editingAssignment.maxMarks}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, maxMarks: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingAssignment(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
