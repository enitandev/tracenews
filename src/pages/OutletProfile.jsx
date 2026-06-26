import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CoverageBar from '../components/CoverageBar';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

const ALIGNMENT_MAP = {
  'pro_government': 'Government-aligned',
  'neutral': 'Editorially neutral',
  'opposition': 'Critical of government'
};

const ALIGNMENT_COLORS = {
  'pro_government': '#2980B9',
  'neutral': 'var(--text-secondary)',
  'opposition': '#C0392B'
};

const TIER_MAP = {
  'adversarial': 'Watchdog',
  'institutional': 'Mainstream',
  'pro_establishment': 'Govt'
};

const TIER_COLORS = {
  'adversarial': '#C0392B',
  'institutional': '#E67E22',
  'pro_establishment': '#2980B9'
};

const TRANSPARENCY_COLORS = {
  'high': '#27B060',
  'medium': '#E67E22',
  'low': '#C0392B'
};

export default function OutletProfile() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);

  useEffect(() => {
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/outlets/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '13px', color: 'var(--text-muted)' }}>
        Loading outlet profile...
      </div>
    );
  }

  if (error || !data || !data.outlet) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', fontFamily: 'var(--font-body)' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>Outlet not found.</p>
        <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>← Go back home</Link>
      </div>
    );
  }

  const outlet = data.outlet;
  const recent_stories = data.recent_stories || [];
  
  const score = outlet.independence_score !== null && outlet.independence_score !== undefined ? outlet.independence_score : 0;

  let rawTier = (outlet.credibility_tier || 'unscored').toLowerCase();

  const tierLabel = TIER_MAP[rawTier] || (rawTier.charAt(0).toUpperCase() + rawTier.slice(1));
  const tierColor = TIER_COLORS[rawTier] || 'var(--text-secondary)';

  const getInterpretation = () => {
    if (score >= 60) {
      return "placing it among Nigeria's most editorially independent outlets, with a consistent pattern of original accountability reporting.";
    } else if (score >= 50) {
      return "placing it at the upper end of Nigeria's commercial press — close to Watchdog but not yet showing the consistent accountability pattern that would push it above 60.";
    } else if (score >= 35) {
      return "placing it in the middle of Nigeria's commercial press, with editorial choices that balance independent reporting and institutional constraints.";
    } else {
      return "placing it among outlets whose editorial choices consistently defer to government or aligned interests.";
    }
  };

  const alignText = ALIGNMENT_MAP[outlet.government_alignment] || outlet.government_alignment || 'Unknown';
  const ownershipSentence = outlet.ownership_name ? `Owned by ${outlet.ownership_name}` : 'Ownership information not specified';
  const shortExplanation = `TraceNews scores ${outlet.name} as ${tierLabel} with a TII of ${score} — ${getInterpretation()}`;
  const summaryText = `${shortExplanation} ${ownershipSentence}. Government alignment: ${alignText}.`;

  const mediumText = Array.isArray(outlet.medium) ? outlet.medium.join(', ') : (outlet.medium || 'Digital');
  const cityText = outlet.headquarters_city || 'Nigeria';
  const reachText = outlet.audience_reach ? (outlet.audience_reach.charAt(0).toUpperCase() + outlet.audience_reach.slice(1)) : 'National';
  const yearText = outlet.founded_year || 'Unknown';

  let dotLeft = 0;
  if (score < 35) {
    dotLeft = (score / 35) * 35;
  } else if (score < 60) {
    dotLeft = 35 + ((score - 35) / 25) * 40;
  } else {
    dotLeft = 75 + ((score - 60) / 40) * 25;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{outlet.name} — Editorial Independence Score | TraceNews</title>
        <meta name="description" content={`TraceNews scores ${outlet.name} ${score}/100 for editorial independence — ${tierLabel} tier. Owned by ${outlet.ownership_name || 'Unknown'}. See recent coverage and methodology.`} />
        <meta property="og:title" content={`${outlet.name} | TraceNews`} />
        <meta property="og:url" content={`https://tracenews.ng/outlets/${outlet.slug}`} />
        <link rel="canonical" href={`https://tracenews.ng/outlets/${outlet.slug}`} />
      </Helmet>

      {/* HERO BAND */}
      <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {outlet.logo_url ? (
            <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', background: '#fff', border: '0.5px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={outlet.logo_url} alt={`${outlet.name} logo`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : (
            <div style={{ width: '72px', height: '72px', borderRadius: '10px', background: 'var(--bg-hover)', border: '0.5px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 600, color: 'var(--text-muted)' }}>
              {outlet.name.charAt(0)}
            </div>
          )}
          
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{outlet.name}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>
              {mediumText} · {cityText} · {reachText} reach · Est. {yearText}
            </p>
            {outlet.website && (
              <a href={outlet.website} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-secondary)', background: 'var(--bg-hover)', padding: '4px 8px', borderRadius: '4px', textDecoration: 'none', border: '0.5px solid var(--border)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                {outlet.website.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
          </div>
        </div>

        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '16px' }}>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
            {summaryText}
          </p>
        </div>
      </div>

      {/* SCORE ROW */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '32px', alignItems: 'center' }}>
        
        {/* Left: Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '52px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)', marginTop: '4px' }}>
              TII Score
            </div>
          </div>
          
          <div style={{
            background: `${tierColor}1A`, // 10% opacity
            border: `0.5px solid ${tierColor}4D`, // 30% opacity
            color: tierColor,
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
            textTransform: 'uppercase'
          }}>
            {tierLabel}
          </div>
        </div>

        {/* Right: Spectrum */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ fontSize: '11px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Position on the independence spectrum
          </div>
          
          {/* Bar */}
          <div style={{ display: 'flex', height: '32px', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: '35%', background: TIER_COLORS['pro_establishment'], display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
              Govt · 0–34
            </div>
            <div style={{ width: '40%', background: TIER_COLORS['institutional'], display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", borderLeft: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
              Mainstream · 35–59
            </div>
            <div style={{ width: '25%', background: TIER_COLORS['adversarial'], display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
              Watchdog · 60+
            </div>
          </div>

          {/* Dot Track */}
          <div style={{ position: 'relative', height: '20px' }}>
            <div style={{ position: 'absolute', top: '7px', left: 0, right: 0, height: '1px', background: 'var(--border)' }}></div>
            <div style={{
              position: 'absolute',
              top: 0,
              left: `calc(${dotLeft}% - 7px)`,
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: tierColor,
              boxShadow: '0 0 0 4px var(--bg-body)'
            }}></div>
            <div style={{
              position: 'absolute',
              top: '18px',
              left: `calc(${dotLeft}% - 10px)`,
              fontSize: '11px',
              fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
              fontWeight: 600,
              color: tierColor
            }}>
              {score}
            </div>

            {/* Axis labels */}
            <div style={{ position: 'absolute', top: '16px', left: '0%', transform: 'translateX(-50%)', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-muted)' }}>0</div>
            <div style={{ position: 'absolute', top: '16px', left: '25%', transform: 'translateX(-50%)', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-muted)' }}>25</div>
            <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-muted)' }}>50</div>
            <div style={{ position: 'absolute', top: '16px', left: '75%', transform: 'translateX(-50%)', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-muted)' }}>75</div>
            <div style={{ position: 'absolute', top: '16px', left: '100%', transform: 'translateX(-50%)', fontSize: '10px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-muted)' }}>100</div>
          </div>
        </div>
      </div>

      {/* THREE FACT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        
        {/* Card 1 */}
        <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Ownership</span>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Owner</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right', maxWidth: '180px', wordBreak: 'break-word' }} title={outlet.ownership_name}>{outlet.ownership_name || 'Unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Type</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{outlet.ownership_type ? (outlet.ownership_type.charAt(0).toUpperCase() + outlet.ownership_type.slice(1)) : 'Unknown'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transparency</span>
              <span style={{ fontWeight: 500, color: TRANSPARENCY_COLORS[outlet.ownership_transparency] || 'var(--text-primary)' }}>
                {outlet.ownership_transparency ? (outlet.ownership_transparency.charAt(0).toUpperCase() + outlet.ownership_transparency.slice(1)) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Editorial stance</span>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Govt alignment</span>
              <span style={{ fontWeight: 500, color: ALIGNMENT_COLORS[outlet.government_alignment] || 'var(--text-primary)' }}>
                {ALIGNMENT_MAP[outlet.government_alignment] || outlet.government_alignment || 'Unknown'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Geopolitical lean</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{outlet.geopolitical_lean || 'National'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Language</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{outlet.languages?.[0] || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-muted)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>About</span>
          </div>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Founded</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{yearText}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Medium</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{mediumText}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HQ</span>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cityText}</span>
            </div>
          </div>
        </div>

      </div>

      {/* BODY */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        
        {/* Left: Recent Coverage */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Recent coverage from {outlet.name}</h2>
            <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", color: 'var(--text-muted)' }}>
              {recent_stories.length} {recent_stories.length === 1 ? 'story' : 'stories'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recent_stories.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>No recent stories tracked for this outlet.</p>
            ) : (
              recent_stories.slice(0, visibleCount).map(story => (
                <Link key={story.id || story.url} to={`/story/${story.cluster_slug}`} style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: '0.5px solid var(--border)',
                  textDecoration: 'none',
                  color: 'inherit'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {story.cluster_category && (
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          padding: '1px 6px',
                          borderRadius: '3px',
                          background: 'var(--bg-hover)',
                          border: '0.5px solid var(--border)',
                          color: 'var(--text-secondary)'
                        }}>
                          {story.cluster_category}
                        </span>
                      )}
                      <span>
                        {story.cluster_outlet_count} sources · {timeAgo(story.published_at)}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, margin: '0 0 8px' }}>
                      {story.title}
                    </h3>
                    
                    {story.cluster_coverage_stats && (
                      <CoverageBar variant="compact" coverageStats={story.cluster_coverage_stats} />
                    )}
                  </div>
                  
                  {story.image_url && (
                    <div style={{ width: '88px', height: '66px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-hover)' }}>
                      <img src={story.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                </Link>
              ))
            )}
            
            {visibleCount < recent_stories.length && (
              <button
                onClick={() => setVisibleCount(recent_stories.length)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  background: 'var(--bg-elevated)',
                  border: '0.5px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Show all {recent_stories.length} stories
              </button>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ background: 'var(--bg-base)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>What this score means</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              {shortExplanation}.
            </p>
            <Link to="/methodology" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              How we compute this score →
            </Link>
          </div>

          <div style={{ background: 'var(--bg-base)', border: '0.5px solid var(--border)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Score details</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Last scored</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Jun 2026</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sample window</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>30 days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Score version</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>TII v1.1</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(192,57,43,0.04)', border: '0.5px solid rgba(192,57,43,0.15)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#C0392B' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Dispute this score</span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
              If you represent this outlet and believe this score relies on flawed sampling or incorrect data, we will review documented challenges.
            </p>
            <a href="mailto:methodology@tracenews.ng" style={{ fontSize: '13px', fontWeight: 600, color: '#C0392B', textDecoration: 'none' }}>
              methodology@tracenews.ng
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
