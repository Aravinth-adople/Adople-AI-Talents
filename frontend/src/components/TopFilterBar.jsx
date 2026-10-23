import React from 'react';
import {
  Search,
  X,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Award,
  Percent,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { PASSOUT_YEARS, ALL_CATEGORIES } from '../utils/constants';

export default function TopFilterBar({
  search,
  onSearchChange,
  onSearchClear,
  passoutYear,
  onPassoutYearChange,
  category,
  onCategoryChange,
  minCgpa,
  onMinCgpaChange,
  minScore,
  onMinScoreChange,
  status,
  onStatusChange,
  onResetFilters,
  hasActiveFilters
}) {
  return (
    <div className="top-filter-bar-card">
      {/* Top Row: Search Input + Quick 2027 Chip + Reset Button */}
      <div className="top-filter-search-row">
        <div className="top-search-box">
          <Search size={16} className="top-search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search candidates by name, technical skills, university, degree, email..."
            className="top-search-input"
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              className="top-search-clear"
              onClick={onSearchClear}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Reset All Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary top-reset-btn"
            onClick={onResetFilters}
            title="Reset all active filters"
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Bottom Row: 5 Clean Dropdowns */}
      <div className="top-filter-dropdowns-row">
        {/* 1. Passout Year Dropdown */}
        <div className="top-filter-dropdown-wrapper">
          <label className="top-dropdown-label">
            <GraduationCap size={13} />
            <span>Passout Year</span>
          </label>
          <div className="top-select-container">
            <select
              value={passoutYear ?? ''}
              onChange={e => {
                const val = e.target.value;
                onPassoutYearChange(val === '' ? null : parseInt(val, 10));
              }}
              className={`top-select ${passoutYear ? 'top-select-active' : ''}`}
            >
              <option value="">All Passout Years</option>
              <option value="2027">2027 Batch (1,187 Candidates)</option>
              <option value="2026">2026 Batch</option>
              <option value="2025">2025 Batch</option>
              <option value="2024">2024 Batch</option>
              <option value="2023">2023 Batch</option>
              <option value="2022">2022 &amp; Older</option>
            </select>
            <ChevronDown size={14} className="top-dropdown-arrow" />
          </div>
        </div>

        {/* 2. Job Category / Domain Dropdown */}
        <div className="top-filter-dropdown-wrapper">
          <label className="top-dropdown-label">
            <Briefcase size={13} />
            <span>Domain Category</span>
          </label>
          <div className="top-select-container">
            <select
              value={category}
              onChange={e => onCategoryChange(e.target.value)}
              className={`top-select ${category ? 'top-select-active' : ''}`}
            >
              <option value="">All Domains (12 Categories)</option>
              {ALL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="top-dropdown-arrow" />
          </div>
        </div>

        {/* 3. Minimum CGPA Dropdown */}
        <div className="top-filter-dropdown-wrapper">
          <label className="top-dropdown-label">
            <Award size={13} />
            <span>Minimum CGPA</span>
          </label>
          <div className="top-select-container">
            <select
              value={minCgpa && Number(minCgpa) > 0 ? String(Number(minCgpa)) : '0'}
              onChange={e => onMinCgpaChange(parseFloat(e.target.value) || 0)}
              className={`top-select ${minCgpa > 0 ? 'top-select-active' : ''}`}
            >
              <option value="0">All CGPA (Any)</option>
              <option value="9.5">CGPA &ge; 9.5 (Exceptional)</option>
              <option value="9">CGPA &ge; 9.0 (Top Honors)</option>
              <option value="8.5">CGPA &ge; 8.5</option>
              <option value="8">CGPA &ge; 8.0</option>
              <option value="7.5">CGPA &ge; 7.5</option>
              <option value="7">CGPA &ge; 7.0</option>
              <option value="6.5">CGPA &ge; 6.5</option>
              <option value="6">CGPA &ge; 6.0</option>
              {minCgpa > 0 && !['9.5', '9', '8.5', '8', '7.5', '7', '6.5', '6'].includes(String(Number(minCgpa))) && (
                <option value={String(Number(minCgpa))}>
                  CGPA &ge; {Number(minCgpa).toFixed(1)}
                </option>
              )}
            </select>
            <ChevronDown size={14} className="top-dropdown-arrow" />
          </div>
        </div>

        {/* 4. Minimum Match Score Dropdown */}
        <div className="top-filter-dropdown-wrapper">
          <label className="top-dropdown-label">
            <Percent size={13} />
            <span>Minimum Fit Score</span>
          </label>
          <div className="top-select-container">
            <select
              value={minScore}
              onChange={e => onMinScoreChange(parseInt(e.target.value, 10))}
              className={`top-select ${minScore > 0 ? 'top-select-active' : ''}`}
            >
              <option value="0">All Fit Scores (0%+)</option>
              <option value="80">Score &ge; 80% (High Match)</option>
              <option value="70">Score &ge; 70%</option>
              <option value="60">Score &ge; 60%</option>
              <option value="50">Score &ge; 50%</option>
              <option value="40">Score &ge; 40%</option>
            </select>
            <ChevronDown size={14} className="top-dropdown-arrow" />
          </div>
        </div>

        {/* 5. Review Status Dropdown */}
        <div className="top-filter-dropdown-wrapper">
          <label className="top-dropdown-label">
            <CheckCircle2 size={13} />
            <span>Review Status</span>
          </label>
          <div className="top-select-container">
            <select
              value={status}
              onChange={e => onStatusChange(e.target.value)}
              className={`top-select ${status ? 'top-select-active' : ''}`}
            >
              <option value="">All Review Statuses</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="in_review">In Review</option>
              <option value="rejected">Rejected</option>
              <option value="unreviewed">Unreviewed</option>
            </select>
            <ChevronDown size={14} className="top-dropdown-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
}
