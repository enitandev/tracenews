import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowLeft, ExternalLink, Shield, Info, Link2, Mail, MessageCircle, Bookmark, Flag } from 'lucide-react';
import CoverageBar from '../components/CoverageBar';
import CoverageSidebar from '../components/CoverageSidebar';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const FacebookIcon = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ size = 24, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TIER_LABELS = {
  'pro_establishment': 'Pro-Establishment',
  'institutional': 'Institutional',
  'adversarial': 'Adversarial',
  'unscored': 'Unscored'
};

const TAB_TO_KEY = {
  'All': 'all',
  'Adversarial': 'adversarial',
  'Institutional': 'institutional',
  'Pro-Establishment': 'pro_establishment',
  'Bias Comparison': 'comparison'
};

const GOVERNMENT_COLORS = {
  'pro_government': '#008751',
  'critical': '#E74C3C',
  'neutral': '#7F8C8D',
  'unscored': '#999999'
};

function BadgeWithTooltip({ label, warning, children }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        background: 'var(--bg-hover)',
        border: `1px solid ${warning ? '#E74C3C' : 'var(--border)'}`,
        color: 'var(--text-muted)',
        fontSize: '11px',
        padding: '4px 10px',
        borderRadius: '12px',
        cursor: 'help',
        fontWeight: 600
      }}>
        {label}
      </div>
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: '50%',
          transform: 'translateX(50%)',
          marginBottom: '8px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px',
          width: '240px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          cursor: 'default',
          textAlign: 'left'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function FactualityBadge({ outlet }) {
  if (!outlet || !outlet.track_record_status) return null;
  return (
    <BadgeWithTooltip label="Factuality">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Factuality</span>
      </div>
      {outlet.track_record_status && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: outlet.track_record_status === 'Clean' ? '#2ECC71' : outlet.track_record_status === 'Flagged' ? '#E67E22' : '#E74C3C' }}>
          {outlet.track_record_status === 'Clean' ? '✓' : outlet.track_record_status === 'Flagged' ? '⚠' : '✗'} {outlet.track_record_status}
        </div>
      )}
      {outlet.brown_envelope_count > 0 && (
        <div style={{ color: '#E67E22', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⚠ {outlet.brown_envelope_count} brown envelope incident(s) recorded
        </div>
      )}
      {outlet.credibility_tier && (
        <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
          Tier: {outlet.credibility_tier}
        </div>
      )}
    </BadgeWithTooltip>
  );
}

function OwnershipBadge({ outlet }) {
  if (!outlet || !outlet.ownership_type) return null;
  const isWarning = outlet.party_proximity && outlet.party_proximity !== 'None';
  return (
    <BadgeWithTooltip label="Ownership" warning={isWarning}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Ownership</span>
        {outlet.ownership_type && (
          <span style={{
            background: outlet.ownership_type === 'Government' ? '#E74C3C' : outlet.ownership_type === 'Corporate' ? '#E67E22' : '#2ECC71',
            color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 800
          }}>
            {outlet.ownership_type}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {outlet.ownership_transparency && (
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: outlet.ownership_transparency === 'High' ? '#2ECC71' : outlet.ownership_transparency === 'Medium' ? '#E67E22' : '#E74C3C'
          }} />
        )}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {outlet.ownership_name || 'Unknown ownership'}
        </span>
      </div>
      {isWarning && (
        <div style={{ color: '#E74C3C', fontSize: '12px', fontWeight: 700, marginTop: '4px' }}>
          {outlet.party_proximity}
        </div>
      )}
    </BadgeWithTooltip>
  );
}

const SEVERITY_COLORS = {
  'high': '#e67e22',
  'critical': '#c0392b',
  'medium': '#f39c12',
  'low': '#2471a3'
};

const REGION_COLORS = {
  'North': '#2471A3',
  'Southwest': '#C0392B',
  'Southeast': '#008751',
  'South-South': '#F39C12',
  'Niger Delta': '#F39C12',
  'National': '#888888',
  'Unknown': '#e5e5e5'
};

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function decodeHtml(html) {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  } catch (e) {
    return html.replace(/<[^>]+>/g, '');
  }
}

