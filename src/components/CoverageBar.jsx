import React from 'react';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const LEGACY_MAP = {
  'captured': 'pro_establishment',
  'deferential': 'institutional',
  'independent': 'adversarial'
};

const TIER_LABELS = {
  'pro_establishment': 'Pro-Establishment',
  'institutional': 'Institutional',
  'adversarial': 'Adversarial',
  'unscored': 'Unscored'
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

export default function CoverageBar({ coverageStats, variant = 'compact' }) {
  const isHero = variant === 'hero';

  const rawDist = coverageStats?.coverage_tier_distribution || {};
  let total = coverageStats?.total_coverage || 0;
  
  // Map legacy keys to new keys safely
  const dist = {};
  for (const [k, v] of Object.entries(rawDist)) {
    const mappedKey = LEGACY_MAP[k] || k;
    dist[mappedKey] = (dist[mappedKey] || 0) + v;
  }
  
  if (total === 0) {
      total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  }
  
  const dominant = getDominantTier(dist);
  const tiers = ['pro_establishment', 'institutional', 'adversarial', 'unscored'];
  const isUnscored = Object.values(dist).every(v => v === 0);

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
      
      return (
        <div style={{ width: '100%', height, display: 'flex', overflow: 'hidden', background: '#333' }}>
          {tiers.map(tier => {
            const count = dist[tier] || 0;
            if (count === 0) return null;
            const percentage = (count / total) * 100;
            const showLabel = percentage >= 15;
            let labelText = `${TIER_LABELS[tier]} ${Math.round(percentage)}%`;
            if (tier === dominant) {
              labelText += ` · ${total} sources`;
            }
            return (
              <div 
                key={tier} 
                style={{ width: `${percentage}%`, height: '100%', background: COVERAGE_TIER_COLORS[tier], display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                title={`${TIER_LABELS[tier]}: ${Math.round(percentage)}%`}
              >
                {showLabel && (
                  <span style={{ fontSize, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.5)', padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {labelText}
                  </span>
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
