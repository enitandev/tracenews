import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Newspaper } from 'lucide-react';
import { Tag } from '../components/ds/Marks';
import { ROUTES } from '../constants/routes';
import { TIERS, TIER_COLORS, TIER_LABELS } from '../utils/constants';
import { getDistinctScoredCount } from '../utils/helpers';


const CATEGORY_DISPLAY = {
  Legislature: "Legislator",
  Governor: "Governor",
  Security: "Security official",
  Executive: "Executive official",
  Party: "Party official",
  Judiciary: "Judicial official",
  PowerBroker: "Political figure",
  CivilSociety: "Civil society figure",
  Traditional: "Traditional ruler",
  Business: "Business figure"
};

const FORBIDDEN_TOKENS = [
  "pro-government", "regime-friendly",
  "anti-government", "dominate",
  "dominates", "dominated",
  "scrutinis", "favourable", "favorable",
  "critical coverage", "negative coverage",
  "positive coverage", "biased",
  "sentiment", "verdict"
];

function assertNoForbiddenTokens(str) {
  const hay = str.toLowerCase();
  for (const tok of FORBIDDEN_TOKENS) {
    if (hay.includes(tok)) {
      console.error(`Forbidden token "${tok}" in string: ${str}`);
    }
  }
  return str;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function getInitials(name) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// Counts only (counsel, 3 Oct 2026): articles naming the person, by the tier
// of the outlet that published each one, as of a stated date. No percentages.
function articleCountsText(name, counts, total, asOf) {
  const g = counts.govt_aligned || 0;
  const m = counts.mainstream || 0;
  const w = counts.watchdog || 0;
  const u = counts.untiered || 0;
  return assertNoForbiddenTokens(
    `As of ${asOf}, TraceNews has recorded ${total} articles that name ${name}: ${g} from government-aligned outlets, ${m} from mainstream outlets and ${w} from watchdog outlets` +
    (u ? `, and ${u} from outlets not assigned a tier.` : '.')
  );
}

export default function PoliticianProfile() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [gone, setGone] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);

  useEffect(() => {
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/politicians/${slug}`)
      .then(res => {
        if (res.status === 404 || res.status === 410) {
          setGone(true);
          setLoading(false);
          return null;
        }
        if (!res.ok) {
          throw new Error('Not found');
        }
        return res.json();
      })
      .then(d => {
        if (!d) return;
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 24px', fontFamily: 'var(--font-body)', color: 'var(--text-muted)' }}>
        Loading coverage record...
      </div>
    );
  }

  if (gone) {
    return (
      <div style={{
        maxWidth: '680px',
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-body)'
      }}>
        <p style={{
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '.12em',
          color: '#a49889',
          marginBottom: '16px'
        }}>Page removed</p>
        <h1 style={{
          fontFamily: 'Spectral, Georgia, serif',
          fontSize: '28px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '16px'
        }}>
          This page is no longer available
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: '24px'
        }}>
          This coverage record has been permanently withdrawn.
        </p>
        <a href="/" style={{
          color: '#a49889',
          fontSize: '14px',
          textDecoration: 'none'
        }}>← Return to TraceNews</a>
      </div>
    );
  }

  if (error || !data || !data.politician) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 24px', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Politician not found.</h2>
        <Link to={ROUTES.HOME} style={{ color: '#a49889', textDecoration: 'none', fontWeight: 600 }}>Return to homepage →</Link>
      </div>
    );
  }

  const { politician, total_articles: total_story_count, article_counts, as_of, recent_stories } = data;
  const name = politician.common_name || politician.full_name || '';
  const total = total_story_count || 0;
  
  const title = assertNoForbiddenTokens(`${name} — Media Coverage Record | TraceNews`);
  const description = assertNoForbiddenTokens(
    `Articles naming ${name} recorded by TraceNews as of ${as_of}: ${total}, counted by the editorial tier of the publishing outlet. This page describes coverage, not the person.`
  );


  // Compute most common category
  let topCategory = '—';
  if (recent_stories && recent_stories.length > 0) {
    const cats = {};
    recent_stories.forEach(s => {
      const c = s.cluster_category;
      if (c) cats[c] = (cats[c] || 0) + 1;
    });
    const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) topCategory = sorted[0][0];
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://tracenews.ng/politicians/${slug}`} />
      </Helmet>

      {/* 2. HERO BAND */}
      <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '24px 28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ width: '72px', height: '72px', flexShrink: 0 }}>
            {politician.wikipedia_image_url ? (
              <img referrerPolicy="no-referrer" src={politician.wikipedia_image_url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', borderRadius: '10px', background: 'var(--bg-accent)', color: 'var(--text-accent)', fontSize: '22px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getInitials(name)}
              </div>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{name}</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{politician.current_position || 'Nigerian Politician'}</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {politician.party && <span style={{ background: 'rgba(180, 160, 130, 0.12)', border: '1px solid rgba(180, 160, 130, 0.25)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--text-primary)' }}>{politician.party}</span>}
              {politician.state && <span style={{ background: 'rgba(180, 160, 130, 0.12)', border: '1px solid rgba(180, 160, 130, 0.25)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--text-primary)' }}>{politician.state} State</span>}
              {politician.category && <span style={{ background: 'rgba(180, 160, 130, 0.12)', border: '1px solid rgba(180, 160, 130, 0.25)', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: 'var(--text-primary)' }}>{CATEGORY_DISPLAY[politician.category] || politician.category}</span>}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '16px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px' }}>
            This page describes how Nigerian media has covered stories mentioning this person. Every figure is a fact about coverage, not a judgement about the person or any outlet.
          </p>
          <Link to="/methodology" style={{ fontSize: '13px', color: '#a49889', textDecoration: 'none', fontWeight: 600 }}>How TraceNews classifies outlets →</Link>
        </div>
      </div>

      {/* 3. STORY COUNT + DISTRIBUTION ROW */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* LEFT */}
        <div style={{ flex: '1 1 300px', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '52px', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
            {total_story_count}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-primary)', marginTop: '8px', fontWeight: 600 }}>
            Articles naming this person
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            as of {as_of}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: '2 1 500px', background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>
            Articles by outlet tier
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
            {[['govt_aligned', 'Government-aligned'], ['mainstream', 'Mainstream'], ['watchdog', 'Watchdog'], ['untiered', 'Not assigned a tier']].map(([key, label]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border)', paddingBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TIER_COLORS[key] || 'var(--text-muted)' }} /> {label}
                </span>
                <span style={{ fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-primary)' }}>{article_counts?.[key] ?? 0}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {articleCountsText(name, article_counts || {}, total_story_count, as_of)}
          </p>
        </div>
      </div>

      {/* 4. THREE FACT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {/* Card 1 */}
        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>Political Identity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Party</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{politician.party || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>State</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{politician.state || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Region</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{politician.geopolitical_region || '—'}</div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>Coverage Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Articles naming this person</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{total_story_count}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top category</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{topCategory}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>As of</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>{as_of}</div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 600, textTransform: 'uppercase' }}>Position</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Current role</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{politician.current_position || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Category</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600 }}>{CATEGORY_DISPLAY[politician.category] || politician.category || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified</div>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>27 Jun 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BODY */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* LEFT */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '20px', fontFamily: 'Spectral, Georgia, serif', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Stories mentioning {name}</h2>
            <span style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-muted)' }}>
              showing {Math.min(visibleCount, recent_stories.length)} of {total_story_count}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recent_stories.slice(0, visibleCount).map((story, i) => (
              <Link key={i} to={`/story/${story.cluster_slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {story.cluster_category && (
                        <span style={{ padding: '2px 6px', background: 'var(--bg-hover)', borderRadius: '4px', color: 'var(--text-primary)' }}>
                          {story.cluster_category}
                        </span>
                      )}
                      <span>
                        {(() => {
                          const count = getDistinctScoredCount(story.cluster_coverage_stats);
                          return count !== null ? `${count} ${count === 1 ? 'source' : 'sources'} · ` : '';
                        })()}
                        {timeAgo(story.published_at)}
                      </span>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)' }}>
                      {story.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '4px'
                    }}>
                      {(() => {
                        const count = getDistinctScoredCount(story.cluster_coverage_stats);
                        if (count !== null) {
                          return `${count} ${count === 1 ? 'source' : 'sources'} covering this story`;
                        }
                        return '';
                      })()}
                    </div>
                  </div>
                  {story.image_url && (
                    <div style={{ width: '88px', height: '66px', flexShrink: 0 }}>
                      <img referrerPolicy="no-referrer" src={story.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                      <div style={{ width: '100%', height: '100%', display: 'none', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-hover)', color: 'var(--text-muted)', opacity: 0.2, borderRadius: '6px' }}>
                        <Newspaper size={48} />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          {visibleCount < recent_stories.length && (
            <button 
              onClick={() => setVisibleCount(recent_stories.length)}
              style={{ width: '100%', padding: '12px', marginTop: '16px', background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Show all stories
            </button>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sidebar Card 1 */}
          <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>What this page shows</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              Articles recorded by TraceNews that name this person, counted by the editorial tier of the outlet that published each one. This page describes coverage — not the person, and not any outlet's editorial intent.<br/><br/>
              Counts as of {as_of}.
            </p>
            <Link to="/methodology" style={{ fontSize: '13px', color: '#a49889', textDecoration: 'none', fontWeight: 600 }}>How TraceNews classifies outlets →</Link>
          </div>

          {/* Sidebar Card 2 */}
          <div style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Coverage details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Articles naming this person</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{total_story_count}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>As of</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace" }}>{as_of}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Distribution threshold</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>25 stories minimum</span>
              </div>
            </div>
          </div>

          {/* Sidebar Card 3 */}
          <div style={{ background: 'rgba(192,57,43,0.04)', border: '1px solid rgba(192,57,43,0.15)', borderRadius: '12px', padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: '#8f9a6f' }}>Request a correction</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              If you believe something on this page is factually wrong — a wrong title, an out-of-date party, a miscounted figure — tell us and we will look into it promptly.
            </p>
            <Link to="/corrections" style={{ fontSize: '13px', color: '#8f9a6f', textDecoration: 'none', fontWeight: 600 }}>Request a correction →</Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
