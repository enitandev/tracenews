import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle } from 'lucide-react';
import CoverageBar, { getDominantTier } from '../components/CoverageBar';

import { REGION_COLORS, formatTimeAgo } from '../utils/helpers';
import MonitoringAlertCard from '../components/MonitoringAlertCard';
import HeroStoryCard from '../components/HeroStoryCard';
import StandardStoryItem from '../components/StandardStoryItem';
import CompactStoryItem from '../components/CompactStoryItem';

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

function SkeletonMonitoringAlertCard() {
  return (
    <div style={{ borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-elevated)', marginBottom: '16px', border: '2px solid var(--border)', height: '300px' }}>
      <div style={{ width: '100%', height: '180px', background: 'var(--bg-hover)' }}></div>
      <div style={{ padding: '12px 14px 16px' }}>
        <div style={{ width: '40%', height: '18px', background: 'var(--border)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '80%', height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ width: '60%', height: '16px', background: 'var(--border)', borderRadius: '4px' }}></div>
      </div>
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
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
      <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex', marginBottom: '60px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Daily Briefing & Top News */}
        <div style={{ width: '28%', flexShrink: 0, paddingRight: '32px', borderRight: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Daily Briefing</h2>
          {loadingBriefing ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px', height: '350px' }}>
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
                  background: 'var(--bg-surface)', 
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
          
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Top News Stories</h2>
          {topNews.map((c, i) => c ? <CompactStoryItem key={c.id} cluster={c} /> : <SkeletonCompactStoryItem key={i} />)}
        </div>

        {/* CENTER COLUMN: Hero & Standard Feed */}
        <div style={{ width: '47%', flexShrink: 0, paddingLeft: '32px', paddingRight: '32px', borderRight: '1px solid var(--border)' }}>
          {heroCluster ? <HeroStoryCard cluster={heroCluster} /> : <SkeletonHeroStoryCard />}
          <div style={{ marginTop: '24px' }}>
            {standardFeed.map((c, i) => c ? <StandardStoryItem key={c.id} cluster={c} /> : <SkeletonStandardStoryItem key={i} />)}
          </div>
        </div>

        {/* RIGHT COLUMN: Monitoring Spirit */}
        <div style={{ width: '25%', flexShrink: 0, paddingLeft: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <AlertTriangle size={20} color="#e67e22" />
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)', margin: 0 }}>Monitoring Spirit</h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
            Our AI continuously monitors the Nigerian media ecosystem for unusual patterns, PR saturation, and verified coverage gaps.
          </p>
          
          {rightWidgets.map((c, i) => c ? <MonitoringAlertCard key={c.id} cluster={c} /> : <SkeletonMonitoringAlertCard key={i} />)}
          
          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '22px', marginBottom: '16px', color: 'var(--text-primary)' }}>My News Diet</h2>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '6px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>Anonymous User</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>0 Stories Read</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>Avg Independence Score</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>--/100</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>

              <button style={{ width: '100%', padding: '10px', marginTop: '24px', background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-bright)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Sign In to Track</button>
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2: INTERWOVEN CATEGORIES */}
      {validCategories.map((cat, index) => {
        const catStories = categories[cat];
        const catHero = catStories[0];
        const catStandard = catStories.slice(1, 4);
        
        const catAlerts = catStories.filter(c => c.monitoring_flags && c.monitoring_flags.length > 0);
        const catWidgets = catAlerts.length >= 2 ? catAlerts.slice(0, 2) : catStories.slice(4, 6);

        const allRemaining = clusters.slice(14).filter(c => !validCategories.includes(c.category || 'General'));
        const isFirstInterstitial = index === 0;
        const feedCount = isFirstInterstitial ? 6 : 5;
        const feedStartIndex = isFirstInterstitial ? 0 : 6 + (index - 1) * 5;
        const interstitialStories = allRemaining.slice(feedStartIndex, feedStartIndex + feedCount);

        return (
          <React.Fragment key={cat}>
            {/* CATEGORY BLOCK */}
            <div style={{ marginBottom: '60px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '28px', margin: 0, color: 'var(--text-primary)' }}>{cat} News</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-primary)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Follow</button>
                  <button style={{ padding: '8px 16px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-primary)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>Read More</button>
                </div>
              </div>
              
              <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex' }}>
                {/* Left 60%: Latest Category News */}
                <div style={{ width: '60%', paddingRight: '32px', borderRight: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)' }}>Latest {cat} News</h3>
                  {catHero && <HeroStoryCard cluster={catHero} />}
                  
                  <div style={{ marginTop: '24px' }}>
                    {catStandard.map(c => <StandardStoryItem key={c.id} cluster={c} />)}
                  </div>
                </div>
                
                {/* Right 40%: Category Alerts */}
                <div style={{ width: '40%', paddingLeft: '32px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)' }}>{cat} Spirit Alerts</h3>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {catWidgets.map(c => (
                      <div key={c.id} style={{ flex: 1 }}>
                        <MonitoringAlertCard cluster={c} />
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#2a2a2a', padding: '24px', borderRadius: '6px', color: '#fff', marginTop: '16px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Watchdog Report</h4>
                    <p style={{ fontSize: '13px', color: '#ccc', marginBottom: '16px' }}>Get the weekly {cat} Watchdog report sent to your inbox.</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="email" placeholder="Email address" style={{ flexGrow: 1, padding: '10px', background: '#444', border: '1px solid #555', color: '#fff', borderRadius: '4px' }} />
                      <button style={{ padding: '10px 16px', background: '#777', border: 'none', color: '#fff', fontWeight: 600, borderRadius: '4px', cursor: 'pointer' }}>Subscribe</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERSTITIAL BLOCK */}
            {interstitialStories.length > 0 && (
              <div style={{ marginBottom: '60px', borderTop: '2px solid var(--border-bright)', paddingTop: '32px' }}>
                <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex', gap: '48px' }}>
                  
                  {/* Left Column: Feed */}
                  <div style={{ width: isFirstInterstitial ? '65%' : '100%' }}>
                    <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '28px', marginBottom: '32px', color: 'var(--text-primary)' }}>
                      {isFirstInterstitial ? 'Latest Stories' : 'Latest News Stories'}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {interstitialStories.map(c => <StandardStoryItem key={c.id} cluster={c} />)}
                    </div>
                    {!isFirstInterstitial && (
                      <button style={{ marginTop: '24px', padding: '10px 24px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--text-primary)', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                        View More
                      </button>
                    )}
                  </div>

                  {/* Right Column: Similar News Topics */}
                  {isFirstInterstitial && (
                    <div style={{ width: '35%' }}>
                      <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '24px', marginBottom: '32px', color: 'var(--text-primary)' }}>Similar News Topics</h2>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {validCategories.slice(1, 8).map(topicCat => {
                          const catHeroImage = categories[topicCat][0]?.image_url;
                          return (
                            <div key={topicCat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-hover)', overflow: 'hidden', flexShrink: 0 }}>
                                  {catHeroImage && <img src={catHeroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={topicCat} />}
                                </div>
                                <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{topicCat}</span>
                              </div>
                              <span style={{ fontSize: '20px', fontWeight: 400, color: 'var(--text-primary)' }}>+</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}

    </div>
  );
}
