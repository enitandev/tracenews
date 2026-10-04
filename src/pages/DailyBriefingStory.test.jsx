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
  all_sources: 'View all sources',
  more_heading: "More from today's Briefing",
  coverage_as_of: 'Counted at {time} WAT',
  tier_labels: { govt_aligned: 'Govt', mainstream: 'Mainstream', watchdog: 'Watchdog' },
  sections: { what_happened: 'What happened', quotes: 'Who said what', next: 'What happens next', background: 'Background' },
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
    expect(screen.getAllByText(`${ui.coverage_heading}: 10`).length).toBeGreaterThan(0);
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
    const panel = container.querySelector('[data-testid="coverage-panel"]').textContent;
    expect(panel).toMatch(/Govt\s*0/);
    expect(panel).toMatch(/Watchdog\s*0/);
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
    const panel = container.querySelector('[data-testid="coverage-panel"]').textContent;
    expect(panel).not.toMatch(/%|bias/i);
    expect(panel).toMatch(/Govt\s*2/);
  });
});

describe('fuller sections (counsel ruling, 3 Oct 2026, item 6)', () => {
  const withSections = {
    ...item,
    sections: {
      quotes: [{ speaker: 'Godswill Akpabio', role: 'Senate President', quote: 'The bill will help the economy', line: 'Godswill Akpabio, Senate President, said: "The bill will help the economy"' }],
      next: ['The President is to sign the bill on Monday, the Senate said.'],
      background: [],
    },
  };

  it('renders What happened, Who said what and What happens next; hides empty sections', () => {
    renderItem(withSections);
    expect(screen.getByText('What happened')).toBeTruthy();
    expect(screen.getByText('Who said what')).toBeTruthy();
    expect(screen.getByText('Godswill Akpabio, Senate President, said: "The bill will help the economy"')).toBeTruthy();
    expect(screen.getByText('What happens next')).toBeTruthy();
    expect(screen.queryByText('Background')).toBeNull();
  });

  it('quotes use the verb "said" only, and no forbidden words appear', () => {
    const { container } = renderItem(withSections);
    const quoteText = container.querySelector('[data-testid="section-quotes"]').textContent;
    expect(quoteText).toMatch(/ said: /);
    const text = container.textContent.toLowerCase();
    for (const tok of ['bias', 'common ground', 'why it matters', 'sides']) expect(text).not.toContain(tok);
  });
});

describe('story page layout (owner, 4 Oct 2026)', () => {
  const more = [
    { slug: 'b', title: 'Second story', image_url: null, coverage_counts: { mainstream: 4 } },
    { slug: 'c', title: 'Third story', image_url: null, coverage_counts: { watchdog: 2 } },
  ];
  it('gives the story its full breakdown, a coverage panel, and cards to the rest of the Briefing', () => {
    const { container } = render(<MemoryRouter><BriefingItem item={item} ui={ui} more={more} /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(item.title);
    expect(container.querySelector('[data-testid="coverage-panel"]')).toBeTruthy();
    expect(screen.getByText('View all sources →').getAttribute('href')).toBe('/story/senate-passes-bill');
    expect(screen.getByText("More from today's Briefing")).toBeTruthy();
    expect(screen.getByText('Second story').closest('a').getAttribute('href')).toBe('/daily-briefing/b');
    expect(screen.getByText('Third story')).toBeTruthy();
  });
  it('has no "More" section when the story is the only one', () => {
    const { container } = render(<MemoryRouter><BriefingItem item={item} ui={ui} /></MemoryRouter>);
    expect(container.querySelector('[data-testid="briefing-more"]')).toBeNull();
  });
});
