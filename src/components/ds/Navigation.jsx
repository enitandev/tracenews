import React from 'react';

export const Avatar = ({ initials, size = 'md', className = '' }) => (
  <span className={`avatar ${size === 'lg' ? 'lg' : ''} ${className}`}>
    {initials}
  </span>
);

export const OutletMark = ({ initials, className = '' }) => (
  <span className={`outlet-mark ${className}`}>{initials}</span>
);

export const Breadcrumb = ({ items, className = '' }) => (
  <div className={`crumb ${className}`}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        <span>{item}</span>
        {index < items.length - 1 && <span>&middot;</span>}
      </React.Fragment>
    ))}
  </div>
);

export const Tabs = ({ children, className = '' }) => (
  <div className={`tabs ${className}`}>{children}</div>
);

export const Tab = ({ label, count, active = false, onClick, className = '' }) => (
  <span className={`tab ${active ? 'on' : ''} ${className}`} onClick={onClick}>
    {label} {count !== undefined && <span className="n">{count}</span>}
  </span>
);

export const Pagination = ({ current, total, onPageChange, className = '' }) => {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className={`pager ${className}`}>
      <button 
        className="pg" 
        disabled={current === 1} 
        onClick={() => onPageChange(current - 1)}
      >&#8249;</button>
      
      {pages.map(p => (
        <button 
          key={p} 
          className={`pg ${p === current ? 'on' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      
      <button 
        className="pg" 
        disabled={current === total} 
        onClick={() => onPageChange(current + 1)}
      >&#8250;</button>
    </div>
  );
};

export const NavItem = ({ icon: Icon, label, count, active = false, onClick, className = '' }) => (
  <div className={`nav-item ${active ? 'on' : ''} ${className}`} onClick={onClick}>
    {Icon && <span className="ic"><Icon size={14} stroke={1.5} /></span>}
    {label}
    {count !== undefined && <span className="count"><span className="count">{count}</span></span>}
  </div>
);

export const SecHead = ({ title, subtitle, className = '' }) => (
  <div className={`sec-head ${className}`}>
    <span className="ttl">{title} {subtitle && <span>{subtitle}</span>}</span>
  </div>
);
