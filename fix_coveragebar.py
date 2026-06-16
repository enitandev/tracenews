with open("src/components/CoverageBar.jsx", "r") as f:
    content = f.read()

content = content.replace("import React from 'react';", "import React, { useState } from 'react';")

# We need to find the `export default function CoverageBar` body to inject useState.
# And rewrite the `if (isHero)` block.
old_hero_block = """  if (isHero) {
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
  }"""

new_hero_block = """  const [hoveredTier, setHoveredTier] = useState(null);

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
                  position: 'relative'
                }} 
              >
                {hoveredTier === tier && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '8px',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
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
  }"""

content = content.replace(old_hero_block, new_hero_block)

with open("src/components/CoverageBar.jsx", "w") as f:
    f.write(content)

