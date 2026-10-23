import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { uploadResumes } from '../services/api';
import { formatFileSize } from '../utils/constants';

export default function UploadPage({ showToast }) {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = incomingFiles => {
    const list = Array.from(incomingFiles);
    setFiles(list);
    setUploadResult(null);
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

  const executeUpload = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(15);
    setStatusMessage(`Uploading ${files.length} resume(s)...`);
    setLogs(['Connecting to FastAPI backend...', 'Azure OpenAI automatic classification & scoring active']);

    try {
      setProgress(35);
      setStatusMessage('Extracting resume content, metadata, and graduation years...');
      setLogs(prev => [
        ...prev,
        'Running PyMuPDF text & structure extractor...',
        'Checking OCR fallback for scanned pages...'
      ]);

      setProgress(60);
      setStatusMessage('Classifying domain and automatically evaluating with AI...');
      setLogs(prev => [
        ...prev,
        'Running AI evaluation engine...',
        'Detecting resume domain classification and calculating fit scores...'
      ]);

      const data = await uploadResumes(files, 'ai-engineer');

      setProgress(90);
      setStatusMessage('Finalizing ingestion and indexing candidates...');
      setLogs(prev => [
        ...prev,
        'Categorized candidate profiles across domains...',
        'Computed skill overlap and gap analysis...'
      ]);

      setTimeout(() => {
        setProgress(100);
        setStatusMessage(`Successfully processed ${data.successful_count} resume(s)!`);
        setLogs(prev => [
          ...prev,
          `Ingested ${data.successful_count} resumes into database with automatic AI scores.`,
          ...(data.errors || []).map(err => `[WARNING] ${err.filename}: ${err.error}`)
        ]);
        setUploadResult(data);
        setIsProcessing(false);
        if (showToast) {
          showToast(`Batch processed: ${data.successful_count} resumes automatically evaluated by AI.`, 'success');
        }
      }, 600);
    } catch (err) {
      setStatusMessage(`Upload failed: ${err.message}`);
      setLogs(prev => [...prev, `[ERROR] ${err.message}`]);
      setIsProcessing(false);
      if (showToast) showToast('Upload processing failed', 'error');
    }
  };

  const resetAll = () => {
    setFiles([]);
    setProgress(0);
    setStatusMessage('');
    setLogs([]);
    setUploadResult(null);
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-main-title">Batch Resume Ingestion Center</h1>
          <p className="page-main-subtitle">
            Upload resumes in PDF, DOCX, or TXT. Each resume is automatically read, classified into domain types, and scored by Azure OpenAI.
          </p>
        </div>
      </div>

      <div className="upload-page-grid">
        {/* Left Side: Upload Zone */}
        <div className="upload-left-panel">
          {/* Large Drag and Drop Area */}
          <div
            className={`upload-drop-zone-large ${isDragging ? 'dragover' : ''}`}
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
            <div className="upload-icon-circle">
              <UploadCloud size={44} strokeWidth={1.8} />
            </div>
            <h3 className="drop-title">Drag &amp; drop resume files here</h3>
            <p className="drop-sub">
              or <span className="drop-link">browse files</span> from your computer
            </p>
            <div className="drop-badges-row">
              <span className="drop-format-badge">PDF</span>
              <span className="drop-format-badge">DOCX</span>
              <span className="drop-format-badge">TXT</span>
              <span className="drop-format-badge">Images / Scanned OCR</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="upload-actions-bar">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetAll}
              disabled={isProcessing || files.length === 0}
            >
              Clear Selection
            </button>

            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '9px 24px', fontSize: '0.9rem' }}
              onClick={executeUpload}
              disabled={files.length === 0 || isProcessing}
            >
              <UploadCloud size={16} />
              <span>{isProcessing ? 'Processing Batch...' : `Start Ingestion (${files.length} files)`}</span>
            </button>
          </div>
        </div>

        {/* Right Side: Selected Files Queue & Live Logs */}
        <div className="upload-right-panel">
          {/* Progress Box */}
          {(isProcessing || progress > 0) && (
            <div className="upload-progress-card">
              <div className="progress-info-row">
                <span className="progress-label-text">{statusMessage}</span>
                <span className="progress-percent-label">{progress}%</span>
              </div>
              <div className="progress-track-large">
                <div className="progress-fill-large" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Success Result Summary */}
          {uploadResult && (
            <div className="upload-success-card">
              <div className="success-header">
                <CheckCircle2 size={24} color="#059669" />
                <div>
                  <h4 className="success-title">Batch Processing Completed!</h4>
                  <p className="success-desc">
                    {uploadResult.successful_count} candidate profiles indexed and scored.
                  </p>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/candidates')}
                >
                  <FolderOpen size={15} />
                  <span>View in Candidate Directory</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Selected Files Queue */}
          <div className="queue-card">
            <div className="queue-header">
              <span className="queue-title">Selected Files Queue ({files.length})</span>
            </div>

            <div className="queue-list">
              {files.length === 0 ? (
                <div className="queue-empty">No files selected. Drag resumes into the dropzone to start.</div>
              ) : (
                files.map((file, idx) => (
                  <div key={idx} className="queue-item">
                    <div className="queue-item-left">
                      <FileText size={15} className="queue-file-icon" />
                      <span className="queue-filename" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <span className="queue-filesize">{formatFileSize(file.size)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Processing Logs Console */}
          {logs.length > 0 && (
            <div className="console-card">
              <span className="console-title">Extraction &amp; Ingestion Console</span>
              <div className="console-output">
                {logs.map((log, i) => (
                  <div key={i} className="console-line">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
