import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import CoverageBar, { getDominantTier } from './CoverageBar';
import MonitoringSignals from './MonitoringSignals';
import { COVERAGE_TIER_COLORS } from '../utils/helpers';

export default function HeroStoryCard({ cluster }) {
  const stats = cluster.coverage_stats || {};
  const [imgError, setImgError] = useState(false);
  const domTier = getDominantTier(stats.coverage_tier_distribution);
  const borderColor = COVERAGE_TIER_COLORS[domTier] || 'var(--border)';
  const hasAlerts = cluster.monitoring_flags?.length > 0;

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '24px' }}>
      <div style={{ width: '100%', height: '340px', position: 'relative', background: 'var(--bg-hover)', overflow: 'hidden' }}>
        {cluster.image_url && !imgError && (
           <img src={cluster.image_url} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="hero" />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)' }}></div>
        
        {hasAlerts && (
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-surface)', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', zIndex: 10 }}>
            <AlertTriangle size={20} color="#8f9a6f" />
          </div>
        )}

        <h2 style={{ position: 'absolute', bottom: '36px', left: '20px', right: '20px', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '28px', lineHeight: 1.2, margin: 0, paddingBottom: '16px' }}>
          {cluster.representative_title}
        </h2>
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <CoverageBar variant="hero" coverageStats={stats} />
        </div>
      </div>
      <MonitoringSignals
        coverageStats={cluster.coverage_stats}
        stories={null}
        compact={false}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {cluster.category || 'General'} • {cluster.outlet_count} sources
        </div>
      </div>
    </Link>
  );
}
