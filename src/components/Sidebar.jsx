import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

const LINKS = [
  'Login', 'About TraceNews', 'Subscribe', 'Website Settings', 'Contact us', 
  'International Politics', 'Finance', 'Science & Tech', 'Offbeat', 'Local', 
  'Referral Code', 'International', 'Sports', 'Arts & Entertainment', 
  'Discover more topics', 'Product'
];

export default function Sidebar({ isOpen, onClose }) {
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
