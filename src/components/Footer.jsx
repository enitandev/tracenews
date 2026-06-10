import React from 'react';

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

        <div style={{ flex: '1', minWidth: '150px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '24px', fontWeight: 700 }}>Company</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>About</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Careers</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Our Mission</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Contact Us</a></li>
          </ul>
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '24px', fontWeight: 700 }}>Help</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>FAQ</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Methodology</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Bias Categories</a></li>
          </ul>
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '24px', fontWeight: 700 }}>Tools</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Browser Extension</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Mobile App</a></li>
            <li><a href="#" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px' }}>Newsletter</a></li>
          </ul>
        </div>

      </div>

      <div style={{ maxWidth: '1400px', margin: '32px auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#888' }}>
        <div>&copy; 2026 TraceNews. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
