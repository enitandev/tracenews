import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './Toggle';

export const AppShell = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div data-theme={theme} style={{ background: 'var(--page)', minHeight: '100vh', color: 'var(--t-body)' }}>
      {children}
    </div>
  );
};

import Logo from '../Logo';

export const Masthead = ({ children, brandLink = "/" }) => (
  <header style={{
    background: 'var(--shell)',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--s5)',
    height: '56px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'var(--s5)' }}>
      <Link to={brandLink} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Logo height="66px" />
      </Link>
    </div>
    {children}
  </header>
);

export const ShellContainer = ({ children }) => (
  <div style={{
    display: 'flex',
    maxWidth: 'var(--w-page)',
    margin: '0 auto',
    minHeight: 'calc(100vh - 56px)'
  }}>
    {children}
  </div>
);

export const Rail = ({ children }) => (
  <aside style={{
    width: 'var(--w-rail)',
    flex: `0 0 var(--w-rail)`,
    borderRight: '1px solid var(--border)',
    padding: 'var(--s5) var(--s4)',
    background: 'var(--page)'
  }}>
    {children}
  </aside>
);

export const ContentArea = ({ children }) => (
  <main style={{
    flex: 1,
    padding: 'var(--s6) var(--s7) var(--s8)',
    minWidth: 0
  }}>
    {children}
  </main>
);
