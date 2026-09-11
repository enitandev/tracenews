import os

# 1. Create CategoryBiasBar.jsx
bias_bar_content = """import React, { useState } from 'react';

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
"""
with open("src/components/CategoryBiasBar.jsx", "w") as f:
    f.write(bias_bar_content)

# 2. Update Category.jsx
with open("src/pages/Category.jsx", "r") as f:
    cat_content = f.read()

# Replace import
if "import CategoryBiasBar" not in cat_content:
    cat_content = cat_content.replace(
        "import CoverageBar, { getDominantTier } from '../components/CoverageBar';",
        "import CoverageBar, { getDominantTier } from '../components/CoverageBar';\nimport CategoryBiasBar from '../components/CategoryBiasBar';"
    )

# Replace the "Covered Most By" row
old_row = """                    const tierColor = COVERAGE_TIER_COLORS[outlet.tier] || 'var(--border)';
                    const tierTextColor = outlet.tier === 'unscored' ? 'var(--text-muted)' : tierColor;
                    const tierLabel = outlet.tier === 'pro_establishment' ? 'Pro-Est.' : outlet.tier === 'institutional' ? 'Institutional' : outlet.tier === 'adversarial' ? 'Adversarial' : 'Unscored';
                    
                    return (
                      <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
                        borderBottom: idx < covered_most_by.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        {outlet.logo_url ? (
                          <img src={outlet.logo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: '#fff' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {outlet.name ? outlet.name.charAt(0) : '?'}
                          </div>
                        )}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {outlet.name}
                        </div>
                        <div style={{ 
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', flexShrink: 0,
                          border: `1px solid ${tierColor}`, color: tierTextColor
                        }}>
                          {tierLabel}
                        </div>
                      </div>
                    );"""

new_row = """                    const tierColor = COVERAGE_TIER_COLORS[outlet.tier] || 'var(--border)';
                    const tierTextColor = outlet.tier === 'unscored' ? 'var(--text-muted)' : tierColor;
                    const tierLabel = outlet.tier === 'pro_establishment' ? 'Pro-Est.' : outlet.tier === 'institutional' ? 'Inst.' : outlet.tier === 'adversarial' ? 'Adversarial' : 'Unscored';
                    
                    return (
                      <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
                        borderBottom: idx < covered_most_by.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        {outlet.logo_url ? (
                          <img src={outlet.logo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: '#fff' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {outlet.name ? outlet.name.charAt(0) : '?'}
                          </div>
                        )}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {outlet.name}
                        </div>
                        <div style={{ 
                          fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', flexShrink: 0,
                          border: `1px solid ${tierColor}`, color: tierTextColor
                        }}>
                          {tierLabel}
                        </div>
                      </div>
                    );"""

cat_content = cat_content.replace(old_row, new_row)

# Replace the bar used in Coverage Breakdown
old_bar = """                <div style={{ width: '100%', display: 'block', overflow: 'hidden', borderRadius: '4px' }}>
                  <CoverageBar variant="hero" coverageStats={synthCoverageStats} />
                </div>"""

new_bar = """                <div style={{ width: '100%', display: 'block', borderRadius: '4px' }}>
                  <CategoryBiasBar coverageStats={synthCoverageStats} />
                </div>"""

cat_content = cat_content.replace(old_bar, new_bar)

with open("src/pages/Category.jsx", "w") as f:
    f.write(cat_content)

