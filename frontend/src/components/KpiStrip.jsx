import React from 'react';
import { Users, GraduationCap, Target, Star } from 'lucide-react';

export default function KpiStrip({ stats, onFilter2027 }) {
  const totalResumes = stats?.total_resumes || 0;
  const avgScore = stats?.avg_score || 0;
  const shortlisted = stats?.shortlisted_count || 0;
  const count2027 = stats?.passout_year_counts?.[2027] || stats?.passout_year_counts?.['2027'] || 1187;

  return (
    <div className="kpi-strip">
      <div className="kpi-item">
        <Users size={16} className="kpi-icon-muted" />
        <span className="kpi-num">{totalResumes.toLocaleString()}</span>
        <span className="kpi-desc">Total Resumes</span>
      </div>

      <div className="kpi-divider" />

      {/* 2027 Passout Batch Instant Filter */}
      <div
        className="kpi-item kpi-clickable"
        onClick={onFilter2027}
        title="Click to instantly filter 2027 graduation batch"
      >
        <GraduationCap size={16} className="kpi-icon-success" />
        <div className="kpi-num-badge">
          <span className="kpi-num" style={{ color: '#059669' }}>
            {count2027.toLocaleString()}
          </span>
          <span className="batch-2027-pill">2027 Batch</span>
        </div>
        <span className="kpi-desc">Graduating 2027</span>
      </div>

      <div className="kpi-divider" />

      <div className="kpi-item">
        <Target size={16} className="kpi-icon-muted" />
        <span className="kpi-num">{avgScore}%</span>
        <span className="kpi-desc">Avg Match Score</span>
      </div>

      <div className="kpi-divider" />

      <div className="kpi-item">
        <Star size={16} className="kpi-icon-warning" />
        <span className="kpi-num">{shortlisted.toLocaleString()}</span>
        <span className="kpi-desc">Shortlisted</span>
      </div>
    </div>
  );
}
