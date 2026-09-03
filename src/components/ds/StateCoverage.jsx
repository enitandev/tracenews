import React from 'react';

export function StateCoverage({ loading, error, isEmpty, emptyMessage, onRetry, children }) {
  if (error) {
    return (
      <div style={{ padding: 'var(--s4) 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--s3)' }}>
        <p className="t-body" style={{ margin: 0, fontSize: '13px' }}>Failed to fetch.</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--t-primary)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 'var(--s4) 0', opacity: 0.5 }}>
        <div style={{ height: '14px', background: 'var(--border)', width: '60%', marginBottom: 'var(--s2)', borderRadius: '2px' }}></div>
        <div style={{ height: '12px', background: 'var(--raised)', width: '40%', borderRadius: '2px' }}></div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div style={{ padding: 'var(--s4) 0' }}>
        <p className="t-muted" style={{ margin: 0, fontSize: '13px' }}>{emptyMessage || "No data yet."}</p>
      </div>
    );
  }

  return children;
}
