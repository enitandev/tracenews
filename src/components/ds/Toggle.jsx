import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const Switch = ({ checked, onChange, label, className = '' }) => (
  <span className={`switch ${checked ? 'on' : ''} ${className}`} onClick={() => onChange(!checked)}>
    <span className="track"><span className="knob"></span></span>
    {label && <span className="lbl">{label}</span>}
  </span>
);

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button className={`theme-tgl ${className}`} onClick={toggleTheme}>
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
};
