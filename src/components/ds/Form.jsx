import React from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

export const Field = ({ label, hint, error, children, className = '' }) => (
  <div className={`field ${className}`} style={{ marginBottom: '14px' }}>
    {label && <label style={{ fontSize: '11px', color: 'var(--t-sub)', fontWeight: 500, marginBottom: '5px' }}>{label}</label>}
    {children}
    {(hint || error) && (
      <div className={`hint ${error ? 'err' : ''}`}>
        {error || hint}
      </div>
    )}
  </div>
);

export const Input = ({ type = 'text', hasError, className = '', style = {}, ...props }) => (
  <input type={type} className={`input ${hasError ? 'err' : ''} ${className}`} style={{ borderRadius: '4px', ...style }} {...props} />
);

export const Textarea = ({ hasError, className = '', style = {}, ...props }) => (
  <textarea className={`textarea ${hasError ? 'err' : ''} ${className}`} style={{ borderRadius: '4px', ...style }} {...props} />
);

export const Select = ({ hasError, className = '', style = {}, children, ...props }) => (
  <select className={`select ${hasError ? 'err' : ''} ${className}`} style={{ borderRadius: '4px', ...style }} {...props}>
    {children}
  </select>
);

export const Search = ({ value, onChange, onClear, placeholder = 'Search...', className = '' }) => (
  <div className={`search ${className}`}>
    <span className="ic"><IconSearch size={14} stroke={1.5} /></span>
    <input 
      type="text" 
      className="input" 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
    />
    {value && (
      <span className="clr" onClick={onClear}>
        <IconX size={13} stroke={1.5} />
      </span>
    )}
  </div>
);
