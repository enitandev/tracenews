import React from 'react';
import CoverageBar from './CoverageBar';
import { Clock } from 'lucide-react';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const COVERAGE_TIER_BG_COLORS = {
  'pro_establishment': 'rgba(41, 128, 185, 0.1)',
  'institutional': 'rgba(230, 126, 34, 0.1)',
  'adversarial': 'rgba(192, 57, 43, 0.1)',
  'unscored': 'rgba(153, 153, 153, 0.1)'
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

export default function CoverageSidebar({ cluster, stories }) {
  const stats = cluster.coverage_stats || {};
  const dist = stats.coverage_tier_distribution || {};
  
  // Map legacy keys
  const mappedDist = {
    'pro_establishment': 0,
    'institutional': 0,
    'adversarial': 0
  };
  for (const [k, v] of Object.entries(dist)) {
    const mk = LEGACY_MAP[k] || k;
    if (mappedDist[mk] !== undefined) {
      mappedDist[mk] += v;
    }
  }

  let total = stats.total_coverage || 0;
  if (total === 0) {
    total = Object.values(mappedDist).reduce((a, b) => a + b, 0) || 1;
  }

  // Group stories by tier to get logos
  const groups = { 'pro_establishment': [], 'institutional': [], 'adversarial': [] };
  
  // Dedup stories by outlet
  const outletSet = new Set();
  const uniqueStories = [];
  stories.forEach(s => {
    if (!outletSet.has(s.outlet_name)) {
      outletSet.add(s.outlet_name);
      uniqueStories.push(s);
    }
  });

  uniqueStories.forEach(s => {
    const rawTier = s.outlet_coverage_tier || 'unscored';
    const tier = LEGACY_MAP[rawTier] || rawTier;
    if (groups[tier]) {
      groups[tier].push(s);
    }
  });

  const renderLogoPill = (tier, label) => {
    const outlets = groups[tier] || [];
    const color = COVERAGE_TIER_COLORS[tier];
    const bgColor = COVERAGE_TIER_BG_COLORS[tier];
    
    const showLimit = 5;
    const hasMore = outlets.length > showLimit + 1;
    const displayOutlets = hasMore ? outlets.slice(0, showLimit) : outlets;
    const remaining = hasMore ? outlets.length - showLimit : 0;

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Top Label */}
        <div style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center', height: '28px' }}>
          {label}
        </div>
        
        {/* Pill Container */}
        <div style={{ 
          background: bgColor, 
          borderRadius: '24px', 
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          width: '56px',
          height: '280px',
          overflow: 'hidden',
          border: `1px solid ${color}33`
        }}>
          {displayOutlets.map((s, idx) => {
            const initial = s.outlet_name ? s.outlet_name.charAt(0).toUpperCase() : '?';
            // Use logo_url from outlets join if available
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
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#333', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px',
              border: `1px solid ${color}`,
              flexShrink: 0
            }}>
              +{remaining}
            </div>
          )}

          {outlets.length === 0 && (
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `${color}66`, margin: '16px 0' }} />
          )}
        </div>
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
          <span style={{ fontWeight: 800 }}>{mappedDist['pro_establishment'] || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['institutional'] }}>Institutional</span>
          <span style={{ fontWeight: 800 }}>{mappedDist['institutional'] || 0}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          <span style={{ fontWeight: 600, color: COVERAGE_TIER_COLORS['adversarial'] }}>Adversarial</span>
          <span style={{ fontWeight: 800 }}>{mappedDist['adversarial'] || 0}</span>
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
          <CoverageBar variant="hero" coverageStats={stats} />
        </div>
      </div>

      {/* Component 3: Outlet Logo Tubes */}
      <div>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Sources By Tier
        </h4>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {renderLogoPill('pro_establishment', 'Pro-Estab')}
          {renderLogoPill('institutional', 'Institution')}
          {renderLogoPill('adversarial', 'Adversarial')}
        </div>
      </div>

    </div>
  );
}
