import React from 'react';

export const Display = ({ children, className = '', ...props }) => (
  <h1 className={`t-display ${className}`} {...props}>{children}</h1>
);

export const H1 = ({ children, className = '', ...props }) => (
  <h2 className={`t-h1 ${className}`} {...props}>{children}</h2>
);

export const H2 = ({ children, className = '', ...props }) => (
  <h3 className={`t-h2 ${className}`} {...props}>{children}</h3>
);

export const Body = ({ children, className = '', ...props }) => (
  <p className={`t-body ${className}`} {...props}>{children}</p>
);

export const Meta = ({ children, className = '', ...props }) => (
  <p className={`t-meta ${className}`} {...props}>{children}</p>
);

export const Label = ({ children, className = '', ...props }) => (
  <p className={`t-label ${className}`} {...props}>{children}</p>
);

export const Num = ({ children, className = '', ...props }) => (
  <span className={`t-num ${className}`} {...props}>{children}</span>
);

export const Quote = ({ children, className = '', ...props }) => (
  <span className={`t-quote ${className}`} {...props}>{children}</span>
);

export const Link = ({ children, className = '', href, ...props }) => (
  <a href={href} className={`tn-link ${className}`} {...props}>{children}</a>
);
