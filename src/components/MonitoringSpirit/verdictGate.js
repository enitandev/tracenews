import { TIERS } from '../../constants/tiers';

/**
 * DARK RENDERING GATE — LEGAL CONSTRAINT, NOT A STYLE CHOICE.
 *
 * Gate D (the suppression check) never closed: two shadow runs across 945
 * clusters produced zero verified findings. CLEAR and MIXED ship; DARK does not.
 * A DARK payload renders NOTHING — never a muted or "calm" fallback, because a
 * calm card would make a false positive claim about the story's coverage.
 *
 * Flipping this to true requires a human-oversight tool to exist first: a named
 * person must be able to withdraw a live verdict. Do not change this flag as part
 * of any other change.
 */
export const DARK_ENABLED = false;

export const TIER_ORDER = [TIERS.GOVT, TIERS.MAINSTREAM, TIERS.WATCHDOG];
// Tiers that exist but sit outside the three-tier card by design.
const NON_CARD_TIERS = [TIERS.UNSCORED, TIERS.BLOG];
// Backend marks a DARK result it has withheld with this note.
const WITHHELD_NOTE = 'withheld_pending_story_type_classification';

/**
 * Collapses article rows to one entry per outlet and buckets them by tier.
 * Counts on the card are distinct outlets, never article rows.
 * An unrecognised tier is logged and excluded, never absorbed into a tier.
 */
export function buildTierRoster(clusterStories) {
  const roster = { [TIERS.GOVT]: [], [TIERS.MAINSTREAM]: [], [TIERS.WATCHDOG]: [] };
  const seen = new Set();
  clusterStories.forEach(s => {
    const outletKey = s.outlet_id || s.outlet_slug;
    if (!outletKey) {
      console.error('VerdictCard: story without outlet identity excluded from counts', s.id);
      return;
    }
    if (seen.has(outletKey)) return;
    seen.add(outletKey);
    const tier = s.outlet_coverage_tier;
    if (roster[tier]) {
      roster[tier].push(s);
    } else if (!NON_CARD_TIERS.includes(tier)) {
      console.error(`VerdictCard: unrecognised outlet_coverage_tier "${tier}" excluded`, s.id);
    }
  });
  return roster;
}

/**
 * Whether a verdict may be shown at all. Every counsel-cleared string makes a
 * factual claim; the card renders only when the payload makes that claim true.
 * Anything else renders nothing (Invariant 1: withhold rather than mislead).
 */
export function isVerdictRenderable(verdictData, counts, sameCopy, roster) {
  if (!verdictData || !verdictData.verdict) return false;
  const state = verdictData.verdict;
  if (state === 'dark') {
    if (!DARK_ENABLED) {
      console.error('VerdictCard received DARK on a rendering surface — withheld (DARK_ENABLED is false).');
      return false;
    }
    return true;
  }
  if (verdictData.note === WITHHELD_NOTE) return false;
  const total = TIER_ORDER.reduce((sum, t) => sum + counts[t], 0);
  if (state === 'clear') {
    // "Reported by {n} outlets across all three editorial tiers" and
    // "...with original reporting in each" (tier).
    return total >= 5 && TIER_ORDER.every(t =>
      counts[t] > 0 && roster[t].some(s => s.outlet_republishes === false));
  }
  if (state === 'mixed') {
    // "{a} of {b} outlets ran the same wire copy" — only the churnalism route
    // fits this copy; a silence-route MIXED has no approved wording yet.
    // "Covered across outlet types" / "Carried across all three tiers" need
    // every tier present.
    const isChurnalism = (verdictData.evidence || []).some(e => e && e.type === 'churnalism');
    return isChurnalism && sameCopy.a > 0 && sameCopy.b > 0 && TIER_ORDER.every(t => counts[t] > 0);
  }
  console.error(`VerdictCard: unrecognised verdict "${state}" withheld`);
  return false;
}

/** Same-copy counts, matching the backend's churnalism ratio: {b} is every
 *  outlet with a behavioural score, {a} those the backend marks as
 *  republishers. Outlets without a score are in neither. */
export function countSameCopy(roster) {
  let a = 0, b = 0;
  TIER_ORDER.forEach(t => roster[t].forEach(s => {
    if (s.outlet_s2_score === null || s.outlet_s2_score === undefined) return;
    b++;
    if (s.outlet_republishes === true) a++;
  }));
  return { a, b };
}
