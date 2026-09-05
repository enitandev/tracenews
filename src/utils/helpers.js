export const REGION_COLORS = {
  'North': '#2471A3',
  'Southwest': '#8f9a6f',
  'Southeast': '#008751',
  'South-South': '#F39C12',
  'Niger Delta': '#F39C12',
  'National': '#888888',
  'Unknown': '#e5e5e5'
};

export const SEVERITY_COLORS = {
  'high': '#a49889',
  'critical': '#8f9a6f',
  'medium': '#f39c12',
  'low': '#2471a3'
};

export const COVERAGE_TIER_COLORS = {
  'govt_aligned': '#6d7f92',
  'mainstream': '#a49889',
  'watchdog': '#8f9a6f',
  'unscored': '#999999'
};

export const TIER_LABELS = {
  'govt_aligned': 'Govt',
  'mainstream': 'Mainstream',
  'watchdog': 'Watchdog',
  'unscored': 'Unscored'
};

export function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const COVERAGE_TIER_BG_COLORS = {
  govt_aligned: 'rgba(41, 128, 185, 0.12)',
  mainstream: 'rgba(230, 126, 34, 0.12)',
  watchdog: 'rgba(192, 57, 43, 0.12)',
  unscored: 'rgba(153, 153, 153, 0.12)'
};
