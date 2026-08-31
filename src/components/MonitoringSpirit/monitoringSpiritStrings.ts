/**
 * monitoringSpiritStrings.ts
 * -----------------------------------------------------------------------------
 * FROZEN SOURCE OF TRUTH for the Monitoring Spirit verdict card.
 *
 * Every user-facing string AND every design token the card renders lives here.
 * Counsel (Bridge Chambers) signed the Monitoring Spirit surface on the basis
 * of THESE EXACT STRINGS and THESE EXACT VISUAL TREATMENTS.
 *
 * RULES:
 *  - Do NOT edit any string in this file without a fresh counsel sign-off.
 *    The language was reviewed as composed (Gate B addendum 7 Jul 2026,
 *    visual extension 8 Jul 2026, confirmation 8 Jul 2026).
 *  - Do NOT introduce a user-facing string anywhere in the component that is
 *    not defined here. If the component renders it, it is defined here. The
 *    percentage-bar incident (a rendered element that never entered the string
 *    inventory) is the reason this rule exists.
 *  - The token hexes are the CANONICAL tier + verdict palette. Reuse verbatim
 *    anywhere Govt/Mainstream/Watchdog appear (methodology page included).
 *    Never pick a tier or verdict colour ad hoc in a component.
 * -----------------------------------------------------------------------------
 */
export type VerdictState = "clear" | "mixed" | "dark";
export type TierKey = "govt" | "mainstream" | "watchdog";
/* ----------------------------- DESIGN TOKENS ----------------------------- */
export const TOKENS = {
  font: {
    verdict: "'Spectral', Georgia, serif",   // verdict line only
    body: "'Montserrat', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, monospace", // all numbers
  },
  surface: {
    page: "#0d0e10",
    card: "#17191d",
    border: "#292c33",
    divider: "#23262b",
    segDim: "#2b2e35",
    trackBg: "#212429",
  },
  text: {
    sub: "#9a9fa8",
    evidence: "#b3b8c0",
    names: "#aeb3bb",
    muted: "#787d86",
    faint: "#6d727b",   // the "none recorded" register — MUST match on face and evidence view
    link: "#9aa0aa",
  },
  /** Verdict accent — the ONLY valenced colour on a card. One hex per state.
   *  Every accent-coloured element in a card uses its state's single hex:
   *  active gauge segment, active gauge zone label, eyebrow, verdict line,
   *  the "Request a correction" link. */
  verdict: {
    clear: "#63cda8",   // teal
    mixed: "#e2ab4d",   // amber
    dark: "#9298db",    // indigo — NEVER red, NEVER a warning colour
  },
  /** Tier identity — categorical, non-valenced, consistent everywhere.
   *  None is red. None is a party-coded primary. Watchdog is never the alarm. */
  tier: {
    govt: "#6d7f92",        // steel
    mainstream: "#a49889",  // taupe
    watchdog: "#8f9a6f",    // sage
  },
} as const;
/** Gauge zones — left→right. The active zone (by state) takes the accent colour;
 *  the other two stay muted. Position: clear=0, mixed=1, dark=2. */
export const GAUGE_ZONES = ["Broad", "Partial"] as const;
export const TIER_LABEL: Record<TierKey, string> = {
  govt: "Govt",                    // face bar label
  mainstream: "Mainstream",
  watchdog: "Watchdog",
};
export const TIER_LABEL_FULL: Record<TierKey, string> = {
  govt: "Government-aligned",      // evidence-view roster label
  mainstream: "Mainstream",
  watchdog: "Watchdog",
};
/* ------------------------- FROZEN VERDICT STRINGS ------------------------- */
/* Templated tokens in {braces} are filled with LIVE counts at render time.
 * They are counts, never percentages. See the build instruction. */
