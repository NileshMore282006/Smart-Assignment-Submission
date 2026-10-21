import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle, AlertCircle, FileText, Image, RefreshCw } from 'lucide-react';

const DEFAULT_ALLOWED = ['PDF', 'TXT', 'DOCX', 'PNG', 'JPG', 'JPEG'];

export default function FileUpload({
  onFileSelect,
  selectedFile,
  onClear,
  allowedFormats = DEFAULT_ALLOWED,
  maxSizeMb = 10,
  isUploading = false,
  uploadProgress = 0,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setErrorMessage('');
    if (!file) return false;

    // Check size
    const sizeInMb = file.size / (1024 * 1024);
    if (sizeInMb > maxSizeMb) {
      setErrorMessage(`File exceeds the maximum limit of ${maxSizeMb} MB (selected file is ${sizeInMb.toFixed(1)} MB).`);
      return false;
    }

    // Check extension
    const extension = file.name.split('.').pop()?.toUpperCase();
    const normalizedAllowed = allowedFormats.map(f => f.toUpperCase().replace('.', ''));
    if (!extension || !normalizedAllowed.includes(extension)) {
      setErrorMessage(`Invalid format ".${extension}". Permitted formats: ${allowedFormats.join(', ')}.`);
      return false;
    }

    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const getFileIcon = (fileName = '') => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return <Image className="w-8 h-8 text-indigo-500" />;
    }
    return <FileText className="w-8 h-8 text-brand-600" />;
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept={allowedFormats.map(ext => `.${ext.toLowerCase()}`).join(',')}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-brand-500 bg-brand-50/60 ring-4 ring-brand-500/10'
              : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-100">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h4 className="text-base font-bold text-slate-800">
            Choose a file or drag & drop it here
          </h4>
          <p className="text-xs text-slate-500 mt-1.5">
            Supported formats: <span className="font-semibold text-slate-700">{allowedFormats.join(', ')}</span> (Up to {maxSizeMb} MB)
          </p>

          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
          >
            Browse from computer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || 'Document'}
                </p>
              </div>
            </div>

            {!isUploading && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  title="Replace file"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove file"
                  aria-label="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Upload Progress Simulation Bar */}
          {isUploading && (
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-brand-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                  Uploading & extracting text OCR...
                </span>
                <span className="font-bold text-slate-700">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMessage && (
        <div className="mt-2.5 flex items-center gap-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
