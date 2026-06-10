import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <header style={{ width: '100%', fontFamily: 'Montserrat, sans-serif' }}>
      {/* TIER 1: Promo Bar */}
      <div style={{ background: 'var(--header-promo)', padding: '12px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>See every side of every news story</span>
          <button style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
            Get Started
          </button>
        </div>
      </div>

      {/* TIER 2: Utility Bar */}
      <div style={{ background: 'var(--header-util)', padding: '8px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--header-util-text)', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ cursor: 'pointer' }}>Browser Extension</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ opacity: 0.7 }}>Theme:</span>
              <button onClick={() => toggleTheme('light')} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#fff' : 'var(--header-util-text)', opacity: theme === 'light' ? 1 : 0.6, cursor: 'pointer', fontWeight: theme === 'light' ? 600 : 400 }}>Light</button>
              <button onClick={() => toggleTheme('dark')} style={{ background: 'none', border: 'none', color: theme === 'dark' ? '#fff' : 'var(--header-util-text)', opacity: theme === 'dark' ? 1 : 0.6, cursor: 'pointer', fontWeight: theme === 'dark' ? 600 : 400 }}>Dark</button>
              <button style={{ background: 'none', border: 'none', color: 'var(--header-util-text)', opacity: 0.6, cursor: 'pointer' }}>Auto</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span>Saturday, June 6, 2026</span>
            <span style={{ cursor: 'pointer' }}>Set Location</span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>🌍 International Edition ⌄</span>
          </div>
        </div>
      </div>

      {/* TIER 3: Main Navbar */}
      <div style={{ background: 'var(--header-main)', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Menu size={24} color="var(--text-primary)" style={{ cursor: 'pointer' }} onClick={() => setIsSidebarOpen(true)} />
            <div style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ borderRight: '1px solid var(--border)', paddingRight: '12px', marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                 {theme === 'dark' ? (
                   <img src="/tracenews_white_logo.png" alt="TraceNews" style={{ height: '80px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                 ) : (
                   <img src="/tracenews_black_logo.png" alt="TraceNews" style={{ height: '80px' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                 )}
                 <span style={{ display: 'none' }}>TRACENEWS</span>
              </span>
            </div>
            
            <nav style={{ display: 'flex', gap: '20px', fontWeight: 600, fontSize: '15px' }}>
              <a href="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', borderBottom: '2px solid var(--text-primary)', paddingBottom: '4px' }}>Home</a>
              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>For You</a>
              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Local</a>
              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Monitoring Spirit</a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search" style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <button style={{ background: 'var(--text-primary)', color: 'var(--bg-base)', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Subscribe</button>
            <button style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Login</button>
          </div>

        </div>
      </div>

      {/* TIER 4: Ticker */}
      <div style={{ background: 'var(--header-ticker)', padding: '12px 20px', borderBottom: '1px solid var(--border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📈 Trending
          </span>
          {['Politics', 'Economy', 'Security', 'Entertainment', 'Sports', 'Technology', 'Health'].map(cat => (
            <button key={cat} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {cat} <span>+</span>
            </button>
          ))}
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </header>
  );
}
