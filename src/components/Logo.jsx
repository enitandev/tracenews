import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Logo({ height = '80px' }) {
  const { theme } = useTheme();
  
  return (
    <>
      {theme === 'dark' ? (
        <img src="/tracenews_white_logo.png" alt="TraceNews" style={{ height }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
      ) : (
        <img src="/tracenews_black_logo.png" alt="TraceNews" style={{ height }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
      )}
      <span style={{ display: 'none' }}>TRACENEWS</span>
    </>
  );
}
