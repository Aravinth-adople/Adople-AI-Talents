export const CATEGORY_COLORS = {
  'Agentic AI': { bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  'AI/ML': { bg: '#eff6ff', border: '#bfdbfe', text: '#004AAC' },
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

export const ALL_CATEGORIES = [
  'Full Stack',
  'Agentic AI',
  'AI/ML',
  'Frontend',
  'Backend',
  'Data Analyst',
  'Business Development',
  'AR Calling',
  'QA/Testing',
  'DevOps',
  'UI/UX',
  'Other'
];

export const PASSOUT_YEARS = [
  { label: 'All', value: null },
  { label: '2027 (1,187)', value: 2027, is2027: true },
  { label: '2026', value: 2026 },
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 },
  { label: '2023', value: 2023 },
  { label: '≤ 2022', value: 2022 }
];

export function getScoreBadge(score) {
  const s = Math.round(score || 0);
  if (s >= 75) {
    return { score: s, text: 'Strong Match', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' };
  }
  if (s >= 60) {
    return { score: s, text: 'Good Match', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
  }
  if (s >= 45) {
    return { score: s, text: 'Moderate', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  }
  return { score: s, text: 'Low Match', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
