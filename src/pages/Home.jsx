import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import CoverageBar, { getDominantTier } from '../components/CoverageBar';

const REGION_COLORS = {
  'North': '#2471A3',
  'Southwest': '#C0392B',
  'Southeast': '#008751',
  'South-South': '#F39C12',
  'Niger Delta': '#F39C12',
  'National': '#888888',
  'Unknown': '#e5e5e5'
};

const SEVERITY_COLORS = {
  'high': '#e67e22',
  'critical': '#c0392b',
  'medium': '#f39c12',
  'low': '#2471a3'
};

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const TIER_LABELS = {
  'pro_establishment': 'Pro-Establishment',
  'institutional': 'Institutional',
  'adversarial': 'Adversarial',
  'unscored': 'Unscored'
};

// --- REUSABLE COMPONENTS ---


function MonitoringAlertCard({ cluster }) {
  const flags = cluster.monitoring_flags || [];
  const primaryFlag = flags[0] || { type: 'CLEAN', severity: 'low', message: 'No anomalies detected.' };
  const alertColor = primaryFlag.type === 'CLEAN' ? 'var(--border)' : (SEVERITY_COLORS[primaryFlag.severity] || '#e5e5e5');
  const [imgError, setImgError] = useState(false);

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        border: `2px solid ${alertColor}`,
        borderRadius: '8px',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        <div style={{ width: '100%', height: '180px', background: 'var(--bg-hover)', position: 'relative' }}>
          {cluster.image_url && !imgError ? (
            <img 
              src={cluster.image_url} 
              alt={cluster.representative_title}
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', color: 'var(--text-muted)' }}>TraceNews</div>
          )}
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '12px 14px 16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{
              background: alertColor,
              color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap'
            }}>
              {primaryFlag.type.replace('_', ' ')}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '11px', color: 'var(--text-muted)' }}>{cluster.outlet_count} sources</span>
          </div>
          <div style={{ fontFamily: '"Merriweather", serif', fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '12px' }}>
            {cluster.representative_title}
          </div>
          {primaryFlag.type !== 'CLEAN' && (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 'auto', background: 'var(--bg-hover)', padding: '8px', borderRadius: '4px', borderLeft: `3px solid ${alertColor}` }}>
              {primaryFlag.message}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function HeroStoryCard({ cluster }) {
  const stats = cluster.coverage_stats || {};
  const [imgError, setImgError] = useState(false);
  const domTier = getDominantTier(stats.coverage_tier_distribution);
  const borderColor = COVERAGE_TIER_COLORS[domTier] || 'var(--border)';
  const hasAlerts = cluster.monitoring_flags?.length > 0;

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', marginBottom: '24px' }}>
      <div style={{ width: '100%', height: '340px', position: 'relative', background: 'var(--bg-hover)', overflow: 'hidden' }}>
        {cluster.image_url && !imgError && (
           <img src={cluster.image_url} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="hero" />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)' }}></div>
        
        {hasAlerts && (
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-surface)', padding: '8px', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', display: 'flex', zIndex: 10 }}>
            <AlertTriangle size={20} color="#c0392b" />
          </div>
        )}

        <h2 style={{ position: 'absolute', bottom: '36px', left: '20px', right: '20px', color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '28px', lineHeight: 1.2, margin: 0, paddingBottom: '16px' }}>
          {cluster.representative_title}
        </h2>
        
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <CoverageBar variant="hero" coverageStats={stats} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {cluster.category || 'General'} • {cluster.outlet_count} sources
        </div>
      </div>
    </Link>
  );
}

function StandardStoryItem({ cluster }) {
  const [imgError, setImgError] = useState(false);
  const hasAlerts = cluster.monitoring_flags?.length > 0;

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderBottom: '1px solid var(--border)', padding: '16px 0' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{cluster.category || 'General'} • {cluster.outlet_count} sources</span>
            {hasAlerts && <AlertTriangle size={12} color="#c0392b" />}
          </div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)', margin: '0 0 12px 0', lineHeight: 1.3 }}>
            {cluster.representative_title}
          </h3>
          <div style={{ marginTop: '0px' }}>
            <CoverageBar variant="compact" coverageStats={cluster.coverage_stats} />
          </div>
        </div>
        {cluster.image_url && !imgError && (
          <div style={{ width: '120px', height: '90px', flexShrink: 0, background: 'var(--bg-hover)' }}>
            <img src={cluster.image_url} onError={() => setImgError(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
          </div>
        )}
      </div>
    </Link>
  );
}

function CompactStoryItem({ cluster }) {
  const hasAlerts = cluster.monitoring_flags?.length > 0;

  return (
    <Link to={`/story/${cluster.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{ flexGrow: 1 }}>
          <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
            {cluster.representative_title}
          </h4>
          <div style={{ marginTop: '12px' }}>
            <CoverageBar variant="compact" coverageStats={cluster.coverage_stats} />
          </div>
        </div>
        {hasAlerts && <AlertTriangle size={14} color="#c0392b" style={{ flexShrink: 0, marginTop: '2px' }} />}
      </div>
    </Link>
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
  const briefingCluster = loadingTop ? null : clusters[1];
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

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* PHASE 1: THE TOP FOLD */}
      <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex', marginBottom: '60px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN: Daily Briefing & Top News */}
        <div style={{ width: '28%', flexShrink: 0, paddingRight: '32px', borderRight: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '24px', marginBottom: '16px', color: 'var(--text-primary)' }}>Daily Briefing</h2>
          {loadingTop ? (
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
          ) : briefingCluster ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px' }}>
              <div style={{ width: '100%', height: '160px', background: 'var(--bg-hover)' }}>
                {briefingCluster.image_url && <img src={briefingCluster.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="briefing" />}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>{briefingCluster.outlet_count} stories • 5m read</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, lineHeight: 1.3, color: 'var(--text-primary)' }}>{briefingCluster.representative_title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>A major development today regarding {(briefingCluster.category || 'General').toLowerCase()} that is dominating the news cycle across {briefingCluster.outlet_count} different outlets.</p>
              </div>
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
