export const TIERS = {
  GOVT: 'govt_aligned',
  MAINSTREAM: 'mainstream',
  WATCHDOG: 'watchdog',
  BLOG: 'blog',
  UNSCORED: 'unscored'
};

export const TIER_KEYS = [TIERS.GOVT, TIERS.MAINSTREAM, TIERS.WATCHDOG, TIERS.UNSCORED];

export const TIER_COLORS = {
  [TIERS.GOVT]: '#6d7f92',
  [TIERS.MAINSTREAM]: '#a49889',
  [TIERS.WATCHDOG]: '#8f9a6f',
  [TIERS.BLOG]: '#888',
  [TIERS.UNSCORED]: '#333'
};

export const TIER_BG_COLORS = {
  [TIERS.GOVT]: 'rgba(109, 127, 146, 0.1)',
  [TIERS.MAINSTREAM]: 'rgba(164, 152, 137, 0.1)',
  [TIERS.WATCHDOG]: 'rgba(143, 154, 111, 0.1)',
  [TIERS.BLOG]: 'rgba(136, 136, 136, 0.1)',
  [TIERS.UNSCORED]: 'rgba(51, 51, 51, 0.1)'
};

export const TIER_LABELS = {
  [TIERS.GOVT]: 'Govt',
  [TIERS.MAINSTREAM]: 'Mainstream',
  [TIERS.WATCHDOG]: 'Watchdog',
  [TIERS.BLOG]: 'Blog',
  [TIERS.UNSCORED]: 'Unscored'
};
