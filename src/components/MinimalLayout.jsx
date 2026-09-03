import { Link } from 'react-router-dom';
import Logo from './Logo';
import { useTheme } from '../contexts/ThemeContext';

export default function MinimalLayout({ children }) {
  const { theme } = useTheme();
  
  return (
    <div data-theme={theme} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <main style={{ flexGrow: 1 }}>
        <div style={{ maxWidth: '420px', margin: '0 auto', width: '100%', paddingLeft: '20px', paddingRight: '20px', paddingTop: '12vh', boxSizing: 'border-box' }}>
          
          <Link to="/" style={{ display: 'inline-block', textDecoration: 'none', marginBottom: '14px' }}>
            <Logo height="56px" />
          </Link>
          
          <div style={{ height: '2px', background: 'var(--ink, var(--t-primary))' }}></div>
          <div style={{ height: '2px' }}></div>
          <div style={{ height: '1px', background: 'var(--border)' }}></div>
          
          <div style={{ marginTop: '28px' }}>
            {children}
          </div>

        </div>
      </main>
    </div>
  );
}
