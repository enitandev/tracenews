import React, { useState } from 'react';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const TIER_FULL_NAMES = {
  'pro_establishment': 'Pro-Establishment',
  'institutional': 'Institutional',
  'adversarial': 'Adversarial'
};

const TIER_ABBREVS = {
  'pro_establishment': 'P-E',
  'institutional': 'I',
  'adversarial': 'A'
};

export default function CategoryBiasBar({ coverageStats }) {
  const [hoveredTier, setHoveredTier] = useState(null);

  const rawDist = coverageStats?.coverage_tier_distribution || {};
  const total = coverageStats?.total_coverage || 1;
  
  const tiers = ['pro_establishment', 'institutional', 'adversarial'];
  const displayedTiers = tiers.filter(tier => (rawDist[tier] || 0) > 0);

  return (
    <div style={{ width: '100%', height: '28px', display: 'flex', overflow: 'visible', borderRadius: '4px', position: 'relative' }}>
      {/* Container for the segments, clips border radius */}
      <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', borderRadius: '4px' }}>
        {displayedTiers.map((tier, index) => {
          const count = rawDist[tier] || 0;
          const percentage = (count / total) * 100;
          const isLast = index === displayedTiers.length - 1;
          const showAbbrev = percentage >= 12;
          
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'default'
              }}
            >
              {showAbbrev && (
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>
                  {TIER_ABBREVS[tier]} {Math.round(percentage)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Tooltips rendered outside overflow: hidden so they aren't clipped */}
      {displayedTiers.map((tier) => {
        if (hoveredTier !== tier) return null;
        
        const count = rawDist[tier] || 0;
        const percentage = (count / total) * 100;
        const labelText = `${TIER_FULL_NAMES[tier]} ${Math.round(percentage)}%`;
        
        // Calculate left offset for tooltip positioning
        let leftOffsetPct = 0;
        for (let t of displayedTiers) {
            if (t === tier) {
                leftOffsetPct += ((rawDist[t] || 0) / total) * 100 / 2;
                break;
            }
            leftOffsetPct += ((rawDist[t] || 0) / total) * 100;
        }

        return (
          <div key={`${tier}-tooltip`} style={{
            position: 'absolute',
            bottom: '100%',
            left: `${leftOffsetPct}%`,
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            padding: '4px 10px',
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
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid var(--text-primary)'
            }}></div>
          </div>
        );
      })}
    </div>
  );
}
