import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';

export default function MinimalLayout({ children }) {
  const { theme } = useTheme();
  
  return (
    <div data-theme={theme} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Masthead band */}
      <header style={{ width: '100%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 20px 8px 20px' }}>
          <Link to="/" style={{ display: 'inline-block' }}>
            <Logo height="32px" />
          </Link>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ height: '2px', background: 'var(--ink, var(--t-primary))', width: '100%' }}></div>
          <div style={{ height: '2px' }}></div>
          <div style={{ height: '1px', background: 'var(--border)', width: '100%' }}></div>
        </div>
      </header>

      {/* Card container */}
      <main style={{ flexGrow: 1, position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: '15vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '360px',
          background: 'var(--card, var(--bg-surface))',
          border: '1px solid var(--border)',
          borderRadius: '3px',
          padding: '26px 20px',
          textAlign: 'left'
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}
