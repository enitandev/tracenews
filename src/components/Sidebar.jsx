import React, { useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const LINKS = [
  'Login', 'About TraceNews', 'Subscribe', 'Website Settings', 'Contact us', 
  'International Politics', 'Finance', 'Science & Tech', 'Offbeat', 'Local', 
  'Referral Code', 'International', 'Sports', 'Arts & Entertainment', 
  'Discover more topics', 'Product'
];

export default function Sidebar({ 
  isOpen, onClose, 
  searchQuery, setSearchQuery, 
  searchResults, setIsSearchOpen, isSearchOpen 
}) {
  const { theme, toggleTheme } = useTheme();

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Dark overlay backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 9998,
          backdropFilter: 'blur(2px)'
        }}
      />

      {/* Sidebar Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '320px',
          maxWidth: '85vw',
          backgroundColor: '#222222',
          color: '#ffffff',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Montserrat, sans-serif',
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #444' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Home</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: '1px solid #fff', 
              color: '#fff', 
              borderRadius: '4px',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile-only Search and Theme controls */}
        <div className="show-on-mobile" style={{ padding: '20px', borderBottom: '1px solid #444' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', fontSize: '14px' }}>
            <span style={{ opacity: 0.7 }}>Theme:</span>
            <button onClick={() => toggleTheme('light')} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#fff' : '#e0e0e0', opacity: theme === 'light' ? 1 : 0.6, cursor: 'pointer', fontWeight: theme === 'light' ? 600 : 400 }}>Light</button>
            <button onClick={() => toggleTheme('dark')} style={{ background: 'none', border: 'none', color: theme === 'dark' ? '#fff' : '#e0e0e0', opacity: theme === 'dark' ? 1 : 0.6, cursor: 'pointer', fontWeight: theme === 'dark' ? 600 : 400 }}>Dark</button>
            <button style={{ background: 'none', border: 'none', color: '#e0e0e0', opacity: 0.6, cursor: 'pointer' }}>Auto</button>
          </div>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search TraceNews..." 
              value={searchQuery || ''}
              onChange={(e) => {
                if (setSearchQuery) setSearchQuery(e.target.value);
                if (setIsSearchOpen) setIsSearchOpen(true);
              }}
              onFocus={() => { if (setIsSearchOpen) setIsSearchOpen(true); }}
              style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: '#fff', outline: 'none', fontSize: '14px' }} 
            />
            {isSearchOpen && searchResults && searchResults.length > 0 && searchQuery && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: '#222', border: '1px solid #444', borderRadius: '6px', zIndex: 100, maxHeight: '300px', overflowY: 'auto', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                {searchResults.map(c => (
                  <Link 
                    key={c.id} 
                    to={`/story/${c.slug}`} 
                    onClick={() => {
                      if (setIsSearchOpen) setIsSearchOpen(false);
                      onClose();
                    }}
                    style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid #333', textDecoration: 'none', color: '#fff', textAlign: 'left' }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', lineHeight: 1.3 }}>{c.representative_title}</div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>{c.outlet_count} sources • {c.category || 'General'}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <nav style={{ padding: '12px 0', display: 'flex', flexDirection: 'column' }}>
          {LINKS.map((link, idx) => (
            <Link 
              key={idx} 
              to="#" 
              onClick={onClose}
              style={{
                padding: '16px 20px',
                color: '#e0e0e0',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #333',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {link}
              <span style={{ fontSize: '18px', color: '#888' }}>›</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
