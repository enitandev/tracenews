import { describe, it, expect, vi, afterEach } from 'vitest';
import { getOutletTier, TIERS } from './tiers';

describe('getOutletTier', () => {
  afterEach(() => vi.restoreAllMocks());

  it('maps government_alignment to the canonical tiers', () => {
    expect(getOutletTier({ government_alignment: 'pro_government' })).toBe(TIERS.GOVT);
    expect(getOutletTier({ government_alignment: 'neutral' })).toBe(TIERS.MAINSTREAM);
    expect(getOutletTier({ government_alignment: 'opposition' })).toBe(TIERS.WATCHDOG);
  });

  it('blogs are blogs whatever their alignment', () => {
    expect(getOutletTier({ government_alignment: 'neutral', is_blog: true })).toBe(TIERS.BLOG);
  });

  it('missing outlet or alignment is unscored', () => {
    expect(getOutletTier(null)).toBe(TIERS.UNSCORED);
    expect(getOutletTier({ government_alignment: null })).toBe(TIERS.UNSCORED);
  });

  it('an unrecognised alignment is logged and unscored, never absorbed into a tier', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(getOutletTier({ government_alignment: 'Institutional', credibility_tier: 'Institutional' })).toBe(TIERS.UNSCORED);
    expect(spy).toHaveBeenCalled();
  });
});
