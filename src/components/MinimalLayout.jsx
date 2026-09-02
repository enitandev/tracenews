import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function MinimalLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <header style={{ padding: '32px', textAlign: 'center' }}>
        <Link to="/" style={{ display: 'inline-block' }}>
          <Logo height="48px" />
        </Link>
      </header>
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
    </div>
  );
}
