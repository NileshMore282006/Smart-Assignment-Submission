import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PageHeader from '../../components/common/PageHeader';
import FileUpload from '../../components/common/FileUpload';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

export default function AssignmentSubmissionPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { assignments, submitAssignment } = useData();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [honorPledgeChecked, setHonorPledgeChecked] = useState(true);

  const assignment = useMemo(() => {
    return assignments.find(a => String(a.id) === String(id));
  }, [assignments, id]);

  if (!assignment) {
    return (
      <EmptyState
        title="Assignment not found"
        description="Could not locate the requested assignment for submission."
        action={
          <Link
            to="/student/assignments"
            className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
          >
            Back to assignments
          </Link>
        }
      />
    );
  }

  const isPastDue = new Date(assignment.dueDate) < new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to submit.');
      return;
    }
    if (!honorPledgeChecked) {
      toast.error('Please confirm the Academic Integrity Pledge.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    // Simulated progress steps
    const timer1 = setTimeout(() => setUploadProgress(45), 250);
    const timer2 = setTimeout(() => setUploadProgress(78), 500);
    const timer3 = setTimeout(() => setUploadProgress(95), 750);

    setTimeout(async () => {
      try {
        setUploadProgress(100);
        const submission = await submitAssignment({
          assignmentId: assignment.id,
          studentId: user?.id,
          studentName: user?.name,
          studentNumber: user?.studentId || 'CS-2024-8841',
          file: selectedFile,
        });

        setIsUploading(false);
        navigate(`/student/submissions`);
      } catch (err) {
        setIsUploading(false);
        toast.error('Failed to submit assignment');
      }
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <Link
          to={`/student/assignments/${assignment.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignment Details</span>
        </Link>
      </div>

      <PageHeader
        title="Submit Document"
        description={`Upload your coursework for ${assignment.title}.`}
        badge={assignment.subject}
      />

      {isPastDue && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong>Notice:</strong> The deadline for this assignment has elapsed ({new Date(assignment.dueDate).toLocaleDateString()}). Submissions may be flagged as late or rejected.
          </div>
        </div>
      )}

      {/* Assignment Summary Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Assignment Title</span>
          <span className="font-bold text-slate-800 line-clamp-1">{assignment.title}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Due Date & Time</span>
          <span className="font-bold text-slate-800">
            {new Date(assignment.dueDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Allowed Formats & Size</span>
          <span className="font-bold text-slate-800 font-mono">
            {assignment.allowedFormats.join(', ')} (Max {assignment.maxFileSizeMb || 10} MB)
          </span>
        </div>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Document Upload
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Upload your final submission file. In production, this document is securely stored on Amazon S3 and processed by Amazon Textract for optical character recognition.
          </p>

          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={(file) => setSelectedFile(file)}
            onClear={() => setSelectedFile(null)}
            allowedFormats={assignment.allowedFormats}
            maxSizeMb={assignment.maxFileSizeMb || 10}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Academic Integrity Pledge */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={honorPledgeChecked}
              onChange={(e) => setHonorPledgeChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
            />
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong>Academic Integrity Pledge:</strong> I certify that this submission represents my own original work. All external citations, referenced textbooks, algorithmic libraries, and collaborative insights have been acknowledged in accordance with university honor standards.
            </div>
          </label>
        </div>

        {/* Future Architecture Notice */}
        <div className="p-3 bg-brand-50/60 border border-brand-100 rounded-xl flex items-start gap-2.5 text-[11px] text-brand-900 leading-relaxed">
          <Cpu className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <strong>Backend Integration Notice:</strong> This frontend simulates file receipt and vector similarity calculation. Upon connecting to the Python Flask backend, this form dispatches a multipart/form-data request to Amazon S3 with an asynchronous Amazon Textract job queue.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(`/student/assignments/${assignment.id}`)}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isUploading || !selectedFile}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Uploading & Scanning ({uploadProgress}%)...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
