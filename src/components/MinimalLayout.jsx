import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';

export default function MinimalLayout({ children }) {
  const { theme } = useTheme();
  
  return (
    <div data-theme={theme} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <main style={{ flexGrow: 1 }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%', padding: '0 20px' }}>
          
          <header style={{ paddingTop: '12vh', marginBottom: '16px', textAlign: 'left' }}>
            <Link to="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
              <Logo height="38px" />
            </Link>
          </header>
          
          <div style={{ width: '100%' }}>
            <div style={{ height: '2px', background: 'var(--ink, var(--t-primary))', width: '100%' }}></div>
            <div style={{ height: '2px' }}></div>
            <div style={{ height: '1px', background: 'var(--border)', width: '100%' }}></div>
          </div>
          
          <div style={{ marginTop: '28px', textAlign: 'left' }}>
            {children}
          </div>

        </div>
      </main>
    </div>
  );
}
