import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { BriefingItem } from './DailyBriefingStory';

// Mirrors UI in tracenews-api app/briefingStrings.py.
const ui = {
  title: 'Daily Briefing',
  attribution_label: 'AI-generated summary of the sources',
  correction_link: 'Report an error in this summary',
  methodology_link: 'How TraceNews classifies outlets',
  coverage_heading: 'Outlets that reported this story',
  coverage_as_of: 'Counted at {time} WAT',
  tier_labels: { govt_aligned: 'Govt', mainstream: 'Mainstream', watchdog: 'Watchdog' },
  empty: "Today's briefing is not ready yet.",
};
const FORBIDDEN = ['bias', 'dramatic', 'side a', 'side b', 'sides', 'common ground', 'why it matters', '%', 'percent'];

const item = {
  id: 'i1', slug: 'senate-passes-bill', title: 'Senate passes bill',
  bullets: ['The Senate passed the bill on Thursday.', 'It now goes to the President.'],
  coverage_counts: { govt_aligned: 2, mainstream: 7, watchdog: 1 },
  counts_as_of: '2026-10-03T05:00:00Z',
};

const renderItem = (it = item) => render(<MemoryRouter><BriefingItem item={it} ui={ui} /></MemoryRouter>);

describe('BriefingItem (counsel B)', () => {
  it('shows the label, the summary, counts with as-of time and both links', () => {
    renderItem();
    expect(screen.getByText(ui.attribution_label)).toBeTruthy();
    expect(screen.getByText(item.bullets[0])).toBeTruthy();
    expect(screen.getByText(`${ui.coverage_heading}: 10`)).toBeTruthy();
    expect(screen.getByText('Counted at 3 Oct, 06:00 WAT')).toBeTruthy();
    expect(screen.getByText(ui.correction_link).getAttribute('href'))
      .toBe('/corrections?page=%2Fdaily-briefing%2Fsenate-passes-bill');
    expect(screen.getByText(ui.methodology_link).getAttribute('href')).toBe('/methodology#section-03');
  });

  it('renders counts, never percentages or forbidden words', () => {
    const { container } = renderItem();
    const text = container.textContent.toLowerCase();
    for (const tok of FORBIDDEN) expect(text).not.toContain(tok);
  });

  it('shows 0 for a tier with no outlets', () => {
    const { container } = renderItem({ ...item, coverage_counts: { mainstream: 5 } });
    expect(container.textContent).toContain('Govt 0');
    expect(container.textContent).toContain('Watchdog 0');
  });
});

describe('reviewer-only data (counsel review of 3 Oct samples, item 7)', () => {
  it('never renders "Named in the source articles", routing reasons or sources to readers', () => {
    const staffItem = {
      ...item,
      named_in_sources: ['Aliko Dangote'],
      reasons: ['political review lane: APC'],
      sources: [{ title: 'Source headline', summary: 'Source summary', url: 'https://example.com' }],
      source_headline: 'BREAKING: Senate passes bill',
    };
    const { container } = renderItem(staffItem);
    const text = container.textContent;
    expect(text).not.toContain('Named in the source articles');
    expect(text).not.toContain('Aliko Dangote');
    expect(text).not.toContain('political review lane');
    expect(text).not.toContain('Source summary');
    expect(text).not.toContain('BREAKING');
  });

  it('the coverage panel is counts only: no % and no "bias"', () => {
    const { container } = renderItem();
    const panel = container.textContent.slice(container.textContent.indexOf(ui.coverage_heading));
    expect(panel).not.toMatch(/%|bias/i);
    expect(panel).toMatch(/Govt\s*2/);
  });
});
