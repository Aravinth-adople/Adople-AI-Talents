const BASE_URL = '/api';

export async function fetchJds() {
  const res = await fetch(`${BASE_URL}/jds`);
  if (!res.ok) throw new Error('Failed to load JDs');
  return res.json();
}

export async function fetchStats(activeJdId = 'ai-engineer') {
  const res = await fetch(`${BASE_URL}/stats?active_jd_id=${activeJdId}`);
  if (!res.ok) throw new Error('Failed to load stats');
  return res.json();
}

export async function fetchCandidates({
  search = '',
  category = '',
  passoutYear = null,
  minCgpa = 0,
  minScore = 0,
  status = '',
  activeJdId = 'ai-engineer',
  sortBy = 'score',
  sortOrder = 'desc',
  page = 1,
  pageSize = 24
}) {
  const params = new URLSearchParams({
    search,
    category,
    min_cgpa: minCgpa > 0 ? minCgpa : '',
    min_score: minScore > 0 ? minScore : '',
    status,
    active_jd_id: activeJdId,
    sort_by: sortBy,
    sort_order: sortOrder,
    page: String(page),
    page_size: String(pageSize)
  });

  if (passoutYear !== null && passoutYear !== undefined) {
    params.append('passout_year', String(passoutYear));
  }

  const res = await fetch(`${BASE_URL}/candidates?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load candidates');
  return res.json();
}

export async function fetchCandidateDetails(id, activeJdId = 'ai-engineer') {
  const res = await fetch(`${BASE_URL}/candidates/${id}?jd_id=${activeJdId}`);
  if (!res.ok) throw new Error('Failed to load candidate details');
  return res.json();
}

export async function updateCandidateStatus(id, status) {
  const res = await fetch(`${BASE_URL}/candidates/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function uploadResumes(files, activeJdId = 'ai-engineer') {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  formData.append('active_jd_id', activeJdId);

  const res = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to process batch upload');
  return res.json();
}

export function getExportUrl({
  search = '',
  category = '',
  passoutYear = null,
  minCgpa = 0,
  minScore = 0,
  status = '',
  activeJdId = 'ai-engineer',
  sortBy = 'score',
  sortOrder = 'desc',
  format = 'csv'
}) {
  const params = new URLSearchParams({
    search,
    category,
    min_cgpa: minCgpa > 0 ? minCgpa : '',
    min_score: minScore > 0 ? minScore : '',
    status,
    active_jd_id: activeJdId,
    sort_by: sortBy,
    sort_order: sortOrder,
    format
  });
  if (passoutYear !== null && passoutYear !== undefined) {
    params.append('passout_year', String(passoutYear));
  }
  return `${BASE_URL}/export?${params.toString()}`;
}

export async function evaluateCandidateWithAi(id, activeJdId = 'ai-engineer') {
  const res = await fetch(`${BASE_URL}/candidates/${id}/ai-evaluate?jd_id=${activeJdId}`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to run AI evaluation' }));
    throw new Error(err.detail || 'Failed to run AI evaluation');
  }
  return res.json();
}

export async function fetchBatchEvalStatus() {
  const res = await fetch(`${BASE_URL}/batch-evaluate/status`);
  if (!res.ok) throw new Error('Failed to fetch batch evaluation status');
  return res.json();
}

export async function startBatchEval(activeJdId = 'ai-engineer', reevaluateAll = false, workers = 6) {
  const res = await fetch(`${BASE_URL}/batch-evaluate/start?active_jd_id=${activeJdId}&reevaluate_all=${reevaluateAll}&workers=${workers}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to start batch evaluation');
  return res.json();
}

export async function stopBatchEval() {
  const res = await fetch(`${BASE_URL}/batch-evaluate/stop`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to stop batch evaluation');
  return res.json();
}

export async function deleteCandidate(candidateId) {
  const res = await fetch(`${BASE_URL}/candidates/${candidateId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to delete candidate' }));
    throw new Error(err.detail || 'Failed to delete candidate');
  }
  return res.json();
}

