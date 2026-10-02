export const TIERS = {
  GOVT: 'govt_aligned',
  MAINSTREAM: 'mainstream',
  WATCHDOG: 'watchdog',
  BLOG: 'blog',
  UNSCORED: 'unscored'
};

export const TIER_KEYS = [TIERS.GOVT, TIERS.MAINSTREAM, TIERS.WATCHDOG, TIERS.UNSCORED];

export const TIER_LABELS = {
  [TIERS.GOVT]: 'Govt',
  [TIERS.MAINSTREAM]: 'Mainstream',
  [TIERS.WATCHDOG]: 'Watchdog',
  [TIERS.BLOG]: 'Blog',
  [TIERS.UNSCORED]: 'Unscored'
};

/**
 * The single frontend mapping from an outlet record to its tier — mirrors
 * get_outlet_tier in the backend's tier_utils.py. outlets.government_alignment
 * is the live tier source; credibility_tier is dead and never read.
 * An unrecognised alignment is logged and returns UNSCORED, never a tier.
 */
export function getOutletTier(outlet) {
  if (!outlet) return TIERS.UNSCORED;
  if (outlet.is_blog) return TIERS.BLOG;
  const align = (outlet.government_alignment || '').toLowerCase();
  if (!align) return TIERS.UNSCORED;
  if (align === 'pro_government') return TIERS.GOVT;
  if (align === 'neutral') return TIERS.MAINSTREAM;
  if (align === 'opposition') return TIERS.WATCHDOG;
  console.error(`Unrecognised government_alignment: ${outlet.government_alignment}`);
  return TIERS.UNSCORED;
}
