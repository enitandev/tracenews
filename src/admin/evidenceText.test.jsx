import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { evidenceText } from './evidenceText';
import DeskErrorBoundary from './DeskErrorBoundary';

describe('evidenceText', () => {
  it('turns the API evidence rows into text', () => {
    const rows = [
      { type: 'silence', label: 'The silence', detail: '4 of 6 Watchdog outlets have not reported this.' },
      { type: 'churnalism', label: 'Copy and paste', detail: '3 of 5 outlets ran the same report.' },
    ];
    expect(evidenceText(rows)).toBe('4 of 6 Watchdog outlets have not reported this. · 3 of 5 outlets ran the same report.');
    expect(evidenceText([{ type: 'silence' }])).toBe('silence');
  });
  it('keeps strings and falls back when empty', () => {
    expect(evidenceText('Plain text')).toBe('Plain text');
    expect(evidenceText([], 'Concentrated coverage')).toBe('Concentrated coverage');
    expect(evidenceText(null, 'x')).toBe('x');
  });
});

describe('DeskErrorBoundary', () => {
  it('shows the error instead of a blank page', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = () => { throw new Error('Objects are not valid as a React child'); };
    render(<DeskErrorBoundary resetKey="/admin"><Broken /></DeskErrorBoundary>);
    expect(screen.getByText('This Desk screen hit an error')).toBeTruthy();
    expect(screen.getByText('Objects are not valid as a React child')).toBeTruthy();
  });
});
