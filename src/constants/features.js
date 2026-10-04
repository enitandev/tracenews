/**
 * Public feature flags. Off means the surface returns 404 (with noindex) to
 * browsers and crawlers alike, and nothing links to it. Code and data are
 * kept; turning a flag on is the only change needed to publish again.
 *
 * BRIEFING_PUBLIC — Daily Briefing. On from 4 Oct 2026 by the owner's decision,
 *   after counsel's launch fixes 1-6 were built and tested.
 * REGISTRY_PUBLIC — /registry outlet list. Off; its party-proximity field
 *   needs per-outlet evidence before anything like it is shown.
 */
export const BRIEFING_PUBLIC = true;
export const REGISTRY_PUBLIC = false;
