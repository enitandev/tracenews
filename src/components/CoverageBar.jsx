import React, { useState } from 'react';
import { TIERS, TIER_COLORS as COVERAGE_TIER_COLORS, TIER_LABELS, TIER_KEYS } from '../utils/constants';

const LEGACY_MAP = {
  'captured': 'govt_aligned',
  'deferential': 'mainstream',
  'independent': 'watchdog'
};

export function getDominantTier(dist) {
  let max = -1;
  let dominant = 'unscored';
  for (const [k, v] of Object.entries(dist || {})) {
    const mappedK = LEGACY_MAP[k] || k;
    if (v > max) { max = v; dominant = mappedK; }
  }
  return dominant;
}

export default function CoverageBar({ coverageStats, variant = 'compact', liveTotal }) {
  const isHero = variant === 'hero';

  const rawDist = coverageStats?.coverage_tier_distribution || {};
  let total = liveTotal !== undefined ? liveTotal : (coverageStats?.total_coverage || 0);
  
  // Map legacy keys to new keys safely
  const dist = {};
  for (const [k, v] of Object.entries(rawDist)) {
    const mappedKey = LEGACY_MAP[k] || k;
    dist[mappedKey] = (dist[mappedKey] || 0) + v;
  }
  
  if (!liveTotal && total === 0) {
      total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  }
  
  const dominant = getDominantTier(dist);
  const tiers = TIER_KEYS;
  const isUnscored = Object.values(dist).every(v => v === 0);

  const [hoveredTier, setHoveredTier] = useState(null);

  if (isHero) {
      const height = '28px';
      const fontSize = '12px';
      
      if (isUnscored) {
        return (
          <div style={{ width: '100%', height, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Unscored</span>
          </div>
        );
      }

      // Filter to find actual displayed tiers so we can skip right border on the last one
      const displayedTiers = tiers.filter(tier => (dist[tier] || 0) > 0);

      return (
        <div style={{ width: '100%', height, display: 'flex', overflow: 'hidden', background: 'transparent' }}>
          {displayedTiers.map((tier, index) => {
            const count = dist[tier] || 0;
            const percentage = (count / total) * 100;
            const labelText = `${TIER_LABELS[tier]} ${Math.round(percentage)}%`;
            const isLast = index === displayedTiers.length - 1;
            const showAbbrev = percentage >= 15;
            // using imported TIER_LABELS
            
            return (
              <div 
                key={tier} 
                onMouseEnter={() => setHoveredTier(tier)}
                onMouseLeave={() => setHoveredTier(null)}
                style={{ 
                  width: `${percentage}%`, 
                  height: '100%', 
                  background: COVERAGE_TIER_COLORS[tier],
                  borderRight: isLast ? 'none' : '2px solid var(--bg-surface)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }} 
              >
                {showAbbrev && (
                  <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, pointerEvents: 'none', textAlign: 'center' }}>
                    {TIER_LABELS[tier]} {Math.round(percentage)}%
                  </span>
                )}
                {hoveredTier === tier && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 20
                  }}>
                    {labelText}
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      borderWidth: '4px',
                      borderStyle: 'solid',
                      borderColor: 'var(--text-primary) transparent transparent transparent'
                    }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
  }

  // --- COMPACT VARIANT ---
  if (isUnscored) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        <div style={{ width: '80px', height: '8px', background: '#999999', borderRadius: '3px' }}></div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Unscored
        </span>
      </div>
    );
  }
  
  const dominantCount = dist[dominant] || 0;
  const dominantPercentage = Math.round((dominantCount / total) * 100);
  const dominantLabel = TIER_LABELS[dominant];
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
      <div style={{ width: '80px', height: '8px', display: 'flex', overflow: 'hidden', borderRadius: '3px', background: '#333' }}>
        {tiers.map(tier => {
          const count = dist[tier] || 0;
          if (count === 0) return null;
          const percentage = (count / total) * 100;
          return (
            <div key={tier} style={{ width: `${percentage}%`, height: '100%', background: COVERAGE_TIER_COLORS[tier] }} />
          );
        })}
      </div>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
        {dominantPercentage}% {dominantLabel} · {total} sources
      </span>
    </div>
  );
}