export const CARD_STRINGS: Record<VerdictState, {
  eyebrow: string;
  verdict: string;
  sub: string;
  evidenceLabel: string;
  evidenceText: string;   // {n}, {a}, {b} = live integer counts
  footerNote: string;     // {k} checks, {h} hours for dark
}> = {
  clear: {
    eyebrow: "Monitoring Spirit",
    verdict: "Covered widely, across outlet types",
    sub: "Reported widely and independently across government-aligned, mainstream and watchdog outlets.",
    evidenceLabel: "Widely covered",
    evidenceText: "Reported by {n} outlets across all three editorial tiers.",
    footerNote: "Coverage history still building",
  },
  mixed: {
    eyebrow: "Monitoring Spirit",
    verdict: "Widely carried — mostly the same report",
    sub: "Covered across outlet types, but most outlets ran the same report rather than reporting it independently.",
    evidenceLabel: "Same report",
    evidenceText: "{a} of {b} outlets ran the same wire copy rather than original reporting.",
    footerNote: "Coverage history still building",
  },
  dark: {
    eyebrow: "Monitoring Spirit",
    verdict: "Carried by watchdog outlets, not yet by others",
    sub: "Coverage so far sits with one editorial tier. Government-aligned and mainstream outlets have not reported it across the last several checks.",
    evidenceLabel: "Single tier",
    evidenceText: "Covered by {n} watchdog outlets. Not reported by government-aligned or mainstream outlets across {k} consecutive checks.",
    footerNote: "Tracked across {k} checks · past {h}h",
  },
};
export const EVIDENCE_STRINGS: Record<VerdictState, {
  sectionHeader: string;      // roster section header
  lead?: string;              // roster lead line ({n},{a},{b} live)
  timelineHeader: string;
  held: string;               // "how coverage held over time" summary line
  caveat: string;
}> = {
  clear: {
    sectionHeader: "Coverage by tier · tracked window",
    lead: "Reported by {n} outlets — spread across every tier, with original reporting in each.",
    timelineHeader: "How coverage held over time",
    held: "Reported across all three tiers at every check.",
    caveat: "Based on the outlets TraceNews tracks. Counts reflect coverage recorded in this window.",
  },
  mixed: {
    sectionHeader: "Reporting breakdown · tracked window",
    lead: "{a} of {b} outlets published near-identical copy rather than their own reporting.",
    timelineHeader: "How coverage held over time",
    held: "Carried across all three tiers at every check — the spread was wide; the reporting was not.",
    caveat: "Based on the outlets TraceNews tracks. “Same copy” means near-identical wording across outlets in this window.",
  },
  dark: {
    sectionHeader: "Coverage by tier · tracked window",
    timelineHeader: "How coverage held over time",
    held: "Coverage sat with one tier across all {k} checks — not a single breaking-news moment.",
    caveat: "Based on the outlets TraceNews tracks. A tier showing no coverage means none was recorded in this window — not that none exists elsewhere.",
  },
};
/* ------------------------- SHARED / UI STRINGS --------------------------- */
export const UI = {
  tap: "See which outlets covered this",
  tapOpen: "Hide breakdown",
  methodologyLink: "How we determine this →",
  correctionLink: "Request a correction",
  /** The zero-tier treatment. A tier with zero coverage NEVER renders a number,
   *  never "0", never "0%". On the FACE it renders this short label; in the
   *  EVIDENCE VIEW it renders the long label. Both in TOKENS.text.faint. */
  noneRecordedShort: "none recorded",
  noneRecordedLong: "None recorded in this window",
  rosterMetaMixed: "{orig} original · {copy} same copy",
  rosterMetaClearMixed: "{orig} original · {copy} wire copy",
  rosterMetaOriginal: "Original reporting",
  rosterMetaWire: "Wire copy",
  rosterNamesMixed: "{origNames} — original; {copyNames} — same copy",
  rosterNamesMore: "{names}, and {more} more",
  timelineNowLabel: "now",
  timelineAgoSuffix: "h ago",
} as const;
/* --------------------- WIRE-SERVICE ATTRIBUTION (DORMANT) ---------------- */
/**
 * Off by default. When enabled, the resolver MUST satisfy ALL FIVE conditions
 * (Bridge Chambers, Gate B addendum §5) or fall back to the neutral string:
 *   1. Documented public-record state/government ownership of the agency.
 *   2. The agency is NAMED. The abstract phrase "a government-owned wire
 *      service" is NOT approved. Use the named form below or fall back.
 *   3. Bare fact only — no inference of coordination / direction / "state hand".
 *   4. MIXED ONLY. Must be structurally incapable of composing onto a DARK card.
 *   5. Caveat present (as on every evidence view).
 * Default to NEUTRAL whenever any condition is in doubt.
 */
export const WIRE_ATTRIBUTION = {
  enabled: false,
  neutral: "{a} of {b} outlets ran the same wire copy rather than original reporting.",
  // {agency} must be a named, ownership-verified agency, e.g.
  // "the News Agency of Nigeria, a state-owned agency"
  attributedTemplate: "{a} of {b} outlets ran the same wire copy, originating from {agency}.",
} as const;
