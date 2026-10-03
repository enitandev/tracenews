import React from 'react';
import { Link } from 'react-router-dom';

// Every link here must point at a page that exists. Pages we do not have yet
// (privacy policy, terms, newsletter, apps) are left out rather than linked to "#".
const COLUMNS = [
  { title: 'Company', links: [['About', '/about'], ['Contact us', '/about#contact']] },
  { title: 'How it works', links: [['Methodology', '/methodology'], ['Request a correction', '/corrections']] },
  { title: 'Topics', links: [['Politics', '/topics/politics'], ['Economy', '/topics/economy'], ['Security', '/topics/security']] },
];
const linkStyle = { color: '#aaa', textDecoration: 'none', fontSize: '14px' };

export default function Footer() {
  return (
    <footer style={{ background: 'var(--header-util)', color: 'var(--header-util-text)', padding: '64px 20px 32px', fontFamily: 'Montserrat, sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '64px', justifyContent: 'space-between', paddingBottom: '64px', borderBottom: '1px solid #333' }}>
        
        <div style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ marginBottom: '16px' }}>
            <img src="/tracenews_white_logo.png" alt="TraceNews" style={{ height: '80px', marginLeft: '-12px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
            <div style={{ display: 'none', fontSize: '24px', fontWeight: 900, letterSpacing: '-0.05em', color: '#fff' }}>TRACENEWS</div>
          </div>
          <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6, maxWidth: '300px' }}>
            Empowering readers to break free from algorithms and echo chambers. See every side of every story.
          </p>
        </div>

        {COLUMNS.map(col => (
          <div key={col.title} style={{ flex: '1', minWidth: '150px' }}>
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '24px', fontWeight: 700 }}>{col.title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {col.links.map(([label, to]) => (
                <li key={to}><Link to={to} style={linkStyle}>{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      <div style={{ maxWidth: '1400px', margin: '32px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#888' }}>
        <div>&copy; 2026 TraceNews. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/methodology" style={{ color: '#888', textDecoration: 'none' }}>Methodology</Link>
          <Link to="/corrections" style={{ color: '#888', textDecoration: 'none' }}>Corrections</Link>
        </div>
      </div>
    </footer>
  );
}
