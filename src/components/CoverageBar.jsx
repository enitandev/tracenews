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
  const height = isHero ? '28px' : '16px';
  const fontSize = isHero ? '12px' : '10px';

  if (!coverageStats || !coverageStats.coverage_tier_distribution) {
    return (
      <div style={{ width: '100%', height, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Unscored</span>
      </div>
    );
  }
  
  const rawDist = coverageStats.coverage_tier_distribution;
  const total = coverageStats.total_coverage || 1;
  const tiers = ['pro_establishment', 'institutional', 'adversarial', 'unscored'];
  
  // Map legacy keys to new keys safely
  const dist = {};
  for (const [k, v] of Object.entries(rawDist)) {
    const mappedKey = LEGACY_MAP[k] || k;
    dist[mappedKey] = (dist[mappedKey] || 0) + v;
  }
  
  const dominant = getDominantTier(dist);

  return (
    <div style={{
      width: '100%',
      height,
      display: 'flex',
      overflow: 'hidden',
      background: '#333'
    }}>
      {tiers.map(tier => {
        const count = dist[tier] || 0;
        if (count === 0) return null;
        
        const percentage = (count / total) * 100;
        const showLabel = percentage >= 15;
        
        let labelText = `${TIER_LABELS[tier]} ${Math.round(percentage)}%`;
        if (isHero && tier === dominant) {
          labelText += ` · ${total} sources`;
        }

        return (
          <div 
            key={tier} 
            style={{ 
              width: `${percentage}%`, 
              height: '100%', 
              background: COVERAGE_TIER_COLORS[tier],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} 
            title={`${TIER_LABELS[tier]}: ${Math.round(percentage)}%`}
          >
            {showLabel && (
              <span style={{ 
                fontSize, 
                fontWeight: 700, 
                color: '#fff', 
                whiteSpace: 'nowrap',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                padding: '0 4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {labelText}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
