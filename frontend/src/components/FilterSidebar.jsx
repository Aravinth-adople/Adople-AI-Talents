import React from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { PASSOUT_YEARS, ALL_CATEGORIES } from '../utils/constants';

export default function FilterSidebar({
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
  onResetFilters
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={16} className="text-muted" />
          <span className="sidebar-heading">Filters</span>
        </div>
        <button type="button" className="btn-clear" onClick={onResetFilters}>
          Reset
        </button>
      </div>

      {/* Search Input */}
      <div className="filter-block">
        <label className="filter-title">Search Candidates</label>
        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Name, skills, projects, email..."
            autoComplete="off"
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={onSearchClear}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Passout Year Filter (2027 clearly highlighted) */}
      <div className="filter-block">
        <div className="filter-title-row">
          <label className="filter-title">Passout Year</label>
          <span className="highlight-chip">2027 Active</span>
        </div>
        <div className="pills-grid">
          {PASSOUT_YEARS.map(y => {
            const isActive = passoutYear === y.value;
            return (
              <button
                key={y.label}
                type="button"
                className={`pill-btn ${y.is2027 ? 'pill-2027' : ''} ${isActive ? 'active' : ''}`}
                onClick={() => onPassoutYearChange(y.value)}
              >
                {y.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter */}
      <div className="filter-block">
        <label className="filter-title">Job Category</label>
        <div className="pills-grid">
          <button
            type="button"
            className={`pill-btn ${!category ? 'active' : ''}`}
            onClick={() => onCategoryChange('')}
          >
            All
          </button>
          {ALL_CATEGORIES.map(cat => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum CGPA Slider */}
      <div className="filter-block">
        <div className="filter-title-row">
          <label className="filter-title">Minimum CGPA</label>
          <span className="range-value">{minCgpa > 0 ? `≥ ${minCgpa.toFixed(1)}` : 'Any'}</span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minCgpa}
          onChange={e => onMinCgpaChange(parseFloat(e.target.value))}
          className="range-slider"
        />
        <div className="range-markers">
          <span>Any</span>
          <span>6.0</span>
          <span>7.0</span>
          <span>8.0</span>
          <span>9.0+</span>
        </div>
      </div>

      {/* Minimum JD Match Score Slider */}
      <div className="filter-block">
        <div className="filter-title-row">
          <label className="filter-title">Minimum Score</label>
          <span className="range-value">{minScore > 0 ? `≥ ${minScore}%` : 'Any (0%)'}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={minScore}
          onChange={e => onMinScoreChange(parseInt(e.target.value, 10))}
          className="range-slider"
        />
        <div className="range-markers">
          <span>0%</span>
          <span>40%</span>
          <span>60%</span>
          <span>80%+</span>
        </div>
      </div>

      {/* Candidate Status */}
      <div className="filter-block">
        <label className="filter-title">Status</label>
        <div className="pills-grid">
          {[
            { label: 'All', value: '' },
            { label: 'Shortlisted', value: 'shortlisted' },
            { label: 'In Review', value: 'in_review' },
            { label: 'Rejected', value: 'rejected' },
            { label: 'Unreviewed', value: 'unreviewed' }
          ].map(s => {
            const isActive = status === s.value;
            return (
              <button
                key={s.label}
                type="button"
                className={`pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => onStatusChange(s.value)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
