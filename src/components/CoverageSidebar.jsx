import React, { useState } from 'react';
import CoverageBar from './CoverageBar';
import { Clock } from 'lucide-react';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const COVERAGE_TIER_BG_COLORS = {
  'pro_establishment': 'rgba(41, 128, 185, 0.12)',
  'institutional': 'rgba(230, 126, 34, 0.12)',
  'adversarial': 'rgba(192, 57, 43, 0.12)',
  'unscored': 'rgba(153, 153, 153, 0.12)'
};

const LEGACY_MAP = {
  'captured': 'pro_establishment',
  'deferential': 'institutional',
  'independent': 'adversarial'
};

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CoverageSidebar({ cluster, stories, outletGroups = null }) {
  // If outletGroups isn't passed for some reason, fallback to basic grouping
  const groups = outletGroups || { 'pro_establishment': [], 'institutional': [], 'adversarial': [] };
  
  const total = (groups['pro_establishment']?.length || 0) + 
                (groups['institutional']?.length || 0) + 
                (groups['adversarial']?.length || 0) +
                (groups['blog']?.length || 0);

  const allUniqueStories = Object.values(groups).flat();
  let trackRecordStats = { 'Clean': 0, 'Flagged': 0, 'Problematic': 0 };
  let totalBrownEnvelopes = 0;
  
  allUniqueStories.forEach(s => {
    const out = s.outlets || {};
    if (out.track_record_status && trackRecordStats[out.track_record_status] !== undefined) {
      trackRecordStats[out.track_record_status]++;
    }
    if (out.brown_envelope_count) {
      totalBrownEnvelopes += out.brown_envelope_count;
    }
  });

  const tierDistribution = {
    'pro_establishment': groups['pro_establishment']?.length || 0,
    'institutional': groups['institutional']?.length || 0,
    'adversarial': groups['adversarial']?.length || 0
  };
  
  const liveStats = {
    coverage_tier_distribution: tierDistribution,
    total_coverage: tierDistribution.pro_establishment + tierDistribution.institutional + tierDistribution.adversarial
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
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 24px 0' }}>Coverage Analysis</h3>
      
      {/* Component 1: Coverage Details box */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', fontSize: '14px', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>Total News Sources</span>
          <span style={{ fontWeight: 800 }}>{total}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['pro_establishment'] }}>Pro-Establishment</span>
          <span style={{ fontWeight: 800 }}>{groups['pro_establishment']?.length || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['institutional'] }}>Institutional</span>
          <span style={{ fontWeight: 800 }}>{groups['institutional']?.length || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['adversarial'] }}>Adversarial</span>
          <span style={{ fontWeight: 800 }}>{groups['adversarial']?.length || 0}</span>
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

      {/* Component 2: Tier Distribution Bar */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Tier Distribution
        </h4>
        <div style={{ borderRadius: '6px', overflow: 'hidden' }}>
          <CoverageBar variant="hero" coverageStats={liveStats} />
        </div>
      </div>

      {/* Component 3: Outlet Logo Tubes */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Sources By Tier
        </h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          {renderLogoPill('pro_establishment')}
          {renderLogoPill('institutional')}
          {renderLogoPill('adversarial')}
        </div>
      </div>

      {/* Component 4: Ownership */}
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Ownership
        </h4>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
          Unlike other platforms, TraceNews publishes ownership data freely.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allUniqueStories.map((s, idx) => {
            const out = s.outlets || {};
            const initial = s.outlet_name ? s.outlet_name.charAt(0).toUpperCase() : '?';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {out.logo_url ? (
                    <img src={out.logo_url} alt={s.outlet_name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
                  ) : (
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: s.outlet_coverage_tier && s.outlet_coverage_tier !== 'unscored' ? COVERAGE_TIER_COLORS[s.outlet_coverage_tier] : '#888', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                      {initial}
                    </div>
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.outlet_name}</span>
                  
                  {out.ownership_type && (
                    <span style={{
                      background: out.ownership_type === 'Government' ? '#E74C3C' : out.ownership_type === 'Corporate' ? '#E67E22' : '#2ECC71',
                      color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 800
                    }}>
                      {out.ownership_type}
                    </span>
                  )}

                  {out.ownership_transparency && (
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: out.ownership_transparency === 'High' ? '#2ECC71' : out.ownership_transparency === 'Medium' ? '#E67E22' : '#E74C3C'
                    }} title={`Transparency: ${out.ownership_transparency}`} />
                  )}
                </div>
                
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '32px' }}>
                  {out.ownership_name || 'Unknown ownership'}
                </div>
                
                {out.party_proximity && out.party_proximity !== 'None' && (
                  <div style={{ paddingLeft: '32px', marginTop: '2px' }}>
                    <span style={{ color: '#E74C3C', fontSize: '10px', fontWeight: 700, border: '1px solid #E74C3C', borderRadius: '4px', padding: '2px 6px' }}>
                      {out.party_proximity}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Component 5: Track Record */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Track Record
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#2ECC71', display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Clean</span>
            <span style={{ fontWeight: 800 }}>{trackRecordStats['Clean']}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#E67E22', display: 'flex', alignItems: 'center', gap: '6px' }}>⚠ Flagged</span>
            <span style={{ fontWeight: 800 }}>{trackRecordStats['Flagged']}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '6px' }}>✗ Problematic</span>
            <span style={{ fontWeight: 800 }}>{trackRecordStats['Problematic']}</span>
          </div>
          {totalBrownEnvelopes > 0 && (
            <div style={{ color: '#E67E22', fontSize: '12px', fontWeight: 700, marginTop: '4px', padding: '8px', background: 'rgba(230,126,34,0.1)', borderRadius: '6px' }}>
              ⚠ {totalBrownEnvelopes} brown envelope incident(s) recorded across covering outlets
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
