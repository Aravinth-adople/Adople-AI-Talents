import React from 'react';
import {
  Download,
  FileText,
  Eye,
  ArrowRight,
  GraduationCap,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { CATEGORY_COLORS, getScoreBadge } from '../utils/constants';
import { CategoryLogo } from './DomainKeycard';

export default function CandidateTable({
  candidates,
  onOpenProfile,
  onOpenResumePdf,
  onStatusChange,
  sortBy = 'score',
  sortOrder = 'desc',
  onSortChange,
  onFilterCategory,
  onFilterYear,
  onFilterStatus
}) {
  const handleHeaderSort = (field) => {
    if (!onSortChange) return;
    if (sortBy === field) {
      onSortChange(`${field}_${sortOrder === 'desc' ? 'asc' : 'desc'}`);
    } else {
      const defaultDir = field === 'name' ? 'asc' : 'desc';
      onSortChange(`${field}_${defaultDir}`);
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.35, marginLeft: '4px' }} />;
    }
    return sortOrder === 'desc' ? (
      <ArrowDown size={12} style={{ color: 'var(--primary)', marginLeft: '4px' }} />
    ) : (
      <ArrowUp size={12} style={{ color: 'var(--primary)', marginLeft: '4px' }} />
    );
  };

  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th
              onClick={() => handleHeaderSort('name')}
              style={{ cursor: onSortChange ? 'pointer' : 'default', userSelect: 'none' }}
              title="Click to sort by Candidate Name"
            >
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span>Candidate</span>
                {onSortChange && renderSortIndicator('name')}
              </div>
            </th>
            <th>Category &amp; Domain</th>
            <th
              onClick={() => handleHeaderSort('passout')}
              style={{ cursor: onSortChange ? 'pointer' : 'default', userSelect: 'none' }}
              title="Click to sort by Passout Batch"
            >
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span>Passout Batch</span>
                {onSortChange && renderSortIndicator('passout')}
              </div>
            </th>
            <th
              onClick={() => handleHeaderSort('cgpa')}
              style={{ cursor: onSortChange ? 'pointer' : 'default', userSelect: 'none' }}
              title="Click to sort by CGPA"
            >
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span>CGPA</span>
                {onSortChange && renderSortIndicator('cgpa')}
              </div>
            </th>
            <th
              onClick={() => handleHeaderSort('score')}
              style={{ cursor: onSortChange ? 'pointer' : 'default', userSelect: 'none' }}
              title="Click to sort by Fit Score"
            >
              <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span>Fit Score</span>
                {onSortChange && renderSortIndicator('score')}
              </div>
            </th>
            <th>Key Skills</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(c => {
            const catStyle = CATEGORY_COLORS[c.primary_category] || CATEGORY_COLORS['Other'];
            const scoreBadge = getScoreBadge(c.active_score);
            const is2027 = c.passout_year === 2027;

            const initials = c.name
              ? c.name
                  .split(' ')
                  .map(w => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'CV';

            return (
              <tr key={c.id}>
                {/* Candidate Name & Contact */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="table-avatar">
                      {initials}
                    </div>
                    <div>
                      <div
                        className="table-cand-name"
                        onClick={() => onOpenResumePdf ? onOpenResumePdf(c) : onOpenProfile(c.id)}
                        title="Click to view actual resume PDF"
                      >
                        {c.name}
                      </div>
                      <div className="table-cand-email">
                        {c.email || 'No email provided'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category with Vector Emblem */}
                <td>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      className="category-badge"
                      style={{
                        backgroundColor: catStyle.bg,
                        borderColor: catStyle.border,
                        color: catStyle.text,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <CategoryLogo category={c.primary_category} size={13} color="currentColor" />
                      <span>{c.primary_category}</span>
                    </span>
                  </div>
                </td>

                {/* Passout Year */}
                <td>
                  <span className={`meta-badge ${is2027 ? 'badge-2027' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GraduationCap size={11} />
                    <span>{c.passout_year}</span>
                  </span>
                </td>

                {/* CGPA */}
                <td>
                  <span
                    style={{
                      fontWeight: 600,
                      color: c.cgpa ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {c.cgpa ? (c.cgpa > 10 ? (c.cgpa / 10).toFixed(1) : c.cgpa) : '-'}
                  </span>
                </td>

                {/* Fit Match Score (stacked 96% TOP FIT style) */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        color: scoreBadge.color,
                        fontSize: '1.05rem',
                        lineHeight: 1
                      }}
                    >
                      {scoreBadge.score}%
                    </span>
                    <span
                      style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.04em',
                        marginTop: '2px'
                      }}
                    >
                      TOP FIT
                    </span>
                  </div>
                </td>

                {/* Top Skills in chips */}
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '240px' }}>
                    {(c.skills || []).slice(0, 3).map(s => (
                      <span key={s} className="table-skill-pill">
                        {s}
                      </span>
                    ))}
                    {(c.skills || []).length > 3 && (
                      <span className="table-skill-pill" style={{ opacity: 0.65 }}>
                        +{c.skills.length - 3}
                      </span>
                    )}
                  </div>
                </td>

                {/* Status select */}
                <td>
                  <div className="table-status-wrap">
                    <select
                      className={`status-select status-color-${c.status || 'unreviewed'}`}
                      value={c.status || 'unreviewed'}
                      onChange={e => onStatusChange(c.id, e.target.value)}
                      title="Update candidate pipeline status"
                    >
                      <option value="unreviewed">Unreviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="in_review">In Review</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown size={11} className="table-status-chevron" />
                  </div>
                </td>

                {/* Actions */}
                <td>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onOpenResumePdf && onOpenResumePdf(c)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.74rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 600,
                        borderRadius: '9999px'
                      }}
                      title="View Actual Resume PDF in Application"
                    >
                      <FileText size={12} />
                      <span>PDF</span>
                      <ArrowRight size={11} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => onOpenProfile(c.id)}
                      style={{
                        padding: '5px 8px',
                        fontSize: '0.74rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        borderRadius: '9999px'
                      }}
                      title="View AI Profile Analysis"
                    >
                      <Eye size={12} />
                    </button>

                    <a
                      href={`/api/file/${c.id}/download`}
                      download
                      className="icon-button"
                      style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                      title="Download Original Resume File"
                    >
                      <Download size={12} />
                    </a>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
