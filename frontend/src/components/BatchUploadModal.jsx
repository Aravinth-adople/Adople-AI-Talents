import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/constants';

export default function BatchUploadModal({ isOpen, onClose, onUploadSuccess, activeJdId }) {
  if (!isOpen) return null;

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = incomingFiles => {
    const list = Array.from(incomingFiles);
    setFiles(list);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const startUpload = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(20);
    setStatusMessage(`Uploading ${files.length} resume file(s)...`);
    setLogs([`Starting ingestion of ${files.length} resume(s)...`]);

    try {
      const formData = new FormData();
      files.forEach(f => {
        formData.append('files', f);
      });
      formData.append('active_jd_id', activeJdId);

      setProgress(50);
      setStatusMessage('Extracting content and automatically evaluating with AI...');
      setLogs(prev => [...prev, 'Running text extraction and AI evaluation...']);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Upload failed on server');
      const data = await res.json();

      setProgress(100);
      setStatusMessage(`Complete! Ingested and automatically evaluated ${data.successful_count} resumes.`);
      setLogs(prev => [
        ...prev,
        `Indexed and AI evaluated ${data.successful_count} resumes.`,
        ...(data.errors || []).map(err => `[WARN] ${err.filename}: ${err.error}`)
      ]);

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      setTimeout(() => {
        onClose();
        setFiles([]);
        setIsProcessing(false);
        setProgress(0);
        setLogs([]);
      }, 1500);
    } catch (err) {
      setStatusMessage(`Upload failed: ${err.message}`);
      setLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop active" onClick={onClose}>
      <div className="clean-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h3 className="modal-heading">Batch Resume Upload</h3>
            <p className="modal-subheading">Upload 1, 10, 100 or more resumes in a single batch.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content-area">
          {/* Dropzone */}
          <div
            className={`drop-area ${isDragging ? 'dragover' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
            <div className="drop-illustration">
              <UploadCloud size={36} strokeWidth={1.8} />
            </div>
            <h4>Drag &amp; drop resumes here</h4>
            <p>
              or <span className="link-btn">browse files</span> from your computer
            </p>
            <span className="file-format-note">
              Supports PDF, DOCX, DOC, TXT, Images (Fast digital extraction + RapidOCR fallback)
            </span>
          </div>

          {/* Selected files preview */}
          {files.length > 0 && (
            <div className="files-preview-box">
              <div className="preview-header">
                <span>{files.length} resume(s) selected</span>
                {!isProcessing && (
                  <button
                    type="button"
                    className="clear-btn-text"
                    onClick={() => setFiles([])}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="preview-items">
                {files.slice(0, 6).map((f, i) => (
                  <div key={i} className="preview-item-row">
                    <span>
                      <FileText size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {f.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{formatFileSize(f.size)}</span>
                  </div>
                ))}
                {files.length > 6 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '2px' }}>
                    ...and {files.length - 6} more files
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Section */}
          {isProcessing && (
            <div className="progress-container">
              <div className="progress-info">
                <span>{statusMessage}</span>
                <span style={{ fontWeight: 600 }}>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              {logs.length > 0 && (
                <div className="log-output">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={startUpload}
            disabled={files.length === 0 || isProcessing}
          >
            <span>{isProcessing ? 'Processing...' : 'Start Batch Processing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
