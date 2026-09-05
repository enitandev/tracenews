import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo, COVERAGE_TIER_COLORS } from '../utils/helpers';

export default function CoverageBreadthCard({ cluster }) {
  if (!cluster) return null;

  const dist = cluster.coverage_stats?.coverage_tier_distribution || {};
  const g = dist.govt_aligned || 0;
  const m = dist.mainstream || 0;
  const w = dist.watchdog || 0;
  const scoredOutlets = g + m + w;
  const totalOutlets = cluster.outlet_count || scoredOutlets;

  // Build breadth text string
  const parts = [];
  if (m > 0) parts.push(`${m} mainstream`);
  if (g > 0) parts.push(`${g} government-aligned`);
  if (w > 0) parts.push(`${w} watchdog`);
  
  const breadthText = parts.length > 0 
    ? `Carried by ${scoredOutlets} outlets — ${parts.join(', ')}`
    : `Carried by ${totalOutlets} outlets`;

  return (
    <Link 
      to={`/story/${cluster.slug || cluster.id}`} 
      style={{ 
        display: 'block', 
        textDecoration: 'none', 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border)', 
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '16px',
        transition: 'border-color 0.2s ease',
      }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-bright)'}
      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {cluster.image_url && (
        <div style={{ width: '100%', height: '140px', overflow: 'hidden' }}>
          <img 
            src={cluster.image_url} 
            alt="" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </div>
      )}
      
      <div style={{ padding: '16px' }}>
        <h3 style={{ 
          fontFamily: 'var(--font-body)', 
          fontWeight: 700, 
          fontSize: '16px', 
          lineHeight: 1.4,
          color: 'var(--text-primary)', 
          margin: '0 0 12px 0' 
        }}>
          {cluster.representative_title}
        </h3>
        
        <p style={{ 
          fontSize: '13px', 
          color: 'var(--text-secondary)', 
          margin: '0 0 12px 0',
          lineHeight: 1.4
        }}>
          {breadthText}
        </p>
        
        {scoredOutlets > 0 && (
          <div style={{ width: '100%', height: '6px', display: 'flex', borderRadius: '3px', overflow: 'hidden' }}>
            {g > 0 && <div style={{ width: `${(g/scoredOutlets)*100}%`, background: COVERAGE_TIER_COLORS['govt_aligned'] }} />}
            {m > 0 && <div style={{ width: `${(m/scoredOutlets)*100}%`, background: COVERAGE_TIER_COLORS['mainstream'] }} />}
            {w > 0 && <div style={{ width: `${(w/scoredOutlets)*100}%`, background: COVERAGE_TIER_COLORS['watchdog'] }} />}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
          {cluster.first_seen_at && <span>{formatTimeAgo(cluster.first_seen_at)}</span>}
        </div>
      </div>
    </Link>
  );
}
