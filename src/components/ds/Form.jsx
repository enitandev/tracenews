import React from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

export const Field = ({ label, hint, error, children, className = '' }) => (
  <div className={`field ${className}`}>
    {label && <label>{label}</label>}
    {children}
    {(hint || error) && (
      <div className={`hint ${error ? 'err' : ''}`}>
        {error || hint}
      </div>
    )}
  </div>
);

export const Input = ({ hasError, className = '', ...props }) => (
  <input className={`input ${hasError ? 'err' : ''} ${className}`} {...props} />
);

export const Textarea = ({ hasError, className = '', ...props }) => (
  <textarea className={`textarea ${hasError ? 'err' : ''} ${className}`} {...props} />
);

export const Select = ({ hasError, className = '', children, ...props }) => (
  <select className={`select ${hasError ? 'err' : ''} ${className}`} {...props}>
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
