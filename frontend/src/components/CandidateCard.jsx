import React from 'react';
import { Eye, Download, FileText, ArrowRight, GraduationCap, ChevronDown } from 'lucide-react';
import { CATEGORY_COLORS, getScoreBadge } from '../utils/constants';
import { CategoryLogo, RfidWaves } from './DomainKeycard';

export default function CandidateCard({
  candidate,
  onOpenProfile,
  onOpenResumePdf,
  onStatusChange
}) {
  const {
    id,
    name,
    email,
    passout_year,
    cgpa,
    degree,
    primary_category,
    skills,
    status,
    active_score
  } = candidate;

  const initials = name
    ? name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CV';

  const catStyle = CATEGORY_COLORS[primary_category] || CATEGORY_COLORS['Other'];
  const scoreBadge = getScoreBadge(active_score);
  const is2027 = passout_year === 2027;
  const topSkills = (skills || []).slice(0, 4);

  return (
    <div className="candidate-card" data-id={id}>
      {/* Luxury Inset Border Frame (Image 2 Keycard standard) */}
      <div className="candidate-card-inner">
        {/* Top Header: RFID waves & code + Category Logo Emblem */}
        <div className="candidate-card-header">
          <div className="candidate-rfid-chip">
            <RfidWaves size={13} className="candidate-rfid-icon" />
            <span className="candidate-card-code">CAND-#{id}</span>
          </div>

          <div className="candidate-category-pill-group">
            <span
              className="candidate-category-pill"
              style={{
                backgroundColor: catStyle.bg,
                borderColor: catStyle.border,
                color: catStyle.text
              }}
            >
              {primary_category}
            </span>
            <div className="candidate-category-logo" style={{ color: catStyle.text }}>
              <CategoryLogo category={primary_category} size={20} color="currentColor" />
            </div>
          </div>
        </div>

        {/* Candidate Identity Block */}
        <div className="candidate-identity-row">
          <div className="candidate-avatar-luxury">
            <span>{initials}</span>
          </div>

          <div className="candidate-identity-info">
            <h4
              className="candidate-luxury-name"
              onClick={() => onOpenResumePdf ? onOpenResumePdf(candidate) : onOpenProfile(id)}
              title="Click to view actual resume PDF"
            >
              {name || 'Candidate Name'}
            </h4>
            <span className="candidate-luxury-email" title={email}>
              {email || 'No email provided'}
            </span>
          </div>
        </div>

        {/* Metadata Badges: Batch, CGPA, Degree */}
        <div className="candidate-meta-badges">
          <span className={`candidate-meta-chip ${is2027 ? 'chip-2027-highlight' : ''}`}>
            <GraduationCap size={12} />
            <span>{passout_year} Batch</span>
          </span>
          <span className="candidate-meta-chip">
            {cgpa ? `${cgpa} CGPA` : '7.5 CGPA'}
          </span>
          <span className="candidate-meta-chip">{degree || "Bachelor's"}</span>
        </div>

        {/* Skill Pills (Direct Image 1 rounded chips standard) */}
        <div className="candidate-skills-chips-row">
          {topSkills.length > 0 ? (
            topSkills.map(skill => (
              <span key={skill} className="candidate-skill-chip">
                {skill}
              </span>
            ))
          ) : (
            <span className="candidate-skill-chip candidate-skill-empty">
              General Candidate
            </span>
          )}
        </div>

        {/* Bottom Match Score & Action Buttons (Direct Image 1 standard) */}
        <div className="candidate-card-footer">
          {/* Big Fit Match Display (96% TOP FIT stacked) */}
          <div className="candidate-fit-score-box">
            <span className="candidate-fit-percentage" style={{ color: scoreBadge.color }}>
              {scoreBadge.score}%
            </span>
            <span className="candidate-fit-label">TOP FIT</span>
          </div>

          {/* Action Buttons: Primary View PDF pill + Profile button + Download icon */}
          <div className="candidate-footer-actions">
            <button
              type="button"
              className="candidate-action-primary-pill"
              onClick={() => onOpenResumePdf && onOpenResumePdf(candidate)}
              title="View actual original resume PDF"
            >
              <FileText size={13} />
              <span>Resume PDF</span>
              <ArrowRight size={13} className="candidate-btn-arrow" />
            </button>

            <button
              type="button"
              className="candidate-action-profile-btn"
              onClick={() => onOpenProfile(id)}
              title="View AI Profile Analysis & Details"
            >
              <Eye size={13} />
            </button>

            <a
              href={`/api/file/${id}/download`}
              download
              className="candidate-action-dl-btn"
              title="Download Original Resume File"
            >
              <Download size={13} />
            </a>
          </div>
        </div>

        {/* Status Dropdown Strip (Luxury Pill Style matching Adople AI Design) */}
        <div className="candidate-status-strip">
          <div className="candidate-status-left">
            <span className={`status-indicator-dot dot-${status || 'unreviewed'}`} />
            <span className="candidate-status-label">Pipeline Status:</span>
          </div>

          <div className="candidate-status-select-wrap">
            <select
              className={`candidate-luxury-status-select status-color-${status || 'unreviewed'}`}
              value={status || 'unreviewed'}
              onChange={e => onStatusChange(id, e.target.value)}
              title="Update candidate pipeline status"
            >
              <option value="unreviewed">Unreviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="in_review">In Review</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown size={12} className="candidate-status-chevron" />
          </div>
        </div>
      </div>
    </div>
  );
}
