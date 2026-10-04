import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { parseBlocks } from './parseBlocks';

// Counsel, 4 Oct 2026: no [[...]] marker may reach the published page, and
// the Google sign-in passages stay out until Google sign-in is live.
const docs = ['privacy-policy-v1.0.md', 'terms-of-use-v1.0.md'].map(f => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8'));

describe('published legal pages', () => {
  it('carry no publishing markers or notes', () => {
    for (const d of docs) {
      expect(d).not.toMatch(/\[\[|\]\]/);
      expect(d).not.toMatch(/Publishing note/);
      expect(d).toMatch(/Version 1\.0 · Effective 4 October 2026/);
    }
  });
  it('do not mention Google sign-in', () => {
    for (const d of docs) expect(d).not.toMatch(/Google/);
  });
  it('render the privacy tables', () => {
    const tables = parseBlocks(docs[0]).filter(b => b.type === 'table');
    expect(tables.map(t => t.head[0])).toEqual(['What', 'Provider']);
    expect(tables[0].rows).toHaveLength(4);
  });
});
