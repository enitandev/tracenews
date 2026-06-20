import React, { useState } from 'react';
import { COVERAGE_TIER_COLORS, COVERAGE_TIER_BG_COLORS } from '../utils/helpers';

export default function TierDistributionTubes({ groups }) {
  const [expandedTiers, setExpandedTiers] = useState({ pro_establishment: false, institutional: false, adversarial: false });

  const toggleExpanded = (tier) => {
    setExpandedTiers(prev => ({ ...prev, [tier]: !prev[tier] }));
  };

  const renderLogoPill = (tier) => {
    const outlets = groups[tier] || [];
    const color = COVERAGE_TIER_COLORS[tier];
    const bgColor = outlets.length > 0 ? COVERAGE_TIER_BG_COLORS[tier] : 'var(--bg-elevated)';
    
    const isExpanded = expandedTiers[tier];
    const showLimit = 8; // 4 rows * 2 columns
    const hasMore = outlets.length > showLimit;
    const displayOutlets = isExpanded ? outlets : (hasMore ? outlets.slice(0, showLimit) : outlets);
    const remaining = hasMore ? outlets.length - showLimit : 0;

    return (
      <div key={tier} style={{ 
        flex: 1,
        background: bgColor, 
        borderRadius: '28px', 
        padding: '8px 4px',
        paddingBottom: isExpanded ? '56px' : '8px',
        display: 'grid',
        gridTemplateColumns: outlets.length <= 4 ? '1fr' : '1fr 1fr',
        gridAutoRows: '40px',
        justifyItems: 'center',
        gap: '6px',
        height: isExpanded ? 'auto' : '220px',
        minHeight: '220px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {displayOutlets.map((s, idx) => {
          const initial = s.outlet_name ? s.outlet_name.charAt(0).toUpperCase() : '?';
          const logoUrl = s.outlets?.logo_url;
          
          return (
            <div 
              key={idx} 
              title={s.outlet_name}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: logoUrl ? '#fff' : color,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '18px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={s.outlet_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                initial
              )}
            </div>
          );
        })}
        
        {hasMore && (
          <div 
            onClick={() => toggleExpanded(tier)}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#333', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px',
              border: `1px solid ${color}`,
              flexShrink: 0,
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'pointer',
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
            }}>
            {isExpanded ? 'x' : `+${remaining}`}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {renderLogoPill('pro_establishment')}
      {renderLogoPill('institutional')}
      {renderLogoPill('adversarial')}
    </div>
  );
}
