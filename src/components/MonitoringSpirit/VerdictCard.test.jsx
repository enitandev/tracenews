import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import VerdictCard from './VerdictCard';
import { DARK_ENABLED } from './verdictGate';
import { WIRE_ATTRIBUTION, UI } from './monitoringSpiritStrings';

const hoursAgo = (h) => new Date(Date.now() - 3600000 * h).toISOString();

let nextId = 0;
const story = (tier, republishes, name) => {
  nextId++;
  return {
    id: `story-${nextId}`,
    outlet_id: `outlet-${nextId}`,
    outlet_name: name || `Outlet ${nextId}`,
    outlet_coverage_tier: tier,
    outlet_republishes: republishes,
    // Score band consistent with the backend's is_republisher.
    outlet_s2_score: republishes === true ? 20 : republishes === false ? 80 : null,
  };
};

// 2 govt, 2 mainstream, 2 watchdog — all original reporting.
const broadStories = () => [
  story('govt_aligned', false), story('govt_aligned', false),
  story('mainstream', false), story('mainstream', false),
  story('watchdog', false), story('watchdog', false),
];

const churnalismEvidence = [{ type: 'churnalism', label: 'Same report', detail: '' }];

describe('VerdictCard Invariants', () => {
  afterEach(() => vi.restoreAllMocks());

  // I7: Stale imbalances (Enforced on backend by has_persistence)
  // A verdict CANNOT render (or resolve to MIXED/DARK) if the tier
  // imbalance is absent from the most recent snapshot read. This ensures
  // the approved present-tense language ("not yet reported") is literally
  // true at render time. Tested in backend: test_invariant_7_stale_imbalance_fails.

  // I1: Withhold rather than display stale data
  it('I1: renders nothing when live verdict data is missing or computation fails', () => {
    const { container } = render(<VerdictCard verdictData={{}} clusterStories={[]} />);
    expect(container.firstChild).toBeNull();

    const { container: container2 } = render(<VerdictCard verdictData={null} clusterStories={[]} />);
    expect(container2.firstChild).toBeNull();
  });

  // I2: No percentages on the face
  it('I2: does not render percentage characters on the face', () => {
    render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={broadStories()} />);

    const card = screen.getByTestId('monitoring-spirit-card');
    const cleanHtml = card.innerHTML.replace(/<style[^>]*>.*?<\/style>/is, '').replace(/style="[^"]*"/g, '');
    expect(cleanHtml).not.toMatch(/%/);
  });

  // Regression: backend sends canonical 'govt_aligned'; it must be counted.
  it('counts govt_aligned outlets under the Govt tier', () => {
    render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={broadStories()} />);
    expect(screen.getAllByTestId(/track-bar-/)).toHaveLength(3);
    expect(screen.queryAllByTestId(/track-ghost-/)).toHaveLength(0);
    expect(screen.getByText('Govt')).toBeDefined();
  });

  it('counts distinct outlets, not article rows', () => {
    const stories = broadStories();
    // Same outlet publishing three more articles must not inflate counts.
    const dup = stories[0];
    stories.push({ ...dup, id: 'dup-1' }, { ...dup, id: 'dup-2' }, { ...dup, id: 'dup-3' });
    render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={stories} />);
    expect(screen.getByTestId('monitoring-spirit-card').textContent).toContain('Reported by 6 outlets');
  });

  it('excludes an unrecognised tier with an error instead of absorbing it', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const stories = [...broadStories(), story('pro_establishment', false)];
    render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={stories} />);
    expect(screen.getByTestId('monitoring-spirit-card').textContent).toContain('Reported by 6 outlets');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('unrecognised outlet_coverage_tier'), expect.anything());
  });

  // I3: Zero tier -> hatched ghost, never "0". A zero tier can no longer
  // reach a CLEAR or MIXED face (both claim all three tiers), so it is
  // exercised through a past check in the timeline.
  it('I3: a zero tier in a past check renders ghost + none mark, never 0, and drops the "every check" line', () => {
    const mockData = {
      verdict: 'clear',
      snapshots: [
        { snapshot_at: hoursAgo(24), coverage_tier_distribution: { govt_aligned: 0, mainstream: 4, watchdog: 3 } },
        { snapshot_at: hoursAgo(0), coverage_tier_distribution: { govt_aligned: 2, mainstream: 5, watchdog: 4 } }
      ]
    };
    render(<VerdictCard verdictData={mockData} clusterStories={broadStories()} />);
    fireEvent.click(screen.getByText(UI.tap));
    const rows = screen.getAllByTestId('timeline-row');
    expect(rows[1].querySelectorAll('.vc-ghost')).toHaveLength(1);
    expect(rows[1].textContent).toContain(`${UI.timelineNoneMark}·4·3`);
    expect(rows[1].textContent).not.toMatch(/\b0\b/);
    expect(screen.queryByText('Reported across all three tiers at every check.')).toBeNull();
  });

  it('withholds MIXED when a tier has no coverage', () => {
    const stories = [
      story('mainstream', true), story('mainstream', true), story('mainstream', false),
      story('watchdog', true), story('watchdog', true),
    ];
    const { container } = render(<VerdictCard verdictData={{ verdict: 'mixed', evidence: churnalismEvidence, snapshots: [] }} clusterStories={stories} />);
    expect(container.firstChild).toBeNull();
  });

  // I4: Wire attribution only for mixed (structural scoping)
  it('I4: structurally cannot attach wire attribution to a dark card', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    WIRE_ATTRIBUTION.enabled = true;
    const { container } = render(<VerdictCard verdictData={{ verdict: 'dark', snapshots: [] }} clusterStories={[]} />);
    expect(container.textContent).not.toMatch(/originating from/i);
    WIRE_ATTRIBUTION.enabled = false;
  });

  // I6: Tap opens FULL evidence view with timeline over multiple reads
  it('I6: tap opens full evidence view, displaying timeline with all N available reads', () => {
    const mockData = {
      verdict: 'clear',
      snapshots: [
        { snapshot_at: hoursAgo(36), coverage_tier_distribution: { govt_aligned: 2, mainstream: 4, watchdog: 3 } },
        { snapshot_at: hoursAgo(0), coverage_tier_distribution: { govt_aligned: 4, mainstream: 8, watchdog: 6 } }
      ]
    };
    render(<VerdictCard verdictData={mockData} clusterStories={broadStories()} />);

    expect(screen.queryByText('Coverage by tier · tracked window')).toBeNull();

    fireEvent.click(screen.getByText(UI.tap));

    expect(screen.getByText('Coverage by tier · tracked window')).toBeDefined();
    expect(screen.getByText('How coverage held over time')).toBeDefined();

    // Newest first, each labelled by its actual age
    const rows = screen.getAllByTestId('timeline-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('now');
    expect(rows[0].textContent).toContain('4·8·6');
    expect(rows[1].textContent).toContain('36h ago');
    expect(rows[1].textContent).toContain('2·4·3');
  });

  it('timeline skips snapshots with unknown counts rather than drawing them as zero', () => {
    const mockData = {
      verdict: 'clear',
      snapshots: [
        { snapshot_at: hoursAgo(24), coverage_tier_distribution: { govt_aligned: 1, mainstream: 4, watchdog: 3 } },
        { snapshot_at: hoursAgo(12), coverage_tier_distribution: null },
        { snapshot_at: hoursAgo(6), coverage_tier_distribution: { mainstream: 4 } },
        { snapshot_at: hoursAgo(0), coverage_tier_distribution: { govt_aligned: 2, mainstream: 5, watchdog: 4 } }
      ]
    };
    render(<VerdictCard verdictData={mockData} clusterStories={broadStories()} />);
    fireEvent.click(screen.getByText(UI.tap));
    expect(screen.getAllByTestId('timeline-row')).toHaveLength(2);
    expect(screen.getByText('Reported across all three tiers at every check.')).toBeDefined();
  });

  // I8: DARK never renders — not even as a calm fallback
  it('I8: DARK renders nothing while DARK_ENABLED is false', () => {
    expect(DARK_ENABLED).toBe(false);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockData = { verdict: 'dark', evidence: [{ type: 'silence' }], snapshots: [] };
    const stories = [story('watchdog', false), story('watchdog', false), story('watchdog', false)];
    const { container } = render(<VerdictCard verdictData={mockData} clusterStories={stories} />);

    expect(container.firstChild).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('VerdictCard received DARK'));
  });

  it('renders nothing for a backend-withheld verdict', () => {
    const mockData = { verdict: 'clear', evidence: null, note: 'withheld_pending_story_type_classification' };
    const { container } = render(<VerdictCard verdictData={mockData} clusterStories={broadStories()} />);
    expect(container.firstChild).toBeNull();
  });

  it('withholds CLEAR when its "all three tiers" claim would be false', () => {
    const stories = [story('mainstream', false), story('mainstream', false), story('watchdog', false), story('watchdog', false), story('watchdog', false)];
    const { container } = render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={stories} />);
    expect(container.firstChild).toBeNull();
  });

  it('withholds CLEAR when a tier has no original reporting', () => {
    const stories = [story('govt_aligned', true), story('govt_aligned', null), ...broadStories().slice(2)];
    const { container } = render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={stories} />);
    expect(container.firstChild).toBeNull();
  });

  it('withholds CLEAR below five outlets', () => {
    const stories = [story('govt_aligned', false), story('mainstream', false), story('watchdog', false)];
    const { container } = render(<VerdictCard verdictData={{ verdict: 'clear', snapshots: [] }} clusterStories={stories} />);
    expect(container.firstChild).toBeNull();
  });

  it('withholds a silence-route MIXED, whose copy would describe churnalism', () => {
    const stories = [story('watchdog', true), story('watchdog', true), story('mainstream', false)];
    const mockData = { verdict: 'mixed', evidence: [{ type: 'silence' }], snapshots: [] };
    const { container } = render(<VerdictCard verdictData={mockData} clusterStories={stories} />);
    expect(container.firstChild).toBeNull();
  });

  it('MIXED counts same copy only over outlets with a known status, and never names unknowns as copy', () => {
    const stories = [
      story('govt_aligned', true, 'CopyA'), story('mainstream', true, 'CopyB'),
      story('mainstream', false, 'OrigC'), story('watchdog', null, 'UnknownD'),
      { ...story('watchdog', null, 'BorderlineE'), outlet_s2_score: 45 },
    ];
    render(<VerdictCard verdictData={{ verdict: 'mixed', evidence: churnalismEvidence, snapshots: [] }} clusterStories={stories} />);
    expect(screen.getByTestId('monitoring-spirit-card').textContent).toContain('2 of 4 outlets ran the same wire copy');

    fireEvent.click(screen.getByText(UI.tap));
    const text = screen.getByTestId('monitoring-spirit-card').textContent;
    expect(text).toContain('OrigC — original; CopyB — same copy');
    expect(text).toContain('UnknownD, BorderlineE');
    expect(text).not.toMatch(/(UnknownD|BorderlineE) — same copy/);
    expect(text).not.toContain('0 original · 0 same copy');
  });
});
