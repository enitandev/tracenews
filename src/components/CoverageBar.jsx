import React from 'react';

const COVERAGE_TIER_COLORS = {
  'adversarial': '#C0392B',
  'institutional': '#E67E22',
  'pro_establishment': '#2980B9',
  'unscored': '#999999'
};

const TIER_LABELS = {
  'adversarial': 'Adversarial',
  'institutional': 'Institutional',
  'pro_establishment': 'Pro-Establishment',
  'unscored': 'Unscored'
};

export function getDominantTier(dist) {
  let max = -1;
  let dominant = 'unscored';
  for (const [k, v] of Object.entries(dist || {})) {
    if (v > max) { max = v; dominant = k; }
  }
  return dominant;
}

export default function CoverageBar({ coverageStats }) {
  if (!coverageStats || !coverageStats.coverage_tier_distribution) {
    return (
      <div style={{ marginTop: '12px', marginBottom: '12px', width: '100%' }}>
        <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px' }} />
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>Unscored</div>
      </div>
    );
  }
  
  const dist = coverageStats.coverage_tier_distribution;
  const total = coverageStats.total_coverage || 1;
  const tiers = ['pro_establishment', 'institutional', 'adversarial', 'unscored'];
  
  const dominant = getDominantTier(dist);
  const dominantPercentage = Math.round(((dist[dominant] || 0) / total) * 100);
  
  return (
    <div style={{ marginTop: '12px', marginBottom: '12px', width: '100%' }}>
      {/* The Bar */}
      <div style={{
        width: '100%',
        height: '4px',
        display: 'flex',
        borderRadius: '2px',
        overflow: 'hidden',
        background: '#333'
      }}>
        {tiers.map(tier => {
          const count = dist[tier] || 0;
          if (count === 0) return null;
          return (
            <div key={tier} style={{ width: `${(count/total)*100}%`, height: '100%', background: COVERAGE_TIER_COLORS[tier] }} title={`${TIER_LABELS[tier]}: ${Math.round((count/total)*100)}%`} />
          );
        })}
      </div>
      
      {/* The Text Summary */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {total} sources
          {dominant !== 'unscored' && ` · ${dominantPercentage}% ${TIER_LABELS[dominant]}`}
        </span>
      </div>
    </div>
  );
}
