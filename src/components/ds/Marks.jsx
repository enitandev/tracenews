import React from 'react';

export const Pill = ({ variant = 'neutral', children, className = '' }) => (
  <span className={`pill pill-${variant} ${className}`}>{children}</span>
);

export const Tag = ({ variant = 'outline', children, className = '', onClick }) => (
  <span 
    className={`tag tag-${variant} ${className}`} 
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : {}}
  >
    {children}
  </span>
);

export const Count = ({ count, att = false, className = '' }) => (
  <span className={`count ${att ? 'att' : ''} ${className}`}>{count}</span>
);

export const Dot = ({ variant = 'none', className = '' }) => (
  <i className={`dot d-${variant} ${className}`}></i>
);

export const TierBar = ({ govt = 0, main = 0, watch = 0, total = 0, className = '' }) => {
  if (total === 0) {
    return (
      <div className={`tierbar ${className}`}>
        <i className="ghost" style={{ width: '100%' }}></i>
      </div>
    );
  }
  return (
    <div className={`tierbar ${className}`}>
      {govt > 0 && <i style={{ width: `${(govt / total) * 100}%`, background: 'var(--tier-govt)' }}></i>}
      {main > 0 && <i style={{ width: `${(main / total) * 100}%`, background: 'var(--tier-main)' }}></i>}
      {watch > 0 && <i style={{ width: `${(watch / total) * 100}%`, background: 'var(--tier-watch)' }}></i>}
    </div>
  );
};

export const TierLabels = ({ govt = 0, main = 0, watch = 0, className = '' }) => {
  const total = govt + main + watch;
  if (total === 0) {
    return (
      <div className={`tierlabels ${className}`}>
        <span><Dot variant="govt" />Govt<span className="none">none recorded</span></span>
        <span><Dot variant="main" />Main<span className="none">none recorded</span></span>
        <span><Dot variant="watch" />Watch<span className="none">none recorded</span></span>
      </div>
    );
  }
  return (
    <div className={`tierlabels ${className}`}>
      <span><Dot variant="govt" />Govt<b>{govt}</b></span>
      <span><Dot variant="main" />Main<b>{main}</b></span>
      <span><Dot variant="watch" />Watch<b>{watch}</b></span>
    </div>
  );
};

// Reusable Tier Grid for Outlet Profiling
export const TierDistributionGrid = ({ govtOutlets = [], mainOutlets = [], watchOutlets = [], className = '' }) => (
  <div className={`tdgrid ${className}`}>
    <div className="tdcol">
      <div className="h" style={{ color: 'var(--tier-govt)' }}>Govt</div>
      <div className="marks">
        {govtOutlets.map((o, i) => <span key={i} className="outlet-mark">{o}</span>)}
      </div>
    </div>
    <div className="tdcol">
      <div className="h" style={{ color: 'var(--tier-main)' }}>Main</div>
      <div className="marks">
        {mainOutlets.map((o, i) => <span key={i} className="outlet-mark">{o}</span>)}
      </div>
    </div>
    <div className="tdcol">
      <div className="h" style={{ color: 'var(--tier-watch)' }}>Watch</div>
      <div className="marks">
        {watchOutlets.map((o, i) => <span key={i} className="outlet-mark">{o}</span>)}
      </div>
    </div>
  </div>
);

// Generic dot+label component to replace G/M/W initials under story cards
export const TierDotLabel = ({ variant, count, label }) => (
  <span><Dot variant={variant} />{label && `${label} `}<b>{count}</b></span>
);
