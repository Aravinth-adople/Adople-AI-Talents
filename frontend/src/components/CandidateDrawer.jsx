import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Copy,
  Mail,
  Phone,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  GraduationCap,
  Download,
  FileText,
  Trash2
} from 'lucide-react';
import { getScoreBadge, CATEGORY_COLORS } from '../utils/constants';
import { evaluateCandidateWithAi, deleteCandidate } from '../services/api';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function CandidateDrawer({
  isOpen,
  candidateData,
  onClose,
  onCopyText,
  activeJdId = 'ai-engineer',
  onOpenResumePdf,
  onCandidateUpdated,
  onCandidateDeleted,
  showToast
}) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'resume'
  const autoEvaluatedMap = useRef({});

  const candidate = candidateData?.candidate;
  const jdAnalysis = candidateData?.jd_analysis;

  const handleRunAiEvaluation = async (candId = candidate?.id) => {
    if (!candId) return;
    setIsEvaluating(true);
    try {
      const res = await evaluateCandidateWithAi(candId, activeJdId);
      if (showToast) {
        showToast(`⚡ Azure AI evaluated ${res.candidate?.name || 'Candidate'}!`, 'success');
      }
      if (onCandidateUpdated) {
        onCandidateUpdated(res.candidate, res.jd_analysis);
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
    if (!candidate?.id) return;
    setIsDeleting(true);
    try {
      await deleteCandidate(candidate.id);
      if (showToast) {
        showToast(`Candidate ${candidate.name || ''} deleted successfully`, 'success');
      }
      setShowDeleteModal(false);
      if (onCandidateDeleted) {
        onCandidateDeleted(candidate.id);
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

  // Automatically start AI evaluation when candidate profile opens if not yet evaluated
  useEffect(() => {
    if (isOpen && candidate?.id) {
      if (!candidate.ai_evaluated && !isEvaluating && !autoEvaluatedMap.current[candidate.id]) {
        autoEvaluatedMap.current[candidate.id] = true;
        handleRunAiEvaluation(candidate.id);
      }
    }
  }, [isOpen, candidate?.id, candidate?.ai_evaluated]);

  // Reset tab when candidate changes
  useEffect(() => {
    setActiveTab('overview');
  }, [candidate?.id]);

  if (!isOpen) return null;
  if (!candidate) return null;

  const resolvedScore =
    candidate.active_score ??
    candidate[`score_${activeJdId?.replace(/-/g, '_')}`] ??
    jdAnalysis?.score ??
    candidate.score_ai_engineer ??
    0;
  const scoreBadge = getScoreBadge(resolvedScore);
  const is2027 = candidate.passout_year === 2027;
  const catStyle = CATEGORY_COLORS[candidate.primary_category] || CATEGORY_COLORS['Other'];

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <div className={`side-drawer ${isOpen ? 'active' : ''}`} style={{ width: activeTab === 'resume' ? '820px' : '520px', maxWidth: '95vw', transition: 'width 0.25s ease' }}>
        {/* Drawer Header */}
        <div className="drawer-top">
          <div>
            <h3 className="drawer-name">{candidate.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
              <span
                className="category-badge"
                style={{
                  backgroundColor: catStyle.bg,
                  borderColor: catStyle.border,
                  color: catStyle.text,
                  fontSize: '0.72rem'
                }}
              >
                {candidate.primary_category}
              </span>
              <span className="drawer-role" style={{ fontSize: '0.78rem' }}>
                {candidate.passout_year} Batch
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenResumePdf ? onOpenResumePdf(candidate) : setActiveTab('resume')}
              style={{
                padding: '6px 12px',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="View actual resume PDF in application"
            >
              <FileText size={13} />
              <span>View PDF</span>
            </button>

            <a
              href={`/api/file/${candidate.id}/download`}
              download
              className="btn btn-secondary"
              style={{
                padding: '6px 10px',
                fontSize: '0.76rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                textDecoration: 'none'
              }}
              title="Download original resume document"
            >
              <Download size={13} />
              <span>Download</span>
            </a>

            {/* Remove / Delete Option with delete logo only, opens in-app confirm modal */}
            <button
              type="button"
              className="candidate-delete-btn"
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              title="Delete candidate profile"
              aria-label="Delete candidate profile"
            >
              <Trash2 size={15} />
            </button>

            <button type="button" className="drawer-close" onClick={onClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '6px', padding: '10px 24px 0 24px', borderBottom: '1px solid var(--border-light)', background: '#FAFAFA' }}>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <Sparkles size={14} />
            <span>AI Assessment &amp; Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: activeTab === 'resume' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'resume' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s'
            }}
          >
            <FileText size={14} />
            <span>View Resume Document</span>
          </button>
        </div>

        {/* TAB 1: AI Assessment & Profile Overview */}
        {activeTab === 'overview' && (
          <div className="drawer-content">
            {/* AI Summary / Live Evaluating Banner */}
            {isEvaluating ? (
              <div
                style={{
                  background: '#F5F3FF',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  border: '1.5px solid #C4B5FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}
              >
                <RefreshCw size={20} className="animate-spin" color="#7C3AED" />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5B21B6' }}>
                    AI is automatically evaluating profile...
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>
                    Model: gpt-6-luna • Reading resume, detecting category, and calculating score
                  </div>
                </div>
              </div>
            ) : candidate.ai_summary ? (
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  border: '1px solid #E9D5FF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  color: '#374151',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', color: '#6D28D9', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  <Cpu size={12} />
                  <span>AI Executive Summary</span>
                </div>
                {candidate.ai_summary}
              </div>
            ) : null}

            {/* In-App Resume Document Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#0284C7',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <FileText size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      color: '#0C4A6E',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '260px'
                    }}
                    title={candidate.filename}
                  >
                    {candidate.filename || 'Resume Document.pdf'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0369A1' }}>
                    View actual resume PDF inside the application
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenResumePdf ? onOpenResumePdf(candidate) : setActiveTab('resume')}
                  style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <FileText size={13} />
                  <span>View PDF</span>
                </button>
                <a
                  href={`/api/file/${candidate.id}/download`}
                  download
                  className="btn btn-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                  title="Download original file"
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Key Contact & Academic Details */}
            <div className="detail-grid">
              <div className="detail-cell">
                <span className="detail-label">Email</span>
                <span className="detail-value">
                  {candidate.email && candidate.email !== 'Not Found' ? (
                    <a href={`mailto:${candidate.email}`} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} />
                      {candidate.email}
                    </a>
                  ) : (
                    'Not Found'
                  )}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-label">Phone</span>
                <span className="detail-value">
                  {candidate.phone && candidate.phone !== 'Not Found' ? (
                    <a href={`tel:${candidate.phone}`} style={{ color: 'var(--text-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={12} />
                      {candidate.phone}
                    </a>
                  ) : (
                    'Not Found'
                  )}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-label">Passout Batch</span>
                <span
                  className="detail-value"
                  style={{ color: is2027 ? '#059669' : 'var(--text-primary)' }}
                >
                  {candidate.passout_year} Batch
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-label">CGPA / Score</span>
                <span className="detail-value">
                  {candidate.cgpa ? `${candidate.cgpa > 10 ? (candidate.cgpa / 10).toFixed(1) : candidate.cgpa} / 10.0` : '-'}
                </span>
              </div>

              <div className="detail-cell">
                <span className="detail-label">Degree</span>
                <span className="detail-value">{candidate.degree || "Bachelor's"}</span>
              </div>

              <div className="detail-cell">
                <span className="detail-label">Resume Document</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('resume')}
                    style={{ padding: '3px 8px', fontSize: '0.73rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <FileText size={12} />
                    <span>View in App</span>
                  </button>
                  <a
                    href={`/api/file/${candidate.id}/download`}
                    download
                    className="btn btn-primary"
                    style={{ padding: '3px 8px', fontSize: '0.73rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>

            {/* JD Match Analysis */}
            {jdAnalysis && (
              <div>
                <span className="drawer-section-title">
                  JD Match Analysis: {jdAnalysis.jd_title}
                </span>
                <div className="drawer-match-card">
                  <div className="drawer-match-header">
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Overall Score
                      </span>
                      <div className="drawer-score-big" style={{ color: scoreBadge.color }}>
                        {scoreBadge.score}%
                      </div>
                    </div>
                    <span
                      className="meta-badge"
                      style={{
                        backgroundColor: scoreBadge.bg,
                        color: scoreBadge.color,
                        borderColor: scoreBadge.border,
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        padding: '4px 10px'
                      }}
                    >
                      {jdAnalysis.fit_level}
                    </span>
                  </div>

                  <div className="skills-split">
                    <div>
                      <h5 style={{ color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={13} /> Matched Skills ({jdAnalysis.matched_skills?.length || 0})
                      </h5>
                      <div className="skills-cluster">
                        {jdAnalysis.matched_skills && jdAnalysis.matched_skills.length > 0 ? (
                          jdAnalysis.matched_skills.map(s => (
                            <span key={s} className="tag-match" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={11} />
                              <span>{s}</span>
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            None directly matched
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={13} /> Skill Gaps ({jdAnalysis.missing_skills?.length || 0})
                      </h5>
                      <div className="skills-cluster">
                        {jdAnalysis.missing_skills && jdAnalysis.missing_skills.length > 0 ? (
                          jdAnalysis.missing_skills.map(s => (
                            <span key={s} className="tag-gap">
                              ⚠ {s}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: '#059669' }}>
                            No major skill gaps!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extracted Projects */}
            <div>
              <span className="drawer-section-title">Projects</span>
              {candidate.projects && candidate.projects.length > 0 ? (
                candidate.projects.map((p, idx) => {
                  const isObj = typeof p === 'object' && p !== null;
                  const title = isObj ? (p.title || 'Project') : p;
                  const desc = isObj ? p.description : '';
                  return (
                    <div key={idx} className="project-item">
                      <span className="project-title">{title}</span>
                      {desc && <p className="project-desc">{desc}</p>}
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  No distinct project details extracted.
                </p>
              )}
            </div>

            {/* All Identified Skills */}
            <div>
              <span className="drawer-section-title">Identified Skills</span>
              <div className="skills-cluster">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map(skill => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>No technical skills found</span>
                )}
              </div>
            </div>

            {/* Raw Extracted Text */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span className="drawer-section-title" style={{ marginBottom: 0 }}>
                  Extracted Resume Text
                </span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onCopyText(candidate.raw_text)}
                  style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                >
                  <Copy size={12} />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="raw-box">{candidate.raw_text || 'No text extracted'}</pre>
            </div>
          </div>
        )}

        {/* TAB 2: Embedded In-App Resume Viewer */}
        {activeTab === 'resume' && (
          <div className="drawer-content" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '16px' }}>
            {/* Document Bar */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {candidate.filename || 'Resume Document'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    In-App Original Document Preview
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <a
                  href={`/api/file/${candidate.id}/download`}
                  download
                  className="btn btn-primary"
                  style={{ padding: '5px 12px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Embedded IFrame Viewer */}
            <div
              style={{
                flex: 1,
                width: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #CBD5E1',
                background: '#525659',
                position: 'relative'
              }}
            >
              {candidate.filename?.toLowerCase().endsWith('.docx') ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
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
                      width: '60px',
                      height: '60px',
                      borderRadius: '14px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px'
                    }}
                  >
                    <FileText size={28} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                    Word Resume (.docx)
                  </h4>
                  <p style={{ maxWidth: '380px', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5, marginBottom: '16px' }}>
                    Web browsers cannot render .docx files inline. Download the file or review the AI-parsed skills in the Overview tab.
                  </p>
                  <a
                    href={`/api/file/${candidate.id}/download`}
                    download
                    className="btn btn-primary"
                    style={{ padding: '7px 16px', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <Download size={14} />
                    <span>Download {candidate.filename}</span>
                  </a>
                </div>
              ) : (
                <iframe
                  src={`/api/file/${candidate.id}#view=FitH&toolbar=1`}
                  title="Resume Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block'
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Application-level In-App Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        candidate={candidate}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />
    </>
  );
}
