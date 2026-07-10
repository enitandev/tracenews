import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import CoverageBar from './CoverageBar';
import MonitoringSignals from './MonitoringSignals';

export default function StandardStoryItem({ cluster }) {
  const [imgError, setImgError] = useState(false);
  const hasAlerts = cluster.monitoring_flags?.length > 0;

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{cluster.category || 'General'} • {cluster.outlet_count} sources</span>
            {hasAlerts && <AlertTriangle size={12} color="#8f9a6f" />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px 0', lineHeight: 1.3 }}>
            {cluster.representative_title}
          </h3>
          <div style={{ marginTop: '0px' }}>
            <CoverageBar variant="compact" coverageStats={cluster.coverage_stats} />
            <MonitoringSignals
              coverageStats={cluster.coverage_stats}
              stories={null}
              compact={true}
            />
          </div>
        </div>
        {cluster.image_url && !imgError && (
          <div style={{ width: '120px', height: '90px', flexShrink: 0, background: 'var(--bg-hover)' }}>
            <img src={cluster.image_url} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
          </div>
        )}
      </div>
    </Link>
  );
}
