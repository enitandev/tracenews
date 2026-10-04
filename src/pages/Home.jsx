import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle } from 'lucide-react';
import CoverageBar, { getDominantTier } from '../components/CoverageBar';

import { REGION_COLORS } from '../utils/helpers';
import CoverageBreadthCard from '../components/CoverageBreadthCard';
import HeroStoryCard from '../components/HeroStoryCard';
import StandardStoryItem from '../components/StandardStoryItem';
import CompactStoryItem from '../components/CompactStoryItem';
import CategorySection from '../components/CategorySection';
import { BRIEFING_PUBLIC } from '../constants/features';
import { fetchJSON } from '../utils/fetchJSON';

// First list's order wins; the second adds only stories not already shown.
function mergeClusters(first, second) {
  const ids = new Set(first.map(c => c.id));
  return [...first, ...second.filter(c => !ids.has(c.id))];
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';

// The Daily Briefing column: the day's first item as a card (image, headline,
// first point of the AI-generated summary) and the next three headlines. The
// text is the Briefing API's own; nothing is rewritten here. Hidden when the
// Briefing is off or has nothing to show.
function BriefingColumn({ state }) {
  const bar = (w, h, bg = 'var(--bg-hover)') => <div style={{ width: w, height: h, background: bg, borderRadius: '4px', marginBottom: '8px' }} />;
  if (state.loading) {
    return (
      <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px' }}>
        <div style={{ width: '100%', height: '160px', background: 'var(--bg-hover)' }} />
        <div style={{ padding: '16px' }}>{bar('90%', '18px', 'var(--border)')}{bar('70%', '18px', 'var(--border)')}{bar('100%', '14px')}{bar('85%', '14px')}</div>
      </div>
    );
  }
  const { items, ui } = state.data;
  const [first, ...rest] = items;
  return (
    <div style={{ marginBottom: '32px' }}>
      <Link to={`/daily-briefing/${first.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
          {first.image_url && (
            <div style={{ width: '100%', height: '160px', overflow: 'hidden', background: 'var(--bg-hover)' }}>
              <img referrerPolicy="no-referrer" src={first.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                   onError={e => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)' }}>{first.title}</h3>
            {first.bullets?.[0] && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {first.bullets[0]}
              </p>
            )}
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px', fontWeight: 600 }}>{ui.attribution_label}</div>
          </div>
        </div>
      </Link>
      {rest.slice(0, 3).map(item => (
        <Link key={item.slug} to={`/daily-briefing/${item.slug}`}
              style={{ textDecoration: 'none', display: 'flex', gap: '8px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4, padding: '4px 0' }}>
          <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>→</span>
          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</span>
        </Link>
      ))}
      <Link to="/daily-briefing" style={{ display: 'inline-block', marginTop: '12px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
        {`All of today's ${ui.title} →`}
      </Link>
    </div>
  );
}

// --- SKELETON COMPONENTS ---

function SkeletonHeroStoryCard() {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ width: '100%', height: '340px', background: 'var(--bg-hover)', borderRadius: '4px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: '36px', left: '20px', right: '20px' }}>
          <div style={{ width: '80%', height: '28px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }}></div>
          <div style={{ width: '60%', height: '28px', background: 'var(--border)', borderRadius: '4px' }}></div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ width: '20%', height: '14px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}

function SkeletonStandardStoryItem() {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '16px 0', display: 'flex', gap: '16px' }}>
      <div style={{ flexGrow: 1 }}>
        <div style={{ width: '25%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '90%', height: '20px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ width: '75%', height: '20px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px' }}></div>
      </div>
      <div style={{ width: '120px', height: '90px', flexShrink: 0, background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
    </div>
  );
}

function SkeletonCompactStoryItem() {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: '85%', height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }}></div>
      <div style={{ width: '60%', height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px' }}></div>
    </div>
  );
}

export default function Home() {
  const [clusters, setClusters] = useState([]);
  const [loadingTop, setLoadingTop] = useState(true);
  const [briefing, setBriefing] = useState(BRIEFING_PUBLIC ? { loading: true } : { hidden: true });

  useEffect(() => {
    if (!BRIEFING_PUBLIC) return;
    fetchJSON(`${API_BASE}/daily-briefing`)
      .then(d => setBriefing(d.items && d.items.length ? { data: d } : { hidden: true }))
      .catch(err => { console.error('Daily Briefing column failed to load:', err); setBriefing({ hidden: true }); });
  }, []);
  useEffect(() => {
    // The top of the page and the rest of the feed load side by side; each is
    // retried once before it gives up (src/utils/fetchJSON.js).
    let live = true;
    const top = fetchJSON(`${API_BASE}/clusters/landing?limit=15`);
    const rest = fetchJSON(`${API_BASE}/clusters/feed?offset=15&limit=65`);
    top
      .then(data => { if (live) setClusters(prev => mergeClusters(data.clusters || [], prev)); })
      .catch(err => console.error('Homepage top stories failed to load:', err))
      .finally(() => { if (live) setLoadingTop(false); });
    Promise.all([top.catch(() => null), rest])
      .then(([, feed]) => { if (live) setClusters(prev => mergeClusters(prev, feed.clusters || [])); })
      .catch(err => console.error('Homepage feed failed to load:', err));
    return () => { live = false; };
  }, []);

  const heroCluster = loadingTop ? null : clusters[0];
  const topNews = loadingTop ? Array(5).fill(null) : clusters.slice(2, 7);
  const standardFeed = loadingTop ? Array(5).fill(null) : clusters.slice(7, 12);

  
  // Monitoring Spirit Widget
  const alertClusters = loadingTop ? [] : clusters.filter(c => c.monitoring_flags && c.monitoring_flags.length > 0).slice(0, 2);
  const fallbackAlerts = loadingTop ? Array(2).fill(null) : clusters.slice(12, 14);
  const rightWidgets = loadingTop ? Array(2).fill(null) : (alertClusters.length > 0 ? alertClusters : fallbackAlerts);

  const categories = {};
  clusters.slice(14).forEach(c => {
    if (!c || !c.image_url) return;
    const catName = c.category || 'General';
    if (!categories[catName]) categories[catName] = [];
    categories[catName].push(c);
  });
  const validCategories = Object.keys(categories).filter(cat => categories[cat].length >= 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "TraceNews",
    "url": "https://tracenews.ng/",
    "logo": "https://tracenews.ng/logo.png",
    "sameAs": [
      "https://twitter.com/TraceNewsNG"
    ],
    "description": "See every side of every Nigerian story. TraceNews tracks how Nigerian news outlets cover each story."
  };

  return (
    <div className="page">
      <Helmet>
        <title>TraceNews — Nigerian Media Intelligence</title>
        <meta name="description" content="See every side of every Nigerian story. TraceNews tracks how Nigerian news outlets cover each story." />
        <meta property="og:title" content="TraceNews — Nigerian Media Intelligence" />
        <meta property="og:description" content="See every side of every Nigerian story. TraceNews tracks how Nigerian news outlets cover each story." />
        <meta property="og:image" content="https://tracenews.ng/og-default.png" />
        <meta property="og:url" content="https://tracenews.ng/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TraceNews — Nigerian Media Intelligence" />
        <meta name="twitter:description" content="See every side of every Nigerian story. TraceNews tracks how Nigerian news outlets cover each story." />
        <meta name="twitter:image" content="https://tracenews.ng/og-default.png" />
        <link rel="canonical" href="https://tracenews.ng/" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      {/* PHASE 1: THE TOP FOLD */}
      <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex', marginBottom: '60px', alignItems: 'flex-start', marginTop: '26px' }}>
        
        {!briefing.hidden && (
          <div style={{ width: '28%', flexShrink: 0, paddingRight: '32px', borderRight: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>
              <Link to="/daily-briefing" style={{ color: 'inherit', textDecoration: 'none' }}>Daily Briefing</Link>
            </h2>
            <BriefingColumn state={briefing} />
          </div>
        )}
        {/* CENTER COLUMN: Hero & Standard Feed */}
        <div style={{ width: briefing.hidden ? '100%' : '72%', flexShrink: 0, paddingLeft: briefing.hidden ? 0 : '32px' }}>
          {heroCluster ? <HeroStoryCard cluster={heroCluster} /> : <SkeletonHeroStoryCard />}
          <div style={{ marginTop: '24px' }}>
            {standardFeed.map((c, i) => c ? <StandardStoryItem key={c.id} cluster={c} /> : <SkeletonStandardStoryItem key={i} />)}
          </div>
        </div>
      </div>

      {/* PHASE 2: SECTION RHYTHM */}
      {(() => {
        const ordered = [
          { cat: 'Politics', type: 'LEAD' },
          { cat: 'Economy', type: 'STANDARD' },
          { cat: 'Sports', type: 'STANDARD' },
          { cat: 'Entertainment', type: 'STANDARD' },
          { cat: 'Security', type: 'LEAD' },
          { cat: 'Health', type: 'STANDARD' },
          { cat: 'Education', type: 'STANDARD' },
          { cat: 'International', type: 'STANDARD' },
          { cat: 'Technology', type: 'STANDARD' },
          { cat: 'Religion', type: 'STANDARD' },
          { cat: 'Judiciary', type: 'STANDARD' },
          { cat: 'General', type: 'STANDARD' }
        ];
        
        const explicitList = ordered.map(o => o.cat);
        const remaining = validCategories.filter(c => !explicitList.includes(c)).map(c => ({ cat: c, type: 'STANDARD' }));
        const fullOrder = [...ordered, ...remaining];

        return fullOrder.filter(section => section.type === 'COMPACT' || validCategories.includes(section.cat)).map((section, idx) => (
          <CategorySection 
            key={`${section.cat}-${idx}`} 
            catName={section.cat} 
            treatment={section.type} 
            stories={categories[section.cat]} 
          />
        ));
      })()}
    </div>
  );
}
