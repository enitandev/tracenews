import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import CoverageBar from './CoverageBar';

export default function CompactStoryItem({ cluster }) {
  const hasAlerts = cluster.monitoring_flags?.length > 0;

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flexGrow: 1 }}>
          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
            {cluster.representative_title}
          </h4>
          <div style={{ marginTop: '12px' }}>
            <CoverageBar variant="compact" coverageStats={cluster.coverage_stats} />
          </div>
        </div>
        {hasAlerts && <AlertTriangle size={14} color="#8f9a6f" style={{ flexShrink: 0, marginTop: '2px' }} />}
      </div>
    </Link>
  );
}
