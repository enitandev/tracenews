/**
 * Public feature flags. Off means the surface returns 404 (with noindex) to
 * browsers and crawlers alike, and nothing links to it. Code and data are
 * kept; turning a flag on is the only change needed to publish again.
 *
 * BRIEFING_PUBLIC — Daily Briefing. Off until the rebuild (counsel's
 *   consolidated instruction, 3 Oct 2026, section B) is cleared by counsel.
 * REGISTRY_PUBLIC — /registry outlet list. Off; its party-proximity field
 *   needs per-outlet evidence before anything like it is shown.
 */
export const BRIEFING_PUBLIC = false;
export const REGISTRY_PUBLIC = false;
