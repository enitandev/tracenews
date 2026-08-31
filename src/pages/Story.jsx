import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, Clock, ArrowLeft, ExternalLink, Shield, Info, MapPin } from 'lucide-react';
import CoverageBar from '../components/CoverageBar';
import CoverageSidebar from '../components/CoverageSidebar';
import MonitoringSignals from '../components/MonitoringSignals';
import { supabase } from '../lib/supabase';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#6d7f92',
  'institutional': '#a49889',
  'adversarial': '#8f9a6f',
  'unscored': '#999999'
};

const TIER_LABELS = {
  'pro_establishment': 'Govt',
  'institutional': 'Mainstream',
  'adversarial': 'Watchdog',
  'unscored': 'Unscored'
};

const TAB_TO_KEY = {
  'All': 'all',
  'Watchdog': 'adversarial',
  'Mainstream': 'institutional',
  'Govt': 'pro_establishment',
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



function OwnershipBadge({ outlet }) {
  if (!outlet || !outlet.ownership_type) return null;
  const isWarning = outlet.party_proximity && outlet.party_proximity !== 'None';
  return (
    <BadgeWithTooltip label="Ownership" warning={isWarning}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Ownership</span>
        {outlet.ownership_type && (
          <span style={{
            background: outlet.ownership_type === 'Government' ? '#E74C3C' : outlet.ownership_type === 'Corporate' ? '#a49889' : '#2ECC71',
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
            background: outlet.ownership_transparency === 'High' ? '#2ECC71' : outlet.ownership_transparency === 'Medium' ? '#a49889' : '#E74C3C'
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
  'high': '#a49889',
  'critical': '#8f9a6f',
  'medium': '#f39c12',
  'low': '#2471a3'
};

const REGION_COLORS = {
  'North': '#2471A3',
  'Southwest': '#8f9a6f',
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

  const handleTrackRead = async (story) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const tierMap = {
        'pro_establishment': 'govt',
        'institutional': 'mainstream',
        'adversarial': 'watchdog'
      };
      const mappedTier = tierMap[story.outlet_coverage_tier];
      if (!mappedTier) return;
      
      const verdict = data?.cluster?.monitoring_spirit_live?.verdict;
      
      await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/reader/track-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          tier: mappedTier,
          verdict: (verdict === 'clear' || verdict === 'mixed') ? verdict : undefined
        })
      });
    } catch (err) {
      console.error('Failed to track read', err);
    }
  };

  // Signal prerender to wait
  if (typeof window !== 'undefined') {
    window.prerenderReady = false;
  }

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      if (typeof window !== 'undefined') {
        window.prerenderReady = true;
      }
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
        // Signal prerender the page is ready
        if (typeof window !== 'undefined') {
          window.prerenderReady = true;
        }
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
        if (typeof window !== 'undefined') {
          window.prerenderReady = true;
        }
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
    const isMainstream = avgScore > 34 && avgScore <= 69;
    const isIndependent = avgScore >= 70;

    return (
      <div style={{ marginBottom: '32px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Layer 2: Editorial Independence</h4>
        <div style={{ display: 'flex', height: '16px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
          <div style={{ flex: '1', background: isStatePR ? '#8f9a6f' : '#333' }} title={`State PR (0-34)`} />
          <div style={{ flex: '1', background: isMainstream ? '#a49889' : '#333' }} title={`Mainstream (35-69)`} />
          <div style={{ flex: '1', background: isIndependent ? '#008751' : '#333' }} title={`Independent (70-100)`} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span style={{ color: isStatePR ? '#8f9a6f' : '#888' }}>State PR</span>
          <span style={{ color: isMainstream ? '#a49889' : '#888' }}>Mainstream</span>
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

  // ADDITION 1: "Who broke the story?"
  const sortedStories = [...stories].sort((a, b) => {
    const tA = new Date(a.published_at || a.created_at).getTime();
    const tB = new Date(b.published_at || b.created_at).getTime();
    return tA - tB;
  });
  
  let firstOutlets = [];
  if (sortedStories.length > 0) {
    const earliestTime = new Date(sortedStories[0].published_at || sortedStories[0].created_at).getTime();
    const within30Mins = sortedStories.filter(s => {
      const t = new Date(s.published_at || s.created_at).getTime();
      return t - earliestTime <= 30 * 60 * 1000;
    });
    
    const seenOutlets = new Set();
    within30Mins.forEach(s => {
      if (s.outlet_name && !seenOutlets.has(s.outlet_name)) {
        seenOutlets.add(s.outlet_name);
        firstOutlets.push(s);
      }
    });
  }

  // ADDITION 2: "Geographic Coverage"
  const geoStats = { national: 0, regions: {} };
  const seenOutletsGeo = new Set();
  stories.forEach(s => {
    if (s.outlets_full && s.outlets_full.geopolitical_lean && s.outlet_name) {
      if (!seenOutletsGeo.has(s.outlet_name)) {
        seenOutletsGeo.add(s.outlet_name);
        const lean = s.outlets_full.geopolitical_lean;
        if (lean.toLowerCase() === 'national' || lean.toLowerCase() === 'federal') {
          geoStats.national++;
        } else {
          geoStats.regions[lean] = (geoStats.regions[lean] || 0) + 1;
        }
      }
    }
  });
  
  const totalRegional = Object.values(geoStats.regions).reduce((a, b) => a + b, 0);
  const totalGeo = geoStats.national + totalRegional;
  
  let geoSummary = "Sources are mostly National";
  if (totalRegional > geoStats.national) {
    geoSummary = "Sources are mostly Regional";
  }
  
  let skewedRegion = null;
  if (totalRegional > 0) {
    for (const [region, count] of Object.entries(geoStats.regions)) {
      if (count > totalRegional / 2) {
        skewedRegion = region;
        break;
      }
    }
  }

  const metaTitle = `${cluster.representative_title} | TraceNews`;
  
  // Derive description from first story
  // with a usable summary
  const firstSummary = (stories || [])
    .map(s => s.summary || '')
    .find(s => s.length > 20) || 
    "See every side of every Nigerian story.";
  let metaDesc = firstSummary
    .replace(/<[^>]+>/g, '')
    .trim();
  if (metaDesc.length > 155) {
    const truncated = metaDesc
      .substring(0, 155);
    metaDesc = truncated.substring(
      0, 
      Math.min(
        truncated.length, 
        truncated.lastIndexOf(" ")
      )
    ) + "...";
  }

  // Derive image from first story 
  // with a real image_url
  const metaImage = (stories || [])
    .map(s => s.image_url)
    .find(img => img && 
      !img.includes('logo') && 
      img.startsWith('http')
    ) || "https://tracenews.ng/og-default.png";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": cluster.representative_title,
    "datePublished": cluster.first_seen_at || 
      new Date().toISOString(),
    "dateModified": cluster.first_seen_at || 
      new Date().toISOString(),
    "image": [metaImage],
    "author": [{
      "@type": "Organization",
      "name": "TraceNews",
      "url": "https://tracenews.ng/"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "TraceNews",
      "logo": {
        "@type": "ImageObject",
        "url": "https://tracenews.ng/logo.png"
      }
    },
    "description": metaDesc,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://tracenews.ng/story/${cluster.slug}`
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:url" content={`https://tracenews.ng/story/${cluster.slug}`} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={metaImage} />
        <link rel="canonical" href={`https://tracenews.ng/story/${cluster.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
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
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--bg-surface)">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                  </svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(cluster.representative_title)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--bg-surface)">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(cluster.representative_title)}%20${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--bg-surface)">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="var(--bg-surface)">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                    <circle cx="4" cy="4" r="2" fill="var(--bg-surface)"/>
                  </svg>
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(cluster.representative_title)}&body=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--bg-surface)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </a>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopyTooltip(true); setTimeout(() => setCopyTooltip(false), 2000); }} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--text-primary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', padding: 0, position: 'relative' }}>
                  {copyTooltip ? <span style={{ position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-surface)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>Copied!</span> : null}
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--bg-surface)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 17H7A5 5 0 0 1 7 7h2"/>
                    <path d="M15 7h2a5 5 0 0 1 0 10h-2"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </button>
              </div>
              
              {/* Divider */}
              <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />
              
              {/* GROUP 2: Utilities */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => setIsBookmarked(!isBookmarked)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill={isBookmarked ? 'var(--text-primary)' : 'none'} stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                  </svg>
                </button>
                <button onClick={() => setIsFeedbackModalOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </button>
                <button onClick={() => console.log("show-me-less", cluster.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
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

          {/* Bias Comparison suppressed —
              Bridge Chambers ruling 
              9 Jul 2026. Feature returns 
              pending redesign with human 
              verification gate. */}
          <div style={{
            padding: '16px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            Coverage analysis by tier 
            is being updated. Check back 
            shortly.
          </div>

          {/* BAR 2: Article Filter Bar */}
          <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid #333', marginBottom: '24px', paddingBottom: '0' }}>
            {[
              { id: 'all', label: 'All', count: null },
              { id: 'pro_establishment', label: 'Govt', count: outletGroups['pro_establishment']?.length || 0 },
              { id: 'institutional', label: 'Mainstream', count: outletGroups['institutional']?.length || 0 },
              { id: 'adversarial', label: 'Watchdog', count: outletGroups['adversarial']?.length || 0 },
              ...(outletGroups['blog']?.length > 0 ? [{ id: 'blog', label: 'Blog', count: outletGroups['blog'].length }] : [])
            ].map(tab => {
              const isActive = activeFilterTab === tab.id;
              let borderColor = 'transparent';
              if (isActive) {
                if (tab.id === 'pro_establishment') borderColor = '#6d7f92';
                else if (tab.id === 'institutional') borderColor = '#a49889';
                else if (tab.id === 'adversarial') borderColor = '#8f9a6f';
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
              <div key={story.id} style={{ display: 'block' }}>
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    
                    <Link to={`/outlets/${story.outlet_slug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }} onClick={e => e.stopPropagation()}>
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
                    </Link>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <OwnershipBadge outlet={story.outlets || {}} />

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
                        
                        clean = clean.replace(/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s*\d{0,4}\s*[\(\[\{]?[a-z\s\.]+[\)\]\}]?\s*[—\-–:]\s*/i, '').trim();
                        
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
                    <a href={story.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }} onClick={() => handleTrackRead(story)}>
                      Read Full Article →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div style={{ width: '35%', flexShrink: 0, alignSelf: 'stretch', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
          
          <CoverageSidebar cluster={cluster} stories={stories} outletGroups={outletGroups} />

          {/* Monitoring Spirit Layer */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '24px', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: flags.length > 0 ? '20px' : '0' }}>
              <Info size={20} color="#a49889" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Monitoring Spirit</h3>
            </div>
            
            <MonitoringSignals
              coverageStats={cluster.coverage_stats || {}}
              stories={stories}
              compact={false}
            />
            
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

          {/* ADDITION 1: Who broke the story? */}
          {firstOutlets.length > 0 && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', color: 'var(--text-primary)', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Clock size={16} color="var(--text-muted)" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Who broke the story?</h3>
              </div>
              
              {firstOutlets.length === 1 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {firstOutlets[0].outlet_logo_url && (
                    <img src={firstOutlets[0].outlet_logo_url} alt="" style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }} />
                  )}
                  <span style={{ fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{firstOutlets[0].outlet_name}</span> broke this story <span style={{ color: 'var(--text-muted)' }}>{formatTimeAgo(firstOutlets[0].published_at || firstOutlets[0].created_at)}</span>
                  </span>
                </div>
              ) : (
                <div style={{ fontSize: '13px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{firstOutlets[0].outlet_name}</span> and <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{firstOutlets[1].outlet_name}</span> were first to cover this story
                </div>
              )}
            </div>
          )}

          {/* ADDITION 2: Geographic Coverage */}
          {totalGeo > 0 && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', color: 'var(--text-primary)', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={16} color="var(--text-muted)" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>Geographic Coverage</h3>
              </div>
              <div style={{ fontSize: '13px', marginBottom: totalRegional > 0 ? '8px' : '0' }}>
                {geoSummary}
              </div>
              {totalRegional > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {geoStats.national} national · {totalRegional} regional outlets
                  {skewedRegion && (
                    <div style={{ marginTop: '4px' }}>
                      Coverage skewed toward {skewedRegion} outlets
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
                  <option value="Watchdog">Watchdog</option>
                  <option value="Mainstream">Mainstream</option>
                  <option value="Govt">Govt</option>
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
