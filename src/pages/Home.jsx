import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle } from 'lucide-react';
import CoverageBar, { getDominantTier } from '../components/CoverageBar';

import { REGION_COLORS, formatTimeAgo } from '../utils/helpers';
import CoverageBreadthCard from '../components/CoverageBreadthCard';
import HeroStoryCard from '../components/HeroStoryCard';
import StandardStoryItem from '../components/StandardStoryItem';
import CompactStoryItem from '../components/CompactStoryItem';
import CategorySection from '../components/CategorySection';

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
  const [briefingData, setBriefingData] = useState(null);
  const [loadingBriefing, setLoadingBriefing] = useState(true);

  useEffect(() => {
    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/daily-briefing')
      .then(r => r.json())
      .then(d => {
        if (d.stories && d.stories.length) {
          setBriefingData(d)
        }
        setLoadingBriefing(false)
      })
      .catch(() => setLoadingBriefing(false))
  }, [])

  useEffect(() => {
    // 1. Fetch immediate top fold
    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/landing?limit=15')
      .then(r => r.json())
      .then(data => {
        const topClusters = data.clusters || [];
        setClusters(topClusters);
        setLoadingTop(false);
        
        // 2. Stream in the rest of the content seamlessly
        fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/feed?offset=15&limit=65')
          .then(r => r.json())
          .then(feedData => {
            const feedClusters = feedData.clusters || [];
            setClusters(prev => {
              const ids = new Set(prev.map(c => c.id));
              const newFeed = feedClusters.filter(c => !ids.has(c.id));
              return [...prev, ...newFeed];
            });
          })
          .catch(e => console.error("Secondary fetch failed", e));
      })
      .catch(() => setLoadingTop(false));
  }, []);

  const heroCluster = loadingTop ? null : clusters[0];
  const topNews = loadingTop ? Array(5).fill(null) : clusters.slice(2, 7);
  const standardFeed = loadingTop ? Array(5).fill(null) : clusters.slice(7, 12);

  const briefingStory = briefingData?.stories?.[0] || null;
  const briefingOthers = briefingData?.stories?.slice(1, 4) || [];
  
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
    "description": "See every side of every Nigerian story. Media bias tracking, fact-checking and misinformation detection for Nigeria."
  };

  return (
    <div className="page">
      <Helmet>
        <title>TraceNews — Nigerian Media Intelligence</title>
        <meta name="description" content="See every side of every Nigerian story. Media bias tracking, fact-checking and misinformation detection for Nigeria." />
        <meta property="og:title" content="TraceNews — Nigerian Media Intelligence" />
        <meta property="og:description" content="See every side of every Nigerian story. Media bias tracking, fact-checking and misinformation detection for Nigeria." />
        <meta property="og:image" content="https://tracenews.ng/og-default.png" />
        <meta property="og:url" content="https://tracenews.ng/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TraceNews — Nigerian Media Intelligence" />
        <meta name="twitter:description" content="See every side of every Nigerian story. Media bias tracking, fact-checking and misinformation detection for Nigeria." />
        <meta name="twitter:image" content="https://tracenews.ng/og-default.png" />
        <link rel="canonical" href="https://tracenews.ng/" />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      
      {/* PHASE 1: THE TOP FOLD */}
      <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex', marginBottom: '60px', alignItems: 'flex-start', marginTop: '26px' }}>
        
        {/* LEFT COLUMN: Daily Briefing & Top News */}
        <div style={{ width: '28%', flexShrink: 0, paddingRight: '32px', borderRight: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Daily Briefing</h2>
          {loadingBriefing ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px', height: '350px' }}>
              <div style={{ width: '100%', height: '160px', background: 'var(--bg-hover)' }}></div>
              <div style={{ padding: '16px' }}>
                <div style={{ width: '40%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '16px' }}></div>
                <div style={{ width: '90%', height: '18px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div style={{ width: '70%', height: '18px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px' }}></div>
                <div style={{ width: '100%', height: '14px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '6px' }}></div>
                <div style={{ width: '90%', height: '14px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
              </div>
            </div>
          ) : briefingStory ? (
            <div style={{ marginBottom: '32px' }}>
              <Link 
                to={`/daily-briefing/${briefingStory.cluster_slug}`}
                style={{ 
                  textDecoration: 'none',
                  display: 'block'
                }}
              >
                <div style={{ 
                  border: '1px solid var(--border)', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    width: '100%', 
                    height: '160px', 
                    background: 'var(--bg-hover)' 
                  }}>
                    {briefingStory.image_url && (
                      <img 
                        src={briefingStory.image_url} 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }} 
                        alt="" 
                      />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-muted)', 
                      marginBottom: '8px',
                      fontWeight: 600
                    }}>
                      {briefingStory.outlet_count} sources · {formatTimeAgo(briefingStory.first_seen_at)}
                    </div>
                    <h3 style={{ 
                      margin: '0 0 10px 0', 
                      fontSize: '16px', 
                      fontWeight: 700, 
                      lineHeight: 1.3, 
                      color: 'var(--text-primary)' 
                    }}>
                      {briefingStory.representative_title}
                    </h3>
                    {briefingStory.ground_summary?.whats_happening && (
                      <p style={{ 
                        fontSize: '13px', 
                        color: 'var(--text-muted)', 
                        lineHeight: 1.5, 
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {briefingStory.ground_summary.whats_happening}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
              
              {briefingOthers.length > 0 && (
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {briefingOthers.map(story => (
                    <Link
                      key={story.cluster_slug}
                      to={`/daily-briefing/${story.cluster_slug}`}
                      style={{ 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        padding: '4px 0'
                      }}
                    >
                      <span style={{ 
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                        marginTop: '1px'
                      }}>
                        →
                      </span>
                      <span style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {story.representative_title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}

        </div>

        {/* CENTER COLUMN: Hero & Standard Feed */}
        <div style={{ width: '72%', flexShrink: 0, paddingLeft: '32px' }}>
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
          { cat: 'Technology', type: 'COMPACT' },
          { cat: 'Religion', type: 'COMPACT' },
          { cat: 'Judiciary', type: 'STANDARD' },
          { cat: 'General', type: 'STANDARD' }
        ];
        
        const explicitList = ordered.map(o => o.cat);
        const remaining = validCategories.filter(c => !explicitList.includes(c)).map(c => ({ cat: c, type: 'STANDARD' }));
        const fullOrder = [...ordered, ...remaining];

        return fullOrder.filter(section => validCategories.includes(section.cat)).map((section, idx) => (
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