export default function Story() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSummaryTab, setActiveSummaryTab] = useState('Bias Comparison');
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [framingCache, setFramingCache] = useState({});
  const [loadingFraming, setLoadingFraming] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTier, setFeedbackTier] = useState('Bias Comparison');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/clusters/by-slug/${slug}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) {
           setData(null);
        } else {
           setData(d);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (framingCache[activeSummaryTab]) return;
    if (!data || !data.cluster) return;

    setLoadingFraming(true);
    const alignmentQuery = TAB_TO_KEY[activeSummaryTab] || 'all'; // Fallback if somehow not mapped
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/clusters/${data.cluster.id}/framing?alignment=${alignmentQuery}`)
      .then(res => res.json())
      .then(d => {
        if (d.bullets && d.bullets.length > 0) {
          setFramingCache(prev => ({ ...prev, [activeSummaryTab]: d.bullets }));
        }
        setLoadingFraming(false);
      })
      .catch(e => {
        console.error(e);
        setLoadingFraming(false);
      });
  }, [activeSummaryTab, data?.cluster?.id]); // Intentionally omitted framingCache


  if (loading) return <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>Loading Story...</div>;
  if (!data || !data.cluster) return <div style={{ padding: '60px', textAlign: 'center', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>Story not found. Please navigate from the homepage.</div>;

  const { cluster, stories } = data;
  const stats = cluster.coverage_stats || {};
  const flags = cluster.monitoring_flags || [];
  
  // Tabs filtering
  const getUniqueStories = (storiesList) => {
    const map = new Map();
    storiesList.forEach(s => {
      map.set(s.outlet_slug, s);
    });
    return Array.from(map.values()).sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  };

  const filteredStories = getUniqueStories(activeFilterTab === 'all' 
    ? stories 
    : stories.filter(s => {
        const tier = s.outlet_coverage_tier || 'unscored';
        return tier === activeFilterTab;
      }));

  // Outlet Logos grouping (By Coverage Tier)
  const groupOutlets = () => {
    const groups = { 'pro_establishment': [], 'institutional': [], 'adversarial': [], 'blog': [], 'unscored': [] };
    const seenOutlets = new Set();
    stories.forEach(s => {
      const tier = s.outlet_coverage_tier || 'unscored';
      const outletId = (s.outlets && s.outlets.slug) || s.outlet_slug || s.outlet_name;
      if (groups[tier] && !seenOutlets.has(outletId)) {
        seenOutlets.add(outletId);
        groups[tier].push(s);
      }
    });
    return groups;
  };
  const outletGroups = groupOutlets();

  // Layer 1: Coverage Tier Bar (Primary)
  const renderLayer1 = () => {
    const dist = {
      adversarial: outletGroups['adversarial'].length,
      institutional: outletGroups['institutional'].length,
      pro_establishment: outletGroups['pro_establishment'].length
    };
    // Calculate total explicitly for coverage tier, excluding 'unscored'
    const totalScored = Object.values(dist).reduce((sum, val) => sum + val, 0) || 1;
    const tiers = ['adversarial', 'institutional', 'pro_establishment'];
    
    return (
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layer 1: Coverage Intelligence</h4>
        <div style={{ display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          {tiers.map(t => dist[t] > 0 && (
            <div key={t} style={{ width: `${(dist[t]/totalScored)*100}%`, background: COVERAGE_TIER_COLORS[t] }} title={`${t}: ${Math.round((dist[t]/totalScored)*100)}%`} />
          ))}
          {(!dist['adversarial'] && !dist['institutional'] && !dist['pro_establishment']) && <div style={{width:'100%', background:'#333'}}></div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span style={{ color: COVERAGE_TIER_COLORS['adversarial'] }}>{TIER_LABELS['adversarial']}: {Math.round(((dist['adversarial']||0)/totalScored)*100)}%</span>
          <span style={{ color: COVERAGE_TIER_COLORS['institutional'] }}>{TIER_LABELS['institutional']}: {Math.round(((dist['institutional']||0)/totalScored)*100)}%</span>
          <span style={{ color: COVERAGE_TIER_COLORS['pro_establishment'] }}>{TIER_LABELS['pro_establishment']}: {Math.round(((dist['pro_establishment']||0)/totalScored)*100)}%</span>
        </div>
      </div>
    );
  };


  // Layer 2: Editorial Independence Gauge
  const renderLayer2 = () => {
    const avgScore = stats.average_independence_score || 0;
    
    // Determine which segment the average score falls into
    const isStatePR = avgScore <= 34;
    const isInstitutional = avgScore > 34 && avgScore <= 69;
    const isIndependent = avgScore >= 70;

    return (
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layer 2: Editorial Independence</h4>
        <div style={{ display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
          <div style={{ flex: '1', background: isStatePR ? '#C0392B' : '#333' }} title={`State PR (0-34)`} />
          <div style={{ flex: '1', background: isInstitutional ? '#E67E22' : '#333' }} title={`Institutional (35-69)`} />
          <div style={{ flex: '1', background: isIndependent ? '#008751' : '#333' }} title={`Independent (70-100)`} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span style={{ color: isStatePR ? '#C0392B' : '#888' }}>State PR</span>
          <span style={{ color: isInstitutional ? '#E67E22' : '#888' }}>Institutional</span>
          <span style={{ color: isIndependent ? '#008751' : '#888' }}>Independent</span>
        </div>
      </div>
    );
  };

  // Layer 3: Regional Focus
  const renderLayer3 = () => {
    const dist = stats.geopolitical_distribution || {};
    const total = stats.total_coverage || 1;
    const regions = Object.entries(dist).filter(([_, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    
    return (
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layer 3: Regional Focus</h4>
        <div style={{ display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
          {regions.length > 0 ? regions.map(([region, count]) => (
            <div key={region} style={{ width: `${(count/total)*100}%`, background: REGION_COLORS[region] || '#888' }} title={`${region}: ${Math.round((count/total)*100)}%`} />
          )) : <div style={{width:'100%', background:'#eee'}}></div>}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
          {regions.map(([region, count]) => (
            <div key={region} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: REGION_COLORS[region] || '#888' }}></div>
              {region}: {Math.round((count/total)*100)}%
            </div>
          ))}
        </div>
      </div>
    );
  };



  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      
      {/* Top Nav Back */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Back to Feed
        </Link>
      </div>

      <div className="mobile-stack" style={{ display: 'flex', gap: '48px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Main Story Content */}
        <div style={{ width: '65%', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {cluster.category || 'General'}
            </span>
          </div>

          {/* Share Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
            {/* LEFT: Timestamps (Hidden on mobile) */}
            <div className="hide-on-mobile" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Published {formatTimeAgo(cluster.first_seen_at)}
              {cluster.last_updated_at && cluster.last_updated_at !== cluster.first_seen_at && ` · Updated ${formatTimeAgo(cluster.last_updated_at)}`}
            </div>
            
            {/* RIGHT: Icon Groups */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end', minWidth: 'max-content' }}>
              {/* GROUP 1: Social Share */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <FacebookIcon size={14} fill="currentColor" strokeWidth={0} />
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(cluster.representative_title)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <TwitterIcon size={14} fill="currentColor" strokeWidth={0} />
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(cluster.representative_title)}%20${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <MessageCircle size={14} fill="currentColor" strokeWidth={0} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0A66C2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <LinkedinIcon size={14} fill="currentColor" strokeWidth={0} />
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(cluster.representative_title)}&body=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', textDecoration: 'none' }}>
                  <Mail size={14} />
                </a>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopyTooltip(true); setTimeout(() => setCopyTooltip(false), 2000); }} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer', padding: 0, position: 'relative' }}>
                  {copyTooltip ? <span style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Copied!</span> : null}
                  <Link2 size={14} />
                </button>
              </div>
              
              {/* Divider */}
              <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
              
              {/* GROUP 2: Utilities */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setIsBookmarked(!isBookmarked)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => setIsFeedbackModalOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Flag size={18} />
                </button>
              </div>
            </div>
          </div>

          <h1 style={{ fontFamily: '"Merriweather", serif', fontSize: '38px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, margin: '0 0 24px 0' }}>
            {cluster.representative_title}
          </h1>


          {/* Top Monitoring Spirit Bar Removed */}

          {/* Coverage Bar */}
          <div style={{ marginBottom: '16px' }}>
            <CoverageBar variant="compact" coverageStats={stats} liveTotal={Object.values(stats?.coverage_tier_distribution || {}).reduce((a, b) => a + b, 0) || cluster.outlet_count} />
          </div>

          {/* BAR 1: AI Insight Bar */}
          <div style={{ display: 'flex', gap: '8px', background: 'transparent', marginBottom: '16px', flexWrap: 'wrap' }}>
            {['Pro-Establishment', 'Institutional', 'Adversarial', 'Bias Comparison'].map(tab => {
              const isActive = activeSummaryTab === tab;
              let bg = 'transparent';
              let color = 'var(--text-muted)';
              if (isActive) {
                if (tab === 'Pro-Establishment') { bg = '#2980B9'; color = '#fff'; }
                else if (tab === 'Institutional') { bg = '#E67E22'; color = '#fff'; }
                else if (tab === 'Adversarial') { bg = '#C0392B'; color = '#fff'; }
                else { bg = 'var(--bg-elevated)'; color = 'var(--text-primary)'; }
              }
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveSummaryTab(tab)}
                  style={{
                    padding: '6px 16px',
                    background: bg,
                    color: color,
                    border: isActive && tab === 'Bias Comparison' ? '1px solid var(--border)' : '1px solid transparent',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isActive && tab !== 'Bias Comparison' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Dynamic AI Framing Box */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', marginBottom: '40px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                {activeSummaryTab === 'Bias Comparison' ? 'Bias Comparison' : `${activeSummaryTab} Framing Analysis`}
              </h3>
            </div>
            
            {loadingFraming ? (
              <div style={{ color: '#888', fontStyle: 'italic', fontSize: '14px' }}>Analyzing {activeSummaryTab.toLowerCase()}-aligned coverage...</div>
            ) : framingCache[activeSummaryTab] && framingCache[activeSummaryTab].length > 0 ? (
              <ul style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px' }}>
                {framingCache[activeSummaryTab].map((bullet, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>{bullet}</li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '14px', color: '#888', margin: 0, fontStyle: 'italic' }}>
                No sufficient coverage to analyze framing.
              </p>
            )}

            {!loadingFraming && framingCache[activeSummaryTab]?.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setFeedbackTier(activeSummaryTab);
                    setFeedbackComment('');
                    setFeedbackStatus('');
                    setIsFeedbackModalOpen(true);
                  }}
                  style={{ color: '#888', fontSize: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Info size={12} /> Does this summary seem wrong?
                </a>
              </div>
            )}
          </div>

          {/* BAR 2: Article Filter Bar */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #333', marginBottom: '24px', paddingBottom: '0' }}>
            {[
              { id: 'all', label: 'All', count: null },
              { id: 'pro_establishment', label: 'Pro-Establishment', count: outletGroups['pro_establishment']?.length || 0 },
              { id: 'institutional', label: 'Institutional', count: outletGroups['institutional']?.length || 0 },
              { id: 'adversarial', label: 'Adversarial', count: outletGroups['adversarial']?.length || 0 },
              ...(outletGroups['blog']?.length > 0 ? [{ id: 'blog', label: 'Blog', count: outletGroups['blog'].length }] : [])
            ].map(tab => {
              const isActive = activeFilterTab === tab.id;
              let borderColor = 'transparent';
              if (isActive) {
                if (tab.id === 'pro_establishment') borderColor = '#2980B9';
                else if (tab.id === 'institutional') borderColor = '#E67E22';
                else if (tab.id === 'adversarial') borderColor = '#C0392B';
                else if (tab.id === 'blog') borderColor = '#888888';
                else borderColor = 'var(--text-primary)';
              }
              
              // Using inline label + pill rendering instead of string merging

              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: (isActive && tab.id === 'blog') ? '6px 6px 0 0' : '0',
                    background: (isActive && tab.id === 'blog') ? '#888888' : 'transparent',
                    color: (isActive && tab.id === 'blog') ? '#ffffff' : (isActive ? 'var(--text-primary)' : 'var(--text-muted)'),
                    border: 'none',
                    borderBottom: `3px solid ${borderColor}`,
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '-1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span style={{
                      borderRadius: '10px',
                      padding: '1px 7px',
                      background: tab.id === 'pro_establishment' ? 'rgba(41,128,185,0.2)' :
                                  tab.id === 'institutional' ? 'rgba(230,126,34,0.2)' :
                                  tab.id === 'adversarial' ? 'rgba(192,57,43,0.2)' : 
                                  tab.id === 'blog' ? 'rgba(136,136,136,0.2)' : 'var(--bg-elevated)',
                      color: tab.id === 'all' ? 'var(--text-primary)' : 
                             tab.id === 'blog' ? '#888888' : COVERAGE_TIER_COLORS[tab.id],
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Articles List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>{filteredStories.length} Articles</h3>
            
            {filteredStories.map(story => (
              <a key={story.id} href={story.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {story.outlet_logo_url ? (
                        <img src={story.outlet_logo_url} alt={story.outlet_name} style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
                      ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: story.outlet_coverage_tier && story.outlet_coverage_tier !== 'unscored' ? COVERAGE_TIER_COLORS[story.outlet_coverage_tier] : '#888', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>
                          {story.outlet_name ? story.outlet_name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{story.outlet_name}</span>
                      {story.broke_story_first && (
                        <span style={{ background: '#F39C12', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', marginLeft: '4px' }}>First to break</span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <OwnershipBadge outlet={story.outlets || {}} />
                      <FactualityBadge outlet={story.outlets || {}} />
                      {story.outlet_coverage_tier && story.outlet_coverage_tier !== 'unscored' && (
                        <span style={{
                          border: story.outlet_coverage_tier === 'blog' ? '1px solid #888888' : `1px solid ${COVERAGE_TIER_COLORS[story.outlet_coverage_tier]}`,
                          background: story.outlet_coverage_tier === 'blog' ? 'rgba(136,136,136,0.15)' : COVERAGE_TIER_COLORS[story.outlet_coverage_tier],
                          color: story.outlet_coverage_tier === 'blog' ? '#888888' : '#fff',
                          fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', textTransform: 'uppercase'
                        }}>
                          {story.outlet_coverage_tier === 'blog' ? 'Blog' : (TIER_LABELS[story.outlet_coverage_tier] || story.outlet_coverage_tier)}
                        </span>
                      )}
                      <span style={{ color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '4px' }}>⋮</span>
                    </div>

                  </div>
                  
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    {story.title}
                  </h4>
                  
                  {story.summary && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                      {(() => {
                        if (!story.summary) return null;
                        let clean = decodeHtml(story.summary);
                        clean = clean.replace(/https?:\/\/\S+/g, '').trim();
                        
                        if (story.title) {
                          const normalize = str => str.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
                          const tWords = normalize(story.title).toLowerCase().split(' ').filter(w => w.length > 0);
                          const numWordsToMatch = Math.min(tWords.length, 15);
                          
                          let strippedByHeadline = false;
                          if (numWordsToMatch >= 2) {
                            const regexPattern = tWords.slice(0, numWordsToMatch).join('[\\s\\W]+');
                            try {
                              const regex = new RegExp(regexPattern, 'gi');
                              let match;
                              let lastMatchEnd = -1;
                              while ((match = regex.exec(clean)) !== null) {
                                lastMatchEnd = match.index + match[0].length;
                              }
                              
                              if (lastMatchEnd !== -1) {
                                clean = clean.substring(lastMatchEnd);
                                strippedByHeadline = true;
                              }
                            } catch (e) {}
                          }
                          
                          if (!strippedByHeadline) {
                            const fallbackRegex = /^[\s\S]{0,40}?(?:[\n\|\-\:]|\s{2,})\s*([A-Z])/;
                            const fallbackMatch = clean.match(fallbackRegex);
                            if (fallbackMatch) {
                              clean = clean.substring(fallbackMatch[0].length - 1);
                            }
                          }
                        }
                        
                        clean = clean.trim();
                        
                        if (clean.length < 20) return null;
                        return clean.length > 160 ? clean.substring(0, 160).trim() + '...' : clean;
                      })()}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {formatTimeAgo(story.published_at)} {(story.outlets && story.outlets.headquarters_city) ? `· ${story.outlets.headquarters_city}` : ''}
                    </span>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                      Read Full Article →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div style={{ width: '35%', flexShrink: 0, alignSelf: 'stretch', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
          
          <CoverageSidebar cluster={cluster} stories={stories} outletGroups={outletGroups} />

          {/* Monitoring Spirit Layer */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: flags.length > 0 ? '20px' : '0' }}>
              <Info size={20} color="#e67e22" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Monitoring Spirit</h3>
            </div>
            
            {flags.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#888', margin: '16px 0 0 0', fontStyle: 'italic' }}>No alerts detected for this story.</p>
            ) : (
              flags.map((flag, idx) => (
                <div key={idx} style={{ marginBottom: idx === flags.length - 1 ? 0 : '16px', borderBottom: idx === flags.length - 1 ? 'none' : '1px solid var(--border)', paddingBottom: idx === flags.length - 1 ? 0 : '16px' }}>
                  <h4 style={{ color: SEVERITY_COLORS[flag.severity] || '#fff', fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase' }}>{flag.type.replace('_', ' ')}</h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>{flag.message}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setIsFeedbackModalOpen(false)}
        >
          <div 
            style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Report an issue</h3>
              <button onClick={() => setIsFeedbackModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            
            {feedbackStatus === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--accent-primary)' }}>
                <p>Thanks - report sent!</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 0, marginBottom: '20px' }}>
                  See something that seems off? Let us know, and we'll take care of the rest.
                </p>
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>Which summary has an issue?</label>
                <select 
                  value={feedbackTier} 
                  onChange={(e) => setFeedbackTier(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', marginBottom: '16px' }}
                >
                  <option value="All">All / Event Briefing</option>
                  <option value="Adversarial">Adversarial</option>
                  <option value="Institutional">Institutional</option>
                  <option value="Pro-Establishment">Pro-Establishment</option>
                </select>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>Additional Comments</label>
                <textarea 
                  maxLength={500}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what's wrong..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', marginTop: '4px' }}>
                  {feedbackComment.length}/500
                </div>

                <button 
                  disabled={feedbackStatus === 'sending'}
                  onClick={() => {
                    setFeedbackStatus('sending');
                    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/framing/feedback', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ cluster_id: cluster.id, tier: TAB_TO_KEY[feedbackTier] || feedbackTier, comment: feedbackComment })
                    }).then(() => {
                      setFeedbackStatus('sent');
                      setTimeout(() => setIsFeedbackModalOpen(false), 2000);
                    }).catch(err => {
                      console.error(err);
                      setFeedbackStatus('sent'); // Close anyway
                      setTimeout(() => setIsFeedbackModalOpen(false), 2000);
                    });
                  }}
                  style={{ width: '100%', padding: '12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: feedbackStatus === 'sending' ? 'not-allowed' : 'pointer' }}
                >
                  {feedbackStatus === 'sending' ? 'Sending...' : 'Send report'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
