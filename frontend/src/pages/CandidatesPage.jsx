import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Download, X, Loader2, FileSpreadsheet, FileText, ChevronDown } from 'lucide-react';
import TopFilterBar from '../components/TopFilterBar';
import CandidateCard from '../components/CandidateCard';
import CandidateTable from '../components/CandidateTable';
import CandidateDrawer from '../components/CandidateDrawer';
import ResumeModal from '../components/ResumeModal';
import {
  fetchJds,
  fetchCandidates,
  fetchCandidateDetails,
  updateCandidateStatus,
  getExportUrl,
  fetchBatchEvalStatus
} from '../services/api';

export default function CandidatesPage({ showToast }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial query params
  const paramJd = searchParams.get('jd') || 'ai-engineer';
  const paramYear = searchParams.get('year') ? parseInt(searchParams.get('year'), 10) : null;
  const paramCat = searchParams.get('category') || '';
  const paramCgpa = searchParams.get('min_cgpa')
    ? parseFloat(searchParams.get('min_cgpa'))
    : (searchParams.get('cgpa') ? parseFloat(searchParams.get('cgpa')) : 0);
  const paramScore = searchParams.get('min_score')
    ? parseInt(searchParams.get('min_score'), 10)
    : (searchParams.get('score') ? parseInt(searchParams.get('score'), 10) : 0);

  // State
  const [jds, setJds] = useState([]);
  const [activeJdId, setActiveJdId] = useState(paramJd);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [passoutYear, setPassoutYear] = useState(paramYear);
  const [category, setCategory] = useState(paramCat);
  const [minCgpa, setMinCgpa] = useState(paramCgpa || 0);
  const [minScore, setMinScore] = useState(paramScore || 0);
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(24);

  // Data & UI
  const [candidates, setCandidates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards');

  // Drawer & PDF Viewer Modal
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCandidateData, setSelectedCandidateData] = useState(null);
  const [pdfModalCandidate, setPdfModalCandidate] = useState(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Batch AI Evaluation State (silent background refresh)
  const [batchStatus, setBatchStatus] = useState(null);
  const lastEvaluatedRef = React.useRef(0);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load JDs
  useEffect(() => {
    async function loadJds() {
      try {
        const data = await fetchJds();
        setJds(data.jds || []);
      } catch (err) {
        console.error('Failed to load JDs', err);
      }
    }
    loadJds();
  }, []);

  // Sync state if URL searchParams change
  useEffect(() => {
    const jdFromUrl = searchParams.get('jd');
    if (jdFromUrl) setActiveJdId(jdFromUrl);

    const yearFromUrl = searchParams.get('year');
    if (yearFromUrl) setPassoutYear(parseInt(yearFromUrl, 10));

    const catFromUrl = searchParams.get('category');
    if (catFromUrl) setCategory(catFromUrl);
  }, [searchParams]);

  // Load Candidates
  const loadCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCandidates({
        search: debouncedSearch,
        category,
        passoutYear,
        minCgpa,
        minScore,
        status,
        activeJdId,
        sortBy,
        sortOrder,
        page,
        pageSize
      });
      setCandidates(res.candidates || []);
      setTotalCount(res.total_count || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Error fetching candidates', err);
      if (showToast) showToast('Failed to load candidates', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, category, passoutYear, minCgpa, minScore, status, activeJdId, sortBy, sortOrder, page, pageSize, showToast]);

  // Silent candidate refresh for live score re-ranking during AI batch evaluation
  const loadCandidatesSilently = useCallback(async () => {
    try {
      const res = await fetchCandidates({
        search: debouncedSearch,
        category,
        passoutYear,
        minCgpa,
        minScore,
        status,
        activeJdId,
        sortBy,
        sortOrder,
        page,
        pageSize
      });
      setCandidates(res.candidates || []);
      setTotalCount(res.total_count || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error('Silent refresh candidates error', err);
    }
  }, [debouncedSearch, category, passoutYear, minCgpa, minScore, status, activeJdId, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Check initial batch status on mount
  useEffect(() => {
    let mounted = true;
    async function initBatchStatus() {
      try {
        const s = await fetchBatchEvalStatus();
        if (mounted) {
          setBatchStatus(s);
          lastEvaluatedRef.current = s.evaluated_count || 0;
        }
      } catch (err) {
        console.error('Failed to get initial batch status', err);
      }
    }
    initBatchStatus();
    return () => { mounted = false; };
  }, []);

  // Poll batch status every 2.5s when running & auto-refresh candidate list when new scores are evaluated
  useEffect(() => {
    let intervalId;
    if (batchStatus?.is_running) {
      intervalId = setInterval(async () => {
        try {
          const updated = await fetchBatchEvalStatus();
          setBatchStatus(updated);
          if (updated.evaluated_count !== lastEvaluatedRef.current) {
            lastEvaluatedRef.current = updated.evaluated_count;
            loadCandidatesSilently();
          }
        } catch (err) {
          console.error('Batch status poll error', err);
        }
      }, 2500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [batchStatus?.is_running, loadCandidatesSilently]);

  // Actions
  const handleJdChange = newJdId => {
    setActiveJdId(newJdId);
    setPage(1);
    setSearchParams(prev => {
      prev.set('jd', newJdId);
      return prev;
    });
    const targetJd = jds.find(j => j.id === newJdId);
    if (showToast && targetJd) {
      showToast(`Scoring switched to "${targetJd.title}"`, 'success');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setPassoutYear(null);
    setCategory('');
    setMinCgpa(0);
    setMinScore(0);
    setStatus('');
    setPage(1);
    setSearchParams({});
    if (showToast) showToast('All candidate filters reset', 'success');
  };

  const handleSortChange = val => {
    const [field, dir] = val.split('_');
    setSortBy(field);
    setSortOrder(dir);
    setPage(1);
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
      if (showToast) showToast(`Status set to "${newStatus}"`, 'success');
      setCandidates(prev =>
        prev.map(c => (c.id === candidateId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      if (showToast) showToast('Failed to update status', 'error');
    }
  };

  const handleOpenProfile = async candidateId => {
    const listCand = candidates.find(c => c.id === candidateId);
    try {
      const data = await fetchCandidateDetails(candidateId, activeJdId);
      const fullCand = {
        ...listCand,
        ...data.candidate,
        active_score: data.candidate?.active_score ?? data.jd_analysis?.score ?? listCand?.active_score
      };
      setSelectedCandidateData({
        ...data,
        candidate: fullCand
      });
      setDrawerOpen(true);
    } catch (err) {
      if (showToast) showToast('Failed to load candidate details', 'error');
    }
  };

  const handleOpenResumePdf = async candidate => {
    setPdfModalCandidate(candidate);
    try {
      const data = await fetchCandidateDetails(candidate.id, activeJdId);
      const fullCand = {
        ...candidate,
        ...data.candidate,
        active_score: data.candidate?.active_score ?? data.jd_analysis?.score ?? candidate.active_score
      };
      setPdfModalCandidate(fullCand);
    } catch (err) {
      console.error('Error fetching candidate details', err);
    }
  };

  const handleExport = (exportFormat = 'csv') => {
    const url = getExportUrl({
      search: debouncedSearch,
      category,
      passoutYear,
      minCgpa,
      minScore,
      status,
      activeJdId,
      sortBy,
      sortOrder,
      format: exportFormat
    });
    window.location.href = url;
    if (showToast) {
      if (exportFormat === 'xlsx') {
        showToast('Downloading candidate Excel (.xlsx with all columns filterable)...', 'success');
      } else {
        showToast('Downloading candidate CSV with full details & downloadable links...', 'success');
      }
    }
  };

  const handleCandidateDeleted = candidateId => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    setTotalCount(prev => Math.max(0, prev - 1));
    if (selectedCandidateData?.candidate?.id === candidateId) {
      setDrawerOpen(false);
      setSelectedCandidateData(null);
    }
    if (pdfModalCandidate?.id === candidateId) {
      setPdfModalCandidate(null);
    }
  };



  const hasActiveFilters = Boolean(
    debouncedSearch || passoutYear || category || minCgpa > 0 || minScore > 0 || status
  );

  const activeJd = jds.find(j => j.id === activeJdId);

  return (
    <div className="candidates-full-layout">
      {/* Top Filter Bar with All Filters as Dropdowns */}
      <TopFilterBar
        search={search}
        onSearchChange={setSearch}
        onSearchClear={() => setSearch('')}
        passoutYear={passoutYear}
        onPassoutYearChange={y => {
          setPassoutYear(y);
          setPage(1);
        }}
        category={category}
        onCategoryChange={c => {
          setCategory(c);
          setPage(1);
        }}
        minCgpa={minCgpa}
        onMinCgpaChange={val => {
          setMinCgpa(val);
          setPage(1);
        }}
        minScore={minScore}
        onMinScoreChange={val => {
          setMinScore(val);
          setPage(1);
        }}
        status={status}
        onStatusChange={s => {
          setStatus(s);
          setPage(1);
        }}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Candidates Workspace */}
      <main className="candidates-main-workspace">


        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-info">
            <span className="candidates-count-text">
              {isLoading ? 'Filtering candidates...' : `${totalCount.toLocaleString()} Candidates Found`}
            </span>
          </div>

          <div className="toolbar-controls">
            {/* Sort Selector */}
            <div className="select-wrapper">
              <label htmlFor="sortSelect">Sort:</label>
              <select
                id="sortSelect"
                className="form-select"
                value={`${sortBy}_${sortOrder}`}
                onChange={e => handleSortChange(e.target.value)}
              >
                <option value="score_desc">JD Score: High to Low</option>
                <option value="score_asc">JD Score: Low to High</option>
                <option value="cgpa_desc">CGPA: High to Low</option>
                <option value="passout_desc">Passout Year: Newest</option>
                <option value="passout_asc">Passout Year: Oldest</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="view-switch">
              <button
                type="button"
                className={`view-switch-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Cards Grid"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                className={`view-switch-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                <List size={15} />
              </button>
            </div>

            {/* Export Dropdown / Split Button */}
            <div className="export-dropdown-wrapper" style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'stretch' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleExport('csv')}
                  title="Export filtered candidates to CSV (with downloadable resume links and full candidate details)"
                  style={{
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                    paddingRight: '10px'
                  }}
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setExportDropdownOpen(prev => !prev)}
                  title="Choose export format: CSV or Excel with filterable columns"
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderLeft: '1px solid var(--border-medium)',
                    paddingLeft: '7px',
                    paddingRight: '7px'
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              {exportDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setExportDropdownOpen(false)}
                  />
                  <div
                    className="export-dropdown-menu"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '6px',
                      background: '#fff',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.14), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                      zIndex: 50,
                      minWidth: '260px',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <button
                      type="button"
                      className="export-menu-item"
                      onClick={() => {
                        setExportDropdownOpen(false);
                        handleExport('csv');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                    >
                      <FileText size={16} style={{ color: '#004AAC', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          Export CSV (.csv)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.25, marginTop: '2px' }}>
                          Full candidate details, downloadable links, RFC-4180 format
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="export-menu-item"
                      onClick={() => {
                        setExportDropdownOpen(false);
                        handleExport('xlsx');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px 10px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%'
                      }}
                    >
                      <FileSpreadsheet size={16} style={{ color: '#10B981', marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>Export Excel (.xlsx)</span>
                          <span style={{ fontSize: '0.62rem', background: '#DCFCE7', color: '#15803D', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                            Auto-Filtered
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.25, marginTop: '2px' }}>
                          All 28 columns with native Excel filter dropdowns, styled headers &amp; hyperlinks
                        </div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="active-filters-row">
            <span className="active-label">Active Filters:</span>
            <div className="active-tags">
              {debouncedSearch && (
                <span className="filter-tag">
                  <span>Search: "{debouncedSearch}"</span>
                  <button type="button" onClick={() => setSearch('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {passoutYear && (
                <span className="filter-tag">
                  <span>Batch: {passoutYear}</span>
                  <button type="button" onClick={() => { setPassoutYear(null); setPage(1); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {category && (
                <span className="filter-tag">
                  <span>Category: {category}</span>
                  <button type="button" onClick={() => { setCategory(''); setPage(1); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {minCgpa > 0 && (
                <span className="filter-tag">
                  <span>CGPA ≥ {Number(minCgpa).toFixed(1)}</span>
                  <button type="button" onClick={() => { setMinCgpa(0); setPage(1); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {minScore > 0 && (
                <span className="filter-tag">
                  <span>Score ≥ {minScore}%</span>
                  <button type="button" onClick={() => { setMinScore(0); setPage(1); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {status && (
                <span className="filter-tag">
                  <span>Status: {status}</span>
                  <button type="button" onClick={() => { setStatus(''); setPage(1); }}>
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Candidates View */}
        {isLoading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
            <p style={{ marginTop: '12px', fontSize: '0.86rem' }}>Matching candidates with active JD...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', border: '1px dashed var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
            <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              No candidates match your current filter
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '14px' }}>
              Try clearing search terms or adjusting score/CGPA threshold.
            </p>
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="cards-grid">
            {candidates.map(candidate => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onOpenProfile={handleOpenProfile}
                onOpenResumePdf={handleOpenResumePdf}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <CandidateTable
            candidates={candidates}
            onOpenProfile={handleOpenProfile}
            onOpenResumePdf={handleOpenResumePdf}
            onStatusChange={handleStatusChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="page-nav-btn"
              disabled={page <= 1}
              onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
            >
              &laquo; Prev
            </button>

            <div className="page-list">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = page - 2 + i;
                if (page < 3) pNum = i + 1;
                if (page > totalPages - 2) pNum = totalPages - 4 + i;
                if (pNum >= 1 && pNum <= totalPages) {
                  return (
                    <button
                      key={pNum}
                      type="button"
                      className={`page-item ${pNum === page ? 'active' : ''}`}
                      onClick={() => {
                        setPage(pNum);
                        window.scrollTo({ top: 100, behavior: 'smooth' });
                      }}
                    >
                      {pNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <button
              type="button"
              className="page-nav-btn"
              disabled={page >= totalPages}
              onClick={() => {
                setPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 100, behavior: 'smooth' });
              }}
            >
              Next &raquo;
            </button>
          </div>
        )}
      </main>

      {/* Slide-over Profile Drawer */}
      <CandidateDrawer
        isOpen={drawerOpen}
        candidateData={selectedCandidateData}
        onClose={() => setDrawerOpen(false)}
        activeJdId={activeJdId}
        onOpenResumePdf={handleOpenResumePdf}
        showToast={showToast}
        onCandidateDeleted={handleCandidateDeleted}
        onCandidateUpdated={updatedCandidate => {
          setSelectedCandidateData(prev => ({
            ...prev,
            candidate: updatedCandidate
          }));
          setCandidates(prev =>
            prev.map(c => (c.id === updatedCandidate.id ? { ...c, ...updatedCandidate } : c))
          );
        }}
        onCopyText={text => {
          navigator.clipboard.writeText(text || '');
          if (showToast) showToast('Resume text copied', 'success');
        }}
      />

      {/* In-App Resume PDF Viewer Modal */}
      <ResumeModal
        isOpen={Boolean(pdfModalCandidate)}
        candidate={pdfModalCandidate}
        onClose={() => setPdfModalCandidate(null)}
        activeJdId={activeJdId}
        onStatusChange={handleStatusChange}
        showToast={showToast}
        onCandidateDeleted={handleCandidateDeleted}
        onCandidateUpdated={(updatedCandidate, updatedJdAnalysis) => {
          setCandidates(prev =>
            prev.map(c => (c.id === updatedCandidate.id ? { ...c, ...updatedCandidate } : c))
          );
          if (selectedCandidateData?.candidate?.id === updatedCandidate.id) {
            setSelectedCandidateData(prev => ({
              ...prev,
              candidate: updatedCandidate,
              jd_analysis: updatedJdAnalysis || prev?.jd_analysis
            }));
          }
        }}
      />
    </div>
  );
}
