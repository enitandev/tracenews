import React, { useState } from 'react';
import CoverageBar from './CoverageBar';
import { Clock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

import { TIERS, TIER_COLORS as COVERAGE_TIER_COLORS, TIER_BG_COLORS as COVERAGE_TIER_BG_COLORS } from '../utils/constants';

const LEGACY_MAP = {
  'captured': 'govt_aligned',
  'deferential': 'mainstream',
  'independent': 'watchdog'
};

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const SidebarCard = ({ title, children, defaultCollapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', padding: '16px' }}>
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isCollapsed ? '0' : '16px' }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
      </div>
      {!isCollapsed && <div>{children}</div>}
    </div>
  );
};

export default function CoverageSidebar({ cluster, stories, outletGroups = null }) {
  // If outletGroups isn't passed for some reason, fallback to basic grouping
  const groups = outletGroups || { 'govt_aligned': [], 'mainstream': [], 'watchdog': [] };
  
  const total = (groups['govt_aligned']?.length || 0) + 
                (groups['mainstream']?.length || 0) + 
                (groups['watchdog']?.length || 0) +
                (groups['blog']?.length || 0);

  const allUniqueStories = Object.values(groups).flat();

  const tierDistribution = {
    'govt_aligned': groups['govt_aligned']?.length || 0,
    'mainstream': groups['mainstream']?.length || 0,
    'watchdog': groups['watchdog']?.length || 0
  };
  
  const liveStats = {
    coverage_tier_distribution: tierDistribution,
    total_coverage: tierDistribution.govt_aligned + tierDistribution.mainstream + tierDistribution.watchdog
  };

  const [expandedTiers, setExpandedTiers] = useState({});

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
      <div style={{ 
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
            <Link 
              key={idx} 
              to={`/outlets/${s.outlets?.slug}`}
              title={s.outlet_name}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: logoUrl ? '#fff' : color,
                color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '18px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                overflow: 'hidden',
                flexShrink: 0,
                textDecoration: 'none'
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={s.outlet_name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                initial
              )}
            </Link>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
      {/* CARD 1: Coverage Analysis */}
      <SidebarCard title="Coverage Analysis">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>Total News Sources</span>
            <span style={{ fontWeight: 800 }}>{total}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['govt_aligned'] }}>Govt</span>
            <span style={{ fontWeight: 800 }}>{groups['govt_aligned']?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['mainstream'] }}>Mainstream</span>
            <span style={{ fontWeight: 800 }}>{groups['mainstream']?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['watchdog'] }}>Watchdog</span>
            <span style={{ fontWeight: 800 }}>{groups['watchdog']?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Blogs & Forums</span>
            <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>{groups['blog']?.length || 0}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14}/> Last Updated</span>
            <span style={{ fontWeight: 600 }}>{formatTimeAgo(cluster.last_updated_at || cluster.first_seen_at)}</span>
          </div>
        </div>
      </SidebarCard>

      {/* CARD 2: Tier Distribution */}
      <SidebarCard title="Tier Distribution">
        <div style={{ borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
          <CoverageBar variant="hero" coverageStats={liveStats} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {renderLogoPill('govt_aligned')}
          {renderLogoPill('mainstream')}
          {renderLogoPill('watchdog')}
        </div>
      </SidebarCard>

      {/* CARD 3: Ownership */}
      <SidebarCard title="Ownership">
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
          Unlike other platforms, TraceNews publishes this data freely.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allUniqueStories.map((s, idx) => {
            const out = s.outlets || {};
            const initial = s.outlet_name ? s.outlet_name.charAt(0).toUpperCase() : '?';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Link to={`/outlets/${out.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                    {out.logo_url ? (
                      <img src={out.logo_url} alt={s.outlet_name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
                    ) : (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: s.outlet_coverage_tier && s.outlet_coverage_tier !== 'unscored' ? COVERAGE_TIER_COLORS[s.outlet_coverage_tier] : '#888', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                        {initial}
                      </div>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.outlet_name}</span>
                  </Link>
                  
                  {out.ownership_type && (
                    <span style={{
                      background: 'rgba(180, 160, 130, 0.12)', border: '1px solid rgba(180, 160, 130, 0.25)', color: 'var(--text-primary)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px'
                    }}>
                      {out.ownership_type}
                    </span>
                  )}

                  {out.ownership_transparency && (
                    <span style={{
                      background: 'rgba(180, 160, 130, 0.12)', border: '1px solid rgba(180, 160, 130, 0.25)', color: 'var(--text-primary)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px'
                    }}>
                      Transparency: {out.ownership_transparency}
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '32px' }}>
                  {out.ownership_name || 'Unknown ownership'}
                </div>
                
                {out.party_proximity && out.party_proximity !== 'None' && out.party_proximity !== 'Unknown' && (
                  <div style={{ paddingLeft: '32px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--text-primary)', background: 'var(--bg-hover)', fontSize: '10px', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 6px' }}>
                      Party Proximity: <span style={{ color: 'var(--text-muted)' }}>{out.party_proximity}</span>
                    </span>
                  </div>
                )}
                {idx < allUniqueStories.length - 1 && <div style={{ height: '1px', background: 'var(--border)', marginTop: '12px' }} />}
              </div>
            );
          })}
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
            * Party proximity shown only where documented.
          </div>
        </div>
      </SidebarCard>



    </div>
  );
}
