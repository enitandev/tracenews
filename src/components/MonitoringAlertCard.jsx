import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEVERITY_COLORS } from '../utils/helpers';

export default function MonitoringAlertCard({ cluster }) {
  const flags = cluster.monitoring_flags || [];
  const primaryFlag = flags[0] || { type: 'CLEAN', severity: 'low', message: 'No anomalies detected.' };
  const alertColor = primaryFlag.type === 'CLEAN' ? 'var(--border)' : (SEVERITY_COLORS[primaryFlag.severity] || '#e5e5e5');
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        border: `2px solid ${alertColor}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ width: '100%', height: '180px', background: 'var(--bg-hover)', position: 'relative' }}>
          {cluster.image_url && !imgError ? (
            <img 
              src={cluster.image_url} 
              alt={cluster.representative_title}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--text-muted)' }}>TraceNews</div>
          )}
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              background: alertColor,
              color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap'
            }}>
              {primaryFlag.type.replace('_', ' ')}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '11px', color: 'var(--text-muted)' }}>{cluster.outlet_count} sources</span>
          </div>
          <div style={{ fontFamily: '"Merriweather", serif', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '12px' }}>
            {cluster.representative_title}
          </div>
          {primaryFlag.type !== 'CLEAN' && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 'auto', background: 'var(--bg-hover)', padding: '8px', borderRadius: '4px', borderLeft: `3px solid ${alertColor}` }}>
              {primaryFlag.message}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
