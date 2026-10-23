import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Sparkles,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  GraduationCap,
  RefreshCw,
  FileText,
  Trash2
} from 'lucide-react';
import { getScoreBadge, CATEGORY_COLORS } from '../utils/constants';
import { evaluateCandidateWithAi, deleteCandidate } from '../services/api';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function ResumeModal({
  isOpen,
  candidate,
  onClose,
  activeJdId = 'ai-engineer',
  onStatusChange,
  onCandidateUpdated,
  onCandidateDeleted,
  showToast
}) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(candidate);

  useEffect(() => {
    setCurrentCandidate(candidate);
  }, [candidate]);

  // Auto-evaluate when modal opens if candidate has not been evaluated yet
  useEffect(() => {
    if (isOpen && currentCandidate?.id && !currentCandidate.ai_evaluated && !isEvaluating) {
      handleRunAi();
    }
  }, [isOpen, currentCandidate?.id]);

  if (!isOpen || !currentCandidate) return null;

  const resolvedScore =
    currentCandidate.active_score ??
    currentCandidate[`score_${activeJdId?.replace(/-/g, '_')}`] ??
    currentCandidate.score_ai_engineer ??
    0;
  const scoreBadge = getScoreBadge(resolvedScore);
  const catStyle = CATEGORY_COLORS[currentCandidate.primary_category] || CATEGORY_COLORS['Other'];
  const is2027 = currentCandidate.passout_year === 2027;
  const isDocx = Boolean(currentCandidate.filename?.toLowerCase().endsWith('.docx'));

  const handleRunAi = async () => {
    setIsEvaluating(true);
    try {
      const res = await evaluateCandidateWithAi(currentCandidate.id, activeJdId);
      const updatedScore =
        res.candidate?.active_score ??
        res.jd_analysis?.score ??
        res.candidate?.[`score_${activeJdId?.replace(/-/g, '_')}`] ??
        currentCandidate.active_score;
      const updatedCand = {
        ...currentCandidate,
        ...res.candidate,
        active_score: updatedScore
      };
      setCurrentCandidate(updatedCand);
      if (showToast) {
        showToast(`⚡ Azure AI evaluated ${res.candidate?.name || 'Candidate'}!`, 'success');
      }
      if (onCandidateUpdated) {
        onCandidateUpdated(updatedCand, res.jd_analysis);
      }
    } catch (err) {
      if (showToast) {
        showToast(`AI evaluation error: ${err.message}`, 'error');
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentCandidate?.id) return;
    setIsDeleting(true);
    try {
      await deleteCandidate(currentCandidate.id);
      if (showToast) {
        showToast(`Candidate ${currentCandidate.name || ''} deleted successfully`, 'success');
      }
      setShowDeleteModal(false);
      if (onCandidateDeleted) {
        onCandidateDeleted(currentCandidate.id);
      }
      onClose();
    } catch (err) {
      if (showToast) {
        showToast(`Delete failed: ${err.message}`, 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="resume-modal-overlay" onClick={onClose}>
      <div className="resume-modal-container" onClick={e => e.stopPropagation()}>
        {/* Top Header */}
        <div className="resume-modal-header">
          <div className="resume-modal-header-left">
            <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '0.9rem' }}>
              {currentCandidate.name
                ? currentCandidate.name
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                : 'CV'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {currentCandidate.name}
                </h3>
                <span
                  className="category-badge"
                  style={{
                    backgroundColor: catStyle.bg,
                    borderColor: catStyle.border,
                    color: catStyle.text,
                    fontSize: '0.72rem'
                  }}
                >
                  {currentCandidate.primary_category}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {currentCandidate.filename || 'Resume Document'} • {currentCandidate.passout_year} Batch
              </div>
            </div>
          </div>

          <div className="resume-modal-header-right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fit Score:</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: scoreBadge.color
                }}
              >
                {scoreBadge.score}%
              </span>
            </div>

            <a
              href={`/api/file/${currentCandidate.id}/download`}
              download
              className="btn btn-primary"
              style={{
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
              title="Download original resume file"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </a>

            {/* Remove / Delete Option with delete logo only, opens in-app confirm modal */}
            <button
              type="button"
              className="candidate-delete-btn"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              title="Delete candidate profile"
              aria-label="Delete candidate profile"
              style={{ marginLeft: '4px' }}
            >
              <Trash2 size={15} />
            </button>

            <button type="button" className="drawer-close" onClick={onClose} style={{ marginLeft: '4px' }} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: Split Screen (PDF Viewer + AI Analysis) */}
        <div className="resume-modal-body">
          {/* Left Side: Actual In-App PDF Viewer */}
          <div className="resume-modal-pdf-pane">
            {/* PDF View Header Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                background: '#1E293B',
                color: '#F8FAFC',
                borderBottom: '1px solid #334155',
                fontSize: '0.78rem',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <FileText size={15} color="#38BDF8" />
                <span
                  style={{
                    fontWeight: 600,
                    color: '#F1F5F9',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '350px'
                  }}
                  title={currentCandidate.filename}
                >
                  {currentCandidate.filename || 'Resume Document.pdf'}
                </span>
                <span
                  style={{
                    background: '#0F172A',
                    color: '#94A3B8',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 600
                  }}
                >
                  {isDocx ? 'DOCX' : 'PDF PREVIEW'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <a
                  href={`/api/file/${currentCandidate.id}/download`}
                  download
                  style={{
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.72rem',
                    textDecoration: 'none',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    background: '#0284C7',
                    fontWeight: 600
                  }}
                  title="Download original resume file"
                >
                  <Download size={12} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Document Render Area */}
            {isDocx ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#F8FAFC',
                  padding: '30px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <FileText size={32} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px' }}>
                  Microsoft Word Document (.docx)
                </h4>
                <p style={{ maxWidth: '420px', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                  This resume is in DOCX format. Web browsers do not natively render Word files in an iframe. You can view the extracted skills and AI breakdown on the right, or download the original document.
                </p>
                <a
                  href={`/api/file/${currentCandidate.id}/download`}
                  download
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                >
                  <Download size={15} />
                  <span>Download Word Document</span>
                </a>
              </div>
            ) : (
              <iframe
                src={`/api/file/${currentCandidate.id}#view=FitH&toolbar=1`}
                title={`${currentCandidate.name} Resume PDF`}
                className="resume-modal-iframe"
              />
            )}
          </div>

          {/* Right Side: AI Assessment & Candidate Details */}
          <div className="resume-modal-side-pane">
            {/* Status Selector */}
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Review Status:</span>
              <select
                className="status-select"
                value={currentCandidate.status || 'unreviewed'}
                onChange={e => {
                  const newStatus = e.target.value;
                  if (onStatusChange) onStatusChange(currentCandidate.id, newStatus);
                  setCurrentCandidate(prev => ({ ...prev, status: newStatus }));
                }}
                style={{ width: '140px' }}
              >
                <option value="unreviewed">Unreviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="in_review">In Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Executive Summary */}
            {isEvaluating ? (
              <div
                style={{
                  background: '#F5F3FF',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  border: '1px solid #DDD6FE',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px'
                }}
              >
                <RefreshCw size={16} className="animate-spin" color="#7C3AED" />
                <span style={{ fontSize: '0.76rem', color: '#5B21B6', fontWeight: 600 }}>
                  Analyzing resume text &amp; computing fit score...
                </span>
              </div>
            ) : currentCandidate.ai_summary ? (
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  marginBottom: '14px',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  color: '#334155'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '4px',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  <Sparkles size={13} color="#004AAC" />
                  <span>Executive Summary</span>
                </div>
                {currentCandidate.ai_summary}
              </div>
            ) : null}

            {/* Quick Contact & Education */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Email</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A', wordBreak: 'break-all' }}>
                  {currentCandidate.email || 'Not Found'}
                </span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Phone</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A' }}>
                  {currentCandidate.phone || 'Not Found'}
                </span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Graduation Batch</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: is2027 ? '#059669' : '#0F172A' }}>
                  {currentCandidate.passout_year} Batch
                </span>
              </div>
              <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>CGPA / Score</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A' }}>
                  {currentCandidate.cgpa ? `${currentCandidate.cgpa} / 10.0` : 'Not Specified'}
                </span>
              </div>
            </div>

            {/* Extracted Skills */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Extracted Skills ({(currentCandidate.skills || []).length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {(currentCandidate.skills || []).map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#334155',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 500
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Projects */}
            {currentCandidate.projects && currentCandidate.projects.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Projects ({currentCandidate.projects.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {currentCandidate.projects.map((p, idx) => {
                    const isObj = typeof p === 'object' && p !== null;
                    const title = isObj ? (p.title || 'Project') : p;
                    const desc = isObj ? p.description : '';
                    return (
                      <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#1E293B' }}>{title}</div>
                        {desc && <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>{desc}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application-level In-App Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        candidate={currentCandidate}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </div>
  );
}
