/* ==========================================================================
   TalentMatrix — Client Application Script (Bright Theme)
   Reactive State, Dynamic JD Switcher, Candidate Drawer & Batch Upload
   ========================================================================== */

const state = {
    activeJdId: 'ai-engineer',
    search: '',
    category: '',
    passoutYear: null,
    minCgpa: 0,
    minScore: 0,
    status: '',
    sortBy: 'score',
    sortOrder: 'desc',
    page: 1,
    pageSize: 24,
    viewMode: 'cards', // 'cards' | 'table'
    selectedFiles: []
};

// Refined Light Theme Category Palette
const CATEGORY_COLORS = {
    'Agentic AI': { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
    'AI/ML': { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
    'Full Stack': { bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490' },
    'Frontend': { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
    'Backend': { bg: '#ecfdf5', border: '#a7f3d0', text: '#047857' },
    'Data Analyst': { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
    'Business Development': { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
    'AR Calling': { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
    'QA/Testing': { bg: '#fdf4ff', border: '#f5d0fe', text: '#a21caf' },
    'DevOps': { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    'UI/UX': { bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d' },
    'Other': { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' }
};

// DOM Elements
const jdPillsList = document.getElementById('jdPillsList');
const searchInput = document.getElementById('searchInput');
const btnClearSearch = document.getElementById('btnClearSearch');
const passoutYearChips = document.getElementById('passoutYearChips');
const categoryChips = document.getElementById('categoryChips');
const cgpaSlider = document.getElementById('cgpaSlider');
const cgpaValueLabel = document.getElementById('cgpaValueLabel');
const scoreSlider = document.getElementById('scoreSlider');
const scoreValueLabel = document.getElementById('scoreValueLabel');
const statusChips = document.getElementById('statusChips');
const btnResetFilters = document.getElementById('btnResetFilters');
const sortSelect = document.getElementById('sortSelect');
const btnViewCards = document.getElementById('btnViewCards');
const btnViewTable = document.getElementById('btnViewTable');
const candidatesGrid = document.getElementById('candidatesGrid');
const candidatesTableContainer = document.getElementById('candidatesTableContainer');
const candidatesTableBody = document.getElementById('candidatesTableBody');
const resultsCountLabel = document.getElementById('resultsCountLabel');
const activeFiltersBar = document.getElementById('activeFiltersBar');
const activeFilterTags = document.getElementById('activeFilterTags');
const pageNumbers = document.getElementById('pageNumbers');
const btnPrevPage = document.getElementById('btnPrevPage');
const btnNextPage = document.getElementById('btnNextPage');

// KPI elements
const kpiTotalResumes = document.getElementById('kpiTotalResumes');
const kpiAvgScore = document.getElementById('kpiAvgScore');
const kpi2027Count = document.getElementById('kpi2027Count');
const kpiShortlisted = document.getElementById('kpiShortlisted');
const kpiCard2027 = document.getElementById('kpiCard2027');

// Drawer elements
const drawerOverlay = document.getElementById('drawerOverlay');
const candidateDrawer = document.getElementById('candidateDrawer');
const drawerCandidateName = document.getElementById('drawerCandidateName');
const drawerCandidateRole = document.getElementById('drawerCandidateRole');
const drawerBody = document.getElementById('drawerBody');
const btnCloseDrawer = document.getElementById('btnCloseDrawer');

// Upload Modal elements
const uploadModalOverlay = document.getElementById('uploadModalOverlay');
const btnOpenUploadModal = document.getElementById('btnOpenUploadModal');
const btnCloseUploadModal = document.getElementById('btnCloseUploadModal');
const btnCancelUpload = document.getElementById('btnCancelUpload');
const uploadDropzone = document.getElementById('uploadDropzone');
const fileInput = document.getElementById('fileInput');
const btnBrowseFiles = document.getElementById('btnBrowseFiles');
const selectedFilesSummary = document.getElementById('selectedFilesSummary');
const selectedFilesCount = document.getElementById('selectedFilesCount');
const filesPreviewList = document.getElementById('filesPreviewList');
const btnClearSelectedFiles = document.getElementById('btnClearSelectedFiles');
const btnStartUpload = document.getElementById('btnStartUpload');
const uploadProgressSection = document.getElementById('uploadProgressSection');
const progressStatusText = document.getElementById('progressStatusText');
const progressPercentText = document.getElementById('progressPercentText');
const progressBarFill = document.getElementById('progressBarFill');
const uploadLogBox = document.getElementById('uploadLogBox');

// Global actions
const btnExportCsv = document.getElementById('btnExportCsv');
const toastContainer = document.getElementById('toastContainer');

/* ==========================================================================
   Initialization
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    await loadJobDescriptions();
    await loadStats();
    await fetchCandidates();
    initEventListeners();
});

/* ==========================================================================
   Data Fetching & Stats
   ========================================================================== */

async function loadJobDescriptions() {
    try {
        const res = await fetch('/api/jds');
        const data = await res.json();
        renderJdPills(data.jds);
    } catch (err) {
        console.error('Failed to load JDs', err);
    }
}

async function loadStats() {
    try {
        const res = await fetch(`/api/stats?active_jd_id=${state.activeJdId}`);
        const stats = await res.json();
        kpiTotalResumes.textContent = stats.total_resumes.toLocaleString();
        kpiAvgScore.textContent = `${stats.avg_score}%`;
        kpiShortlisted.textContent = stats.shortlisted_count.toLocaleString();
        if (stats.passout_year_counts && (stats.passout_year_counts[2027] || stats.passout_year_counts['2027'])) {
            const count2027 = stats.passout_year_counts[2027] || stats.passout_year_counts['2027'];
            kpi2027Count.textContent = count2027.toLocaleString();
        }
    } catch (err) {
        console.error('Failed to load stats', err);
    }
}

async function fetchCandidates() {
    renderLoadingState();

    const params = new URLSearchParams({
        search: state.search,
        category: state.category,
        min_cgpa: state.minCgpa > 0 ? state.minCgpa : '',
        min_score: state.minScore > 0 ? state.minScore : '',
        status: state.status,
        active_jd_id: state.activeJdId,
        sort_by: state.sortBy,
        sort_order: state.sortOrder,
        page: state.page,
        page_size: state.pageSize
    });

    if (state.passoutYear !== null && state.passoutYear !== undefined) {
        params.append('passout_year', state.passoutYear);
    }

    try {
        const res = await fetch(`/api/candidates?${params.toString()}`);
        const data = await res.json();
        renderCandidates(data.candidates, data.total_count);
        renderPagination(data.page, data.total_pages);
        updateActiveFilterBreadcrumbs();
    } catch (err) {
        console.error('Error fetching candidates', err);
        resultsCountLabel.textContent = 'Error loading candidates';
        candidatesGrid.innerHTML = `<div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--danger);">Failed to load candidates. Please verify server connection.</div>`;
    }
}

/* ==========================================================================
   Rendering Functions
   ========================================================================== */

function renderJdPills(jds) {
    jdPillsList.innerHTML = '';
    jds.forEach(jd => {
        const pill = document.createElement('button');
        pill.className = `jd-pill ${jd.id === state.activeJdId ? 'active' : ''}`;
        pill.innerHTML = `
            <span class="jd-indicator" style="background-color: ${jd.badge_color || '#4f46e5'}"></span>
            <span>${jd.title}</span>
        `;
        pill.addEventListener('click', () => {
            state.activeJdId = jd.id;
            state.page = 1;
            document.querySelectorAll('.jd-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            loadStats();
            fetchCandidates();
            showToast(`Target JD switched to "${jd.title}"`, 'success');
        });
        jdPillsList.appendChild(pill);
    });
}

function renderLoadingState() {
    resultsCountLabel.textContent = 'Filtering candidates...';
    candidatesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 0; text-align: center; color: var(--text-muted);">
            <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
            <p style="margin-top: 12px; font-size: 0.86rem;">Matching candidate profiles against active JD...</p>
        </div>
    `;
    candidatesTableBody.innerHTML = `
        <tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">Filtering candidates...</td></tr>
    `;
}

function renderCandidates(candidates, totalCount) {
    resultsCountLabel.textContent = `${totalCount.toLocaleString()} Candidates Found`;

    if (candidates.length === 0) {
        candidatesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 50px 20px; text-align: center; background: var(--bg-surface); border: 1px dashed var(--border-medium); border-radius: var(--radius-lg);">
                <h4 style="font-size: 1.05rem; color: var(--text-primary); margin-bottom: 4px;">No candidates match your current filter</h4>
                <p style="color: var(--text-muted); font-size: 0.84rem; margin-bottom: 14px;">Try lowering the minimum score or clearing search terms.</p>
                <button class="btn btn-secondary" onclick="resetAllFilters()">Reset Filters</button>
            </div>
        `;
        candidatesTableBody.innerHTML = `
            <tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--text-muted);">No candidates match this criteria.</td></tr>
        `;
        return;
    }

    // Render Cards View
    candidatesGrid.innerHTML = candidates.map(c => createCandidateCardHtml(c)).join('');

    // Render Table View
    candidatesTableBody.innerHTML = candidates.map(c => createCandidateTableRowHtml(c)).join('');

    // Attach dynamic card listeners
    attachCandidateCardEvents();
}

function createCandidateCardHtml(c) {
    const initials = c.name ? c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'CV';
    const catStyle = CATEGORY_COLORS[c.primary_category] || CATEGORY_COLORS['Other'];
    
    // Fit Score Badging
    const score = Math.round(c.active_score || 0);
    let scoreColor = '#64748b';
    let fitText = 'Low Match';
    if (score >= 75) {
        scoreColor = '#059669';
        fitText = 'Strong Match';
    } else if (score >= 60) {
        scoreColor = '#2563eb';
        fitText = 'Good Match';
    } else if (score >= 45) {
        scoreColor = '#d97706';
        fitText = 'Moderate';
    }

    // 2027 Year badge
    const is2027 = c.passout_year === 2027;
    const yearHtml = `<span class="meta-badge ${is2027 ? 'badge-2027' : ''}">${c.passout_year} Batch</span>`;

    // Top Skills
    const topSkills = (c.skills || []).slice(0, 4);
    const skillsHtml = topSkills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');

    return `
        <div class="candidate-card" data-id="${c.id}">
            <div>
                <div class="card-top">
                    <div class="person-info">
                        <div class="avatar">${initials}</div>
                        <div class="person-names">
                            <span class="candidate-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</span>
                            <span class="candidate-email">${escapeHtml(c.email || 'No email')}</span>
                        </div>
                    </div>

                    <div class="score-box">
                        <span class="score-num" style="color: ${scoreColor}">${score}%</span>
                        <span class="score-text" style="color: ${scoreColor}">${fitText}</span>
                    </div>
                </div>

                <div class="tags-row">
                    <span class="category-badge" style="background: ${catStyle.bg}; border: 1px solid ${catStyle.border}; color: ${catStyle.text};">
                        ${escapeHtml(c.primary_category)}
                    </span>
                    ${yearHtml}
                    <span class="meta-badge">${c.cgpa ? `${c.cgpa} CGPA` : '7.5 CGPA'}</span>
                    <span class="meta-badge">${escapeHtml(c.degree || 'Degree')}</span>
                </div>

                <div class="skills-preview-row">
                    ${skillsHtml || '<span class="skill-tag" style="opacity: 0.6">General Profile</span>'}
                </div>
            </div>

            <div class="card-bottom">
                <select class="status-select status-dropdown" data-id="${c.id}">
                    <option value="unreviewed" ${c.status === 'unreviewed' ? 'selected' : ''}>Unreviewed</option>
                    <option value="shortlisted" ${c.status === 'shortlisted' ? 'selected' : ''}>⭐ Shortlisted</option>
                    <option value="in_review" ${c.status === 'in_review' ? 'selected' : ''}>⏳ In Review</option>
                    <option value="rejected" ${c.status === 'rejected' ? 'selected' : ''}>✕ Rejected</option>
                </select>

                <div class="card-actions-right">
                    <button class="icon-button btn-view-profile" data-id="${c.id}" title="View Candidate Profile">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </button>
                    <a href="/api/file/${c.id}" target="_blank" class="icon-button" title="Open Original Resume">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function createCandidateTableRowHtml(c) {
    const catStyle = CATEGORY_COLORS[c.primary_category] || CATEGORY_COLORS['Other'];
    const score = Math.round(c.active_score || 0);
    const scoreColor = score >= 70 ? '#059669' : score >= 50 ? '#2563eb' : '#64748b';
    const is2027 = c.passout_year === 2027;

    return `
        <tr>
            <td>
                <div style="font-weight: 600; color: var(--text-primary); cursor: pointer;" class="table-candidate-name" data-id="${c.id}">
                    ${escapeHtml(c.name)}
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(c.email)}</div>
            </td>
            <td>
                <span class="category-badge" style="background: ${catStyle.bg}; border: 1px solid ${catStyle.border}; color: ${catStyle.text};">
                    ${escapeHtml(c.primary_category)}
                </span>
            </td>
            <td>
                <span class="meta-badge ${is2027 ? 'badge-2027' : ''}">${c.passout_year}</span>
            </td>
            <td><strong style="color: var(--text-primary);">${c.cgpa}</strong></td>
            <td>
                <span style="font-family: var(--font-heading); font-weight: 700; color: ${scoreColor}; font-size: 1.05rem;">
                    ${score}%
                </span>
            </td>
            <td>
                <div style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.74rem; color: var(--text-secondary);">
                    ${escapeHtml((c.skills || []).slice(0, 5).join(', '))}
                </div>
            </td>
            <td>
                <span class="meta-badge">${c.status}</span>
            </td>
            <td>
                <button class="btn btn-secondary btn-view-profile" data-id="${c.id}" style="padding: 3px 8px; font-size: 0.74rem;">
                    View
                </button>
            </td>
        </tr>
    `;
}

function attachCandidateCardEvents() {
    // View Profile Click
    document.querySelectorAll('.btn-view-profile, .candidate-name, .table-candidate-name').forEach(el => {
        el.addEventListener('click', () => {
            const candId = el.getAttribute('data-id') || el.closest('.candidate-card')?.getAttribute('data-id');
            if (candId) openCandidateDrawer(candId);
        });
    });

    // Status Dropdown Changes
    document.querySelectorAll('.status-dropdown').forEach(dropdown => {
        dropdown.addEventListener('change', async () => {
            const candId = dropdown.getAttribute('data-id');
            const newStatus = dropdown.value;
            try {
                const res = await fetch(`/api/candidates/${candId}/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (res.ok) {
                    showToast(`Candidate status set to "${newStatus}"`, 'success');
                    loadStats();
                }
            } catch (err) {
                showToast('Failed to update status', 'error');
            }
        });
    });
}

function renderPagination(currentPage, totalPages) {
    pageNumbers.innerHTML = '';
    btnPrevPage.disabled = currentPage <= 1;
    btnNextPage.disabled = currentPage >= totalPages;

    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let p = startPage; p <= endPage; p++) {
        const btn = document.createElement('button');
        btn.className = `page-item ${p === currentPage ? 'active' : ''}`;
        btn.textContent = p;
        btn.addEventListener('click', () => {
            state.page = p;
            fetchCandidates();
            window.scrollTo({ top: 200, behavior: 'smooth' });
        });
        pageNumbers.appendChild(btn);
    }
}

function updateActiveFilterBreadcrumbs() {
    activeFilterTags.innerHTML = '';
    let hasFilters = false;

    if (state.search) {
        hasFilters = true;
        addBreadcrumb(`Search: "${state.search}"`, () => {
            state.search = '';
            searchInput.value = '';
            btnClearSearch.style.display = 'none';
            fetchCandidates();
        });
    }

    if (state.passoutYear) {
        hasFilters = true;
        addBreadcrumb(`Batch: ${state.passoutYear}`, () => {
            state.passoutYear = null;
            document.querySelectorAll('#passoutYearChips .pill-btn').forEach(c => c.classList.remove('active'));
            document.querySelector('#passoutYearChips .pill-btn[data-year=""]').classList.add('active');
            fetchCandidates();
        });
    }

    if (state.category) {
        hasFilters = true;
        addBreadcrumb(`Category: ${state.category}`, () => {
            state.category = '';
            document.querySelectorAll('#categoryChips .pill-btn').forEach(c => c.classList.remove('active'));
            document.querySelector('#categoryChips .pill-btn[data-category=""]').classList.add('active');
            fetchCandidates();
        });
    }

    if (state.minCgpa > 0) {
        hasFilters = true;
        addBreadcrumb(`CGPA ≥ ${state.minCgpa}`, () => {
            state.minCgpa = 0;
            cgpaSlider.value = 0;
            cgpaValueLabel.textContent = 'Any';
            fetchCandidates();
        });
    }

    if (state.minScore > 0) {
        hasFilters = true;
        addBreadcrumb(`Score ≥ ${state.minScore}%`, () => {
            state.minScore = 0;
            scoreSlider.value = 0;
            scoreValueLabel.textContent = 'Any (0%)';
            fetchCandidates();
        });
    }

    if (state.status) {
        hasFilters = true;
        addBreadcrumb(`Status: ${state.status}`, () => {
            state.status = '';
            document.querySelectorAll('#statusChips .pill-btn').forEach(c => c.classList.remove('active'));
            document.querySelector('#statusChips .pill-btn[data-status=""]').classList.add('active');
            fetchCandidates();
        });
    }

    activeFiltersBar.style.display = hasFilters ? 'flex' : 'none';
}

function addBreadcrumb(label, onRemove) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `<span>${label}</span> <button>&times;</button>`;
    tag.querySelector('button').addEventListener('click', onRemove);
    activeFilterTags.appendChild(tag);
}

/* ==========================================================================
   Candidate Slide-over Drawer
   ========================================================================== */

async function openCandidateDrawer(candidateId) {
    drawerBody.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            <p>Loading candidate analysis...</p>
        </div>
    `;
    drawerOverlay.classList.add('active');
    candidateDrawer.classList.add('active');

    try {
        const res = await fetch(`/api/candidates/${candidateId}?jd_id=${state.activeJdId}`);
        const data = await res.json();
        renderDrawerContent(data.candidate, data.jd_analysis);
    } catch (err) {
        drawerBody.innerHTML = `<p style="color:var(--danger)">Failed to load candidate details.</p>`;
    }
}

function closeCandidateDrawer() {
    drawerOverlay.classList.remove('active');
    candidateDrawer.classList.remove('active');
}

function renderDrawerContent(c, jd) {
    drawerCandidateName.textContent = c.name;
    drawerCandidateRole.textContent = `${c.primary_category} • ${c.passout_year} Batch`;

    const score = Math.round(jd.score || 0);
    const scoreColor = score >= 75 ? '#059669' : score >= 60 ? '#2563eb' : score >= 45 ? '#d97706' : '#64748b';

    // Matched skills tags
    const matchedTags = (jd.matched_skills || []).map(s => `<span class="tag-match">✓ ${escapeHtml(s)}</span>`).join('');
    // Missing skills tags
    const missingTags = (jd.missing_skills || []).map(s => `<span class="tag-gap">⚠ ${escapeHtml(s)}</span>`).join('');

    // Projects list
    const projectsHtml = (c.projects || []).map(p => `
        <div class="project-item">
            <span class="project-title">${escapeHtml(p.title || 'Project')}</span>
            <p class="project-desc">${escapeHtml(p.description || '')}</p>
        </div>
    `).join('') || '<p style="font-size:0.78rem; color:var(--text-muted)">No projects extracted.</p>';

    // Skills chips
    const skillsListHtml = (c.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');

    drawerBody.innerHTML = `
        <!-- Details Grid -->
        <div class="detail-grid">
            <div class="detail-cell">
                <span class="detail-label">Email</span>
                <span class="detail-value">${c.email && c.email !== 'Not Found' ? `<a href="mailto:${c.email}" style="color:var(--primary)">${c.email}</a>` : 'Not Found'}</span>
            </div>
            <div class="detail-cell">
                <span class="detail-label">Phone</span>
                <span class="detail-value">${c.phone && c.phone !== 'Not Found' ? `<a href="tel:${c.phone}" style="color:var(--text-primary)">${c.phone}</a>` : 'Not Found'}</span>
            </div>
            <div class="detail-cell">
                <span class="detail-label">Passout Batch</span>
                <span class="detail-value" style="color: ${c.passout_year === 2027 ? '#059669' : 'var(--text-primary)'}">${c.passout_year} Batch</span>
            </div>
            <div class="detail-cell">
                <span class="detail-label">CGPA</span>
                <span class="detail-value">${c.cgpa ? `${c.cgpa} / 10.0` : 'Not Specified'}</span>
            </div>
            <div class="detail-cell">
                <span class="detail-label">Degree</span>
                <span class="detail-value">${escapeHtml(c.degree || "Bachelor's")}</span>
            </div>
            <div class="detail-cell">
                <span class="detail-label">Resume Document</span>
                <span class="detail-value"><a href="/api/file/${c.id}" target="_blank" style="color:var(--primary); text-decoration: underline;">Open Original File</a></span>
            </div>
        </div>

        <!-- JD Fit Breakdown -->
        <div>
            <span class="drawer-section-title">JD Match Analysis: ${escapeHtml(jd.jd_title)}</span>
            <div class="drawer-match-card">
                <div class="drawer-match-header">
                    <div>
                        <span style="font-size:0.72rem; color:var(--text-muted); text-transform:uppercase;">Overall Score</span>
                        <div class="drawer-score-big" style="color: ${scoreColor}">${score}%</div>
                    </div>
                    <span class="meta-badge" style="background:#f1f5f9; color:${scoreColor}; font-weight:700; font-size:0.8rem; padding: 4px 10px;">
                        ${jd.fit_level}
                    </span>
                </div>

                <div class="skills-split">
                    <div>
                        <h5 style="color:#047857">Matched Skills (${jd.matched_skills ? jd.matched_skills.length : 0})</h5>
                        <div class="skills-cluster">
                            ${matchedTags || '<span style="font-size:0.72rem; color:var(--text-muted)">None matched</span>'}
                        </div>
                    </div>
                    <div>
                        <h5 style="color:#b91c1c">Skill Gaps (${jd.missing_skills ? jd.missing_skills.length : 0})</h5>
                        <div class="skills-cluster">
                            ${missingTags || '<span style="font-size:0.72rem; color:#059669">No major gaps!</span>'}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Projects -->
        <div>
            <span class="drawer-section-title">Projects</span>
            ${projectsHtml}
        </div>

        <!-- Extracted Skills -->
        <div>
            <span class="drawer-section-title">Extracted Skills</span>
            <div class="skills-cluster">
                ${skillsListHtml || '<span style="color:var(--text-muted)">No skills extracted</span>'}
            </div>
        </div>

        <!-- Raw Resume Text -->
        <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                <span class="drawer-section-title" style="margin-bottom:0;">Resume Text</span>
                <button class="btn btn-secondary" id="btnCopyResumeText" style="padding:2px 8px; font-size:0.72rem;">Copy</button>
            </div>
            <pre class="raw-box">${escapeHtml(c.raw_text || 'No text extracted')}</pre>
        </div>
    `;

    document.getElementById('btnCopyResumeText')?.addEventListener('click', () => {
        navigator.clipboard.writeText(c.raw_text || '');
        showToast('Resume text copied to clipboard', 'success');
    });
}

/* ==========================================================================
   Batch Upload Modal Logic
   ========================================================================== */

function initUploadModal() {
    btnOpenUploadModal.addEventListener('click', () => {
        resetUploadModal();
        uploadModalOverlay.classList.add('active');
    });

    btnCloseUploadModal.addEventListener('click', () => {
        uploadModalOverlay.classList.remove('active');
    });

    btnCancelUpload.addEventListener('click', () => {
        uploadModalOverlay.classList.remove('active');
    });

    btnBrowseFiles.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        handleFilesSelected(Array.from(e.target.files));
    });

    // Drag and Drop
    uploadDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadDropzone.classList.add('dragover');
    });

    uploadDropzone.addEventListener('dragleave', () => {
        uploadDropzone.classList.remove('dragover');
    });

    uploadDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadDropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelected(Array.from(e.dataTransfer.files));
        }
    });

    btnClearSelectedFiles.addEventListener('click', resetUploadModal);
    btnStartUpload.addEventListener('click', executeBatchUpload);
}

function handleFilesSelected(files) {
    state.selectedFiles = files;
    if (files.length === 0) {
        selectedFilesSummary.style.display = 'none';
        btnStartUpload.disabled = true;
        return;
    }

    selectedFilesSummary.style.display = 'block';
    selectedFilesCount.textContent = `${files.length} resume file${files.length > 1 ? 's' : ''} selected`;
    btnStartUpload.disabled = false;

    // Preview up to 8 files
    filesPreviewList.innerHTML = files.slice(0, 8).map(f => `
        <div class="preview-item-row">
            <span>📄 ${escapeHtml(f.name)}</span>
            <span style="color:var(--text-muted)">${formatFileSize(f.size)}</span>
        </div>
    `).join('');

    if (files.length > 8) {
        filesPreviewList.innerHTML += `<div style="font-size:0.72rem; color:var(--text-muted); padding-top:2px;">...and ${files.length - 8} more files</div>`;
    }
}

function resetUploadModal() {
    state.selectedFiles = [];
    fileInput.value = '';
    selectedFilesSummary.style.display = 'none';
    uploadProgressSection.style.display = 'none';
    progressBarFill.style.width = '0%';
    uploadLogBox.innerHTML = '';
    btnStartUpload.disabled = true;
}

async function executeBatchUpload() {
    if (state.selectedFiles.length === 0) return;

    btnStartUpload.disabled = true;
    uploadProgressSection.style.display = 'flex';
    progressBarFill.style.width = '20%';
    progressStatusText.textContent = `Uploading ${state.selectedFiles.length} files...`;
    progressPercentText.textContent = '20%';

    appendUploadLog(`Uploading ${state.selectedFiles.length} resume(s)...`);

    const formData = new FormData();
    state.selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    formData.append('active_jd_id', state.activeJdId);

    try {
        progressBarFill.style.width = '60%';
        progressStatusText.textContent = 'Parsing skills, projects, and passout years...';
        progressPercentText.textContent = '60%';
        appendUploadLog('Extracting content and assigning categories...');

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        progressBarFill.style.width = '100%';
        progressPercentText.textContent = '100%';
        progressStatusText.textContent = `Completed! Processed ${data.successful_count} resumes.`;

        appendUploadLog(`Successfully indexed ${data.successful_count} resume(s).`);

        if (data.errors && data.errors.length > 0) {
            data.errors.forEach(err => {
                appendUploadLog(`[WARN] ${err.filename}: ${err.error}`);
            });
        }

        showToast(`Batch processed: ${data.successful_count} resumes ingested.`, 'success');
        
        await loadStats();
        await fetchCandidates();

        setTimeout(() => {
            uploadModalOverlay.classList.remove('active');
        }, 1400);

    } catch (err) {
        progressStatusText.textContent = 'Upload failed. Check error log.';
        appendUploadLog(`[ERROR] ${err.message}`);
        showToast('Batch processing failed', 'error');
        btnStartUpload.disabled = false;
    }
}

function appendUploadLog(msg) {
    const time = new Date().toLocaleTimeString();
    uploadLogBox.innerHTML += `<div>[${time}] ${escapeHtml(msg)}</div>`;
    uploadLogBox.scrollTop = uploadLogBox.scrollHeight;
}

/* ==========================================================================
   Filter & UI Event Listeners
   ========================================================================== */

function initEventListeners() {
    // Search input with debounce
    let searchDebounce;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        const val = e.target.value.trim();
        btnClearSearch.style.display = val ? 'block' : 'none';
        searchDebounce = setTimeout(() => {
            state.search = val;
            state.page = 1;
            fetchCandidates();
        }, 300);
    });

    btnClearSearch.addEventListener('click', () => {
        searchInput.value = '';
        state.search = '';
        state.page = 1;
        btnClearSearch.style.display = 'none';
        fetchCandidates();
    });

    // Passout Year Chips
    passoutYearChips.addEventListener('click', (e) => {
        if (!e.target.classList.contains('pill-btn')) return;
        passoutYearChips.querySelectorAll('.pill-btn').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        const yearVal = e.target.getAttribute('data-year');
        state.passoutYear = yearVal ? parseInt(yearVal) : null;
        state.page = 1;
        fetchCandidates();
    });

    // Quick filter click on 2027 KPI card
    kpiCard2027.addEventListener('click', () => {
        passoutYearChips.querySelectorAll('.pill-btn').forEach(c => c.classList.remove('active'));
        const chip2027 = passoutYearChips.querySelector('.pill-btn[data-year="2027"]');
        if (chip2027) chip2027.classList.add('active');
        state.passoutYear = 2027;
        state.page = 1;
        fetchCandidates();
        showToast('Filtered by 2027 Passout Batch (1,187 candidates)', 'success');
    });

    // Category Chips
    categoryChips.addEventListener('click', (e) => {
        if (!e.target.classList.contains('pill-btn')) return;
        categoryChips.querySelectorAll('.pill-btn').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        state.category = e.target.getAttribute('data-category');
        state.page = 1;
        fetchCandidates();
    });

    // CGPA Slider
    cgpaSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        state.minCgpa = val;
        cgpaValueLabel.textContent = val > 0 ? `≥ ${val.toFixed(1)}` : 'Any';
    });
    cgpaSlider.addEventListener('change', () => {
        state.page = 1;
        fetchCandidates();
    });

    // Score Slider
    scoreSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        state.minScore = val;
        scoreValueLabel.textContent = val > 0 ? `≥ ${val}%` : 'Any (0%)';
    });
    scoreSlider.addEventListener('change', () => {
        state.page = 1;
        fetchCandidates();
    });

    // Status Chips
    statusChips.addEventListener('click', (e) => {
        if (!e.target.classList.contains('pill-btn')) return;
        statusChips.querySelectorAll('.pill-btn').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        state.status = e.target.getAttribute('data-status');
        state.page = 1;
        fetchCandidates();
    });

    // Reset All Filters
    btnResetFilters.addEventListener('click', resetAllFilters);

    // Sorting Dropdown
    sortSelect.addEventListener('change', (e) => {
        const [field, dir] = e.target.value.split('_');
        state.sortBy = field;
        state.sortOrder = dir;
        state.page = 1;
        fetchCandidates();
    });

    // View Switchers
    btnViewCards.addEventListener('click', () => {
        state.viewMode = 'cards';
        btnViewCards.classList.add('active');
        btnViewTable.classList.remove('active');
        candidatesGrid.style.display = 'grid';
        candidatesTableContainer.style.display = 'none';
    });

    btnViewTable.addEventListener('click', () => {
        state.viewMode = 'table';
        btnViewTable.classList.add('active');
        btnViewCards.classList.remove('active');
        candidatesGrid.style.display = 'none';
        candidatesTableContainer.style.display = 'block';
    });

    // Pagination buttons
    btnPrevPage.addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            fetchCandidates();
            window.scrollTo({ top: 150, behavior: 'smooth' });
        }
    });

    btnNextPage.addEventListener('click', () => {
        state.page++;
        fetchCandidates();
        window.scrollTo({ top: 150, behavior: 'smooth' });
    });

    // Drawer closing
    drawerOverlay.addEventListener('click', closeCandidateDrawer);
    btnCloseDrawer.addEventListener('click', closeCandidateDrawer);

    // Export CSV
    btnExportCsv.addEventListener('click', () => {
        const params = new URLSearchParams({
            search: state.search,
            category: state.category,
            min_cgpa: state.minCgpa > 0 ? state.minCgpa : '',
            min_score: state.minScore > 0 ? state.minScore : '',
            status: state.status,
            active_jd_id: state.activeJdId
        });
        if (state.passoutYear !== null && state.passoutYear !== undefined) {
            params.append('passout_year', state.passoutYear);
        }
        window.location.href = `/api/export?${params.toString()}`;
        showToast('Exporting candidate CSV...', 'success');
    });

    // Initialize Upload Modal
    initUploadModal();
}

function resetAllFilters() {
    state.search = '';
    state.category = '';
    state.passoutYear = null;
    state.minCgpa = 0;
    state.minScore = 0;
    state.status = '';
    state.page = 1;

    searchInput.value = '';
    btnClearSearch.style.display = 'none';

    document.querySelectorAll('#passoutYearChips .pill-btn').forEach(c => c.classList.remove('active'));
    document.querySelector('#passoutYearChips .pill-btn[data-year=""]').classList.add('active');

    document.querySelectorAll('#categoryChips .pill-btn').forEach(c => c.classList.remove('active'));
    document.querySelector('#categoryChips .pill-btn[data-category=""]').classList.add('active');

    cgpaSlider.value = 0;
    cgpaValueLabel.textContent = 'Any';

    scoreSlider.value = 0;
    scoreValueLabel.textContent = 'Any (0%)';

    document.querySelectorAll('#statusChips .pill-btn').forEach(c => c.classList.remove('active'));
    document.querySelector('#statusChips .pill-btn[data-status=""]').classList.add('active');

    fetchCandidates();
    showToast('Filters reset', 'success');
}

/* ==========================================================================
   Utilities
   ========================================================================== */

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `clean-toast ${type}`;
    toast.innerHTML = `
        <span style="font-weight:700; color: ${type === 'success' ? '#059669' : '#dc2626'}">${type === 'success' ? '✓' : '⚠'}</span>
        <span>${escapeHtml(message)}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 250);
    }, 3000);
}
