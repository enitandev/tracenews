import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, ghost, danger, link
  size = 'md', // sm, md
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  let baseClass = 'btn';
  if (variant === 'link') {
    baseClass = 'btn-link';
  } else {
    baseClass = `btn btn-${variant}`;
  }
  
  if (size === 'sm') {
    baseClass += ' btn-sm';
  }
  
  return (
    <button
      className={`${baseClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spin"></span>}
      {children}
    </button>
  );
};
