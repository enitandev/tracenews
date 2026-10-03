import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import register from './register.json';

// Data that, when rendered, makes a claim about an outlet, tier or person.
const CLAIM_DATA = /outlet_coverage_tier|independence_score|government_alignment|s2_score|outlet_republishes|party_proximity|coverage_tier_distribution|getOutletTier|monitoring_spirit|verdict|promotional_alignment|geopolitical_lean|ownership_/;
const ROOT = join(__dirname, '..', '..');

function sourceFiles(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(jsx?|tsx?)$/.test(name) && !/\.test\./.test(name) ? [path] : [];
  });
}

describe('claim register (counsel, 3 Oct 2026)', () => {
  const files = [...sourceFiles(join(ROOT, 'src')), ...sourceFiles(join(ROOT, 'api'))]
    .map(f => relative(ROOT, f));

  it('lists every file that renders claim data', () => {
    const unregistered = files.filter(f => CLAIM_DATA.test(readFileSync(join(ROOT, f), 'utf8')) && !register.entries[f]);
    expect(unregistered, 'Add these to src/claims/register.json as NOT CLEARED until counsel has seen them').toEqual([]);
  });

  it('has no stale entries', () => {
    const missing = Object.keys(register.entries).filter(f => !existsSync(join(ROOT, f)));
    expect(missing).toEqual([]);
  });
});
