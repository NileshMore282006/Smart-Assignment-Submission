import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  PlusCircle, 
  FileText, 
  Calendar, 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  Save,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import toast from 'react-hot-toast';

const SUBJECT_OPTIONS = [
  'Cloud Computing',
  'Database Management',
  'Web Development',
  'Computer Networks',
  'Operating Systems',
  'Artificial Intelligence',
  'Cybersecurity & Cryptography'
];

export default function CreateAssignmentPage() {
  const { user } = useAuth();
  const { createAssignment } = useData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Cloud Computing',
    courseCode: 'CS-601',
    description: '',
    instructions: '',
    dueDate: '',
    dueTime: '23:59',
    maxMarks: 100,
    allowedFormats: ['PDF', 'DOCX'],
    maxFileSizeMb: 10,
    status: 'published',
  });

  const [referenceFile, setReferenceFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const toggleFormat = (format) => {
    setFormData(prev => {
      const exists = prev.allowedFormats.includes(format);
      if (exists && prev.allowedFormats.length === 1) {
        toast.error('You must allow at least one file format');
        return prev;
      }
      return {
        ...prev,
        allowedFormats: exists
          ? prev.allowedFormats.filter(f => f !== format)
          : [...prev.allowedFormats, format]
      };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Assignment title is required';
    else if (formData.title.length > 120) errs.title = 'Title must be under 120 characters';

    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    else {
      const selected = new Date(`${formData.dueDate}T${formData.dueTime}`);
      if (selected <= new Date()) {
        errs.dueDate = 'Due date must be in the future';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (targetStatus = 'published') => {
    if (targetStatus === 'published' && !validate()) {
      return;
    }

    setLoading(true);
    try {
      const dueDateTime = formData.dueDate
        ? new Date(`${formData.dueDate}T${formData.dueTime}`).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      await createAssignment({
        title: formData.title,
        subject: formData.subject,
        courseCode: formData.courseCode,
        teacherId: user?.id || 'usr-tea-1',
        teacherName: user?.name || 'Dr. Alan Vance',
        description: formData.description,
        instructions: formData.instructions || formData.description,
        dueDate: dueDateTime,
        maxMarks: Number(formData.maxMarks) || 100,
        allowedFormats: formData.allowedFormats,
        maxFileSizeMb: Number(formData.maxFileSizeMb) || 10,
        status: targetStatus,
        attachment: referenceFile ? {
          name: referenceFile.name,
          size: `${(referenceFile.size / (1024 * 1024)).toFixed(1)} MB`,
          url: '#'
        } : null,
      });

      navigate('/teacher/assignments');
    } catch (err) {
      toast.error('Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.description) {
      setShowDiscardConfirm(true);
    } else {
      navigate('/teacher/assignments');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Manage Assignments</span>
        </button>
      </div>

      <PageHeader
        title="Create New Assignment"
        description="Configure instructions, submission guidelines, OCR formats, and publication schedules for students."
      />

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit('published'); }} className="space-y-6">
        {/* Core Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Basic Information
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assignment Title *
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.title.length}/120 characters
                </span>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, 120) })}
                placeholder="e.g. Distributed Consensus & Raft Log Compaction Implementation"
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                  errors.title ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Academic Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  {SUBJECT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Course Code *
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                  placeholder="e.g. CS-601"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Overview & Description *
                </label>
                <span className="text-[11px] text-slate-400">Brief summary displayed on cards</span>
              </div>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summarize the core requirements, objectives, and domain themes for this problem set..."
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                  errors.description ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300'
                }`}
              />
              {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Detailed Instructions & Grading Rubric
              </label>
              <textarea
                rows={5}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="1. Step-by-step implementation specifications&#10;2. Formatting standards (IEEE, ACM)&#10;3. Citations policy and similarity boundaries..."
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Guidelines Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Deadlines & Formats
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                  errors.dueDate ? 'border-rose-400' : 'border-slate-300'
                }`}
              />
              {errors.dueDate && <p className="text-xs text-rose-600 mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Due Time *
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Max Marks
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={formData.maxMarks}
                onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Formats Checkbox Group */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Allowed Document Formats (Amazon Textract OCR Compatible)
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {['PDF', 'DOCX', 'TXT', 'PNG', 'JPG'].map(fmt => {
                const checked = formData.allowedFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleFormat(fmt)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      checked
                        ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    .{fmt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max File Size */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Maximum File Size Limit
            </label>
            <div className="flex items-center gap-3">
              {[5, 10, 15, 20].map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFormData({ ...formData, maxFileSizeMb: sz })}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    formData.maxFileSizeMb === sz
                      ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {sz} MB
                </button>
              ))}
            </div>
          </div>

          {/* Optional Reference Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Optional Reference Document / Dataset
            </label>
            {referenceFile ? (
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-slate-800">{referenceFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setReferenceFile(null)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-white transition-all text-xs text-slate-600">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Upload rubric PDF or starter dataset</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setReferenceFile(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit('draft')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors shadow-2xs"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Publishing...' : 'Create & Publish'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Discard Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          navigate('/teacher/assignments');
        }}
        title="Discard Unsaved Changes?"
        message="You have entered assignment details that will be lost if you leave without saving."
        confirmText="Discard Changes"
        isDestructive={true}
      />
    </div>
  );
}
