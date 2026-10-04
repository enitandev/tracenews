import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Newspaper } from 'lucide-react';
import CoverageBar from '../components/CoverageBar';
import { TIER_COLORS } from '../utils/constants';

/**
 * The Daily Briefing story page. Each story gets its own full breakdown, in
 * the page's original layout: image, headline and coverage bar at the top;
 * What happened, Who said what and Background in the main column; outlet
 * counts and What happens next in the side column; and cards to the rest of
 * today's Briefing below.
 *
 * The content is the cleared Briefing (counsel, 3-4 Oct 2026): the
 * AI-generated summary of the sources, labelled as such, and outlet counts by
 * tier (counts only, never percentages). Every heading and label comes from
 * the API (tracenews-api app/briefingStrings.py). /daily-briefing shows the
 * first story of the day; /daily-briefing/:slug shows that story.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';
const TIERS = ['govt_aligned', 'mainstream', 'watchdog'];

function countedAt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const total = counts => TIERS.reduce((sum, t) => sum + ((counts || {})[t] || 0), 0);
const asStats = counts => ({ coverage_tier_distribution: counts || {} });

const H2 = { fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', margin: '40px 0 16px' };
const ITEM = { fontSize: '16px', lineHeight: 1.8, color: 'var(--text-primary)' };
const RULE = <div style={{ height: '1px', background: 'var(--border)', marginTop: '32px' }} />;

function Picture({ src, height, iconSize }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div style={{ width: '100%', height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-hover)', color: 'var(--text-muted)', borderRadius: '8px' }}>
        <Newspaper size={iconSize} style={{ opacity: 0.3 }} />
      </div>
    );
  }
  return <img referrerPolicy="no-referrer" src={src} alt="" onError={() => setFailed(true)}
              style={{ width: '100%', height, objectFit: 'cover', borderRadius: '8px', display: 'block' }} />;
}

function Bullets({ items }) {
  return (
    <ul style={{ listStyle: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '14px', margin: 0 }}>
      {items.map((b, i) => <li key={i} style={ITEM}>{b}</li>)}
    </ul>
  );
}

function CoveragePanel({ item, ui }) {
  const counts = item.coverage_counts || {};
  return (
    <div data-testid="coverage-panel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>{ui.coverage_heading}: {total(counts)}</div>
      <div style={{ borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
        <CoverageBar coverageStats={asStats(counts)} variant="hero" liveTotal={total(counts)} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {TIERS.map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: TIER_COLORS[t] }} />
              {ui.tier_labels[t]}
            </span>
            <b style={{ fontFamily: "'IBM Plex Mono', monospace", color: 'var(--text-primary)' }}>{counts[t] ?? 0}</b>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>{ui.coverage_as_of.replace('{time}', countedAt(item.counts_as_of))}</div>
      {ui.all_sources && (
        <Link to={`/story/${item.slug}`} style={{ display: 'block', textAlign: 'center', marginTop: '16px', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', textDecoration: 'none' }}>
          {ui.all_sources} →
        </Link>
      )}
    </div>
  );
}

/** One story's full breakdown. */
export function BriefingItem({ item, ui, more = [] }) {
  const heads = ui.sections || {};
  const bullets = (item.bullets || []).filter(b => typeof b === 'string');
  const quotes = item.sections?.quotes || [];
  const next = item.sections?.next || [];
  const background = item.sections?.background || [];
  return (
    <article data-testid="briefing-item">
      <div className="mobile-stack" style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* MAIN COLUMN */}
        <div style={{ width: 'calc(65% - 24px)' }}>
          <div className="mobile-stack" style={{ display: 'flex', gap: '24px', marginBottom: '8px' }}>
            <div style={{ width: '40%', flexShrink: 0 }}><Picture src={item.image_url} height="320px" iconSize={64} /></div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {[item.category, `${ui.coverage_heading}: ${total(item.coverage_counts)}`].filter(Boolean).join(' · ')}
              </div>
              <h1 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', margin: '0 0 24px 0' }}>
                {item.title}
              </h1>
              <div style={{ marginTop: 'auto', borderRadius: '6px', overflow: 'hidden' }}>
                <CoverageBar coverageStats={asStats(item.coverage_counts)} variant="hero" liveTotal={total(item.coverage_counts)} />
              </div>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '24px 0 0', fontFamily: "'IBM Plex Mono', monospace" }}>{ui.attribution_label}</p>

          <section data-testid="section-what-happened">
            <h2 style={{ ...H2, marginTop: '12px' }}>{heads.what_happened}</h2>
            <Bullets items={bullets} />
            {RULE}
          </section>

          {quotes.length > 0 && (
            <section data-testid="section-quotes">
              <h2 style={H2}>{heads.quotes}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quotes.map((q, i) => (
                  <blockquote key={i} style={{ margin: 0, padding: '16px 20px', borderLeft: '3px solid var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: '0 8px 8px 0', ...ITEM }}>
                    {q.line}
                  </blockquote>
                ))}
              </div>
              {RULE}
            </section>
          )}

          {background.length > 0 && (
            <section data-testid="section-background">
              <h2 style={H2}>{heads.background}</h2>
              <Bullets items={background} />
            </section>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '32px', fontSize: '13px' }}>
            <Link to={`/corrections?page=${encodeURIComponent(`/daily-briefing/${item.slug}`)}`} style={{ color: 'var(--text-secondary)' }}>{ui.correction_link}</Link>
            <Link to="/methodology#section-03" style={{ color: 'var(--text-secondary)' }}>{ui.methodology_link}</Link>
          </div>
        </div>

        <div className="hide-on-mobile" style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />

        {/* SIDE COLUMN */}
        <div role="complementary" style={{ width: 'calc(35% - 24px)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <CoveragePanel item={item} ui={ui} />
          {next.length > 0 && (
            <section data-testid="section-next">
              <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>{heads.next}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {next.map((n, i) => (
                  <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px', fontSize: '15px', lineHeight: 1.6, color: 'var(--text-primary)', background: 'var(--bg-elevated)' }}>{n}</div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {more.length > 0 && (
        <section data-testid="briefing-more" style={{ marginTop: '64px' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '24px' }}>{ui.more_heading}</div>
          <div className="briefing-more-grid">
            {more.map(m => (
              <Link key={m.slug} to={`/daily-briefing/${m.slug}`} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', padding: '12px' }}>
                  <div style={{ width: '120px', height: '90px', flexShrink: 0 }}><Picture src={m.image_url} height="90px" iconSize={28} /></div>
                  <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.title}</div>
                  </div>
                </div>
                <div style={{ padding: '0 12px 12px', marginTop: 'auto' }}>
                  <CoverageBar coverageStats={asStats(m.coverage_counts)} variant="compact" liveTotal={total(m.coverage_counts)} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

const block = (w, h, extra = {}) => <div style={{ width: w, height: h, background: 'var(--bg-hover)', borderRadius: '6px', ...extra }} />;

/** The page's shape while it loads, so nothing jumps when the content arrives. */
export function BriefingSkeleton() {
  return (
    <div data-testid="briefing-skeleton" aria-busy="true">
      {block('140px', '14px', { marginBottom: '28px' })}
      <div className="mobile-stack" style={{ display: 'flex', gap: '48px' }}>
        <div style={{ width: 'calc(65% - 24px)' }}>
          <div className="mobile-stack" style={{ display: 'flex', gap: '24px' }}>
            {block('40%', '320px', { flexShrink: 0, borderRadius: '8px' })}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {block('40%', '14px')}{block('100%', '40px')}{block('80%', '40px')}
              <div style={{ marginTop: 'auto' }}>{block('100%', '28px')}</div>
            </div>
          </div>
          {block('180px', '26px', { margin: '40px 0 20px' })}
          {[1, 2, 3, 4].map(i => <div key={i} style={{ marginBottom: '14px' }}>{block(`${100 - i * 6}%`, '16px')}</div>)}
        </div>
        <div className="hide-on-mobile" style={{ width: '1px', background: 'var(--border)' }} />
        <div style={{ width: 'calc(35% - 24px)' }}>{block('100%', '260px', { borderRadius: '8px' })}</div>
      </div>
    </div>
  );
}

export default function DailyBriefingStory() {
  const { slug } = useParams();
  // The state remembers which slug it was loaded for, so a new slug shows the
  // skeleton until its own data arrives.
  const [state, setState] = useState({ slug: undefined });

  useEffect(() => {
    let live = true;
    const url = slug ? `${API_BASE}/daily-briefing/${encodeURIComponent(slug)}` : `${API_BASE}/daily-briefing`;
    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (live) setState({ slug, data: d }); })
      .catch(err => { console.error('Daily Briefing failed to load:', err); if (live) setState({ slug, error: true }); });
    window.scrollTo(0, 0);
    return () => { live = false; };
  }, [slug]);

  const wrap = children => (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>{children}</div>
  );

  if (state.slug !== slug || (!state.data && !state.error)) return wrap(<BriefingSkeleton />);
  if (state.error || !state.data) {
    return wrap(
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>
        This briefing is not available. <Link to="/" style={{ color: 'var(--text-primary)' }}>Return to the homepage</Link>
      </p>
    );
  }

  const { ui } = state.data;
  // /daily-briefing opens the day's first story; the rest are the cards below.
  const item = slug ? state.data.item : state.data.items?.[0];
  const more = slug ? state.data.more || [] : (state.data.items || []).slice(1);
  if (!item) return wrap(<p style={{ color: 'var(--text-muted)' }}>{ui.empty}</p>);

  const description = `${ui.attribution_label}: ${(item.bullets || []).join(' ')}`.slice(0, 155);
  return wrap(
    <>
      <Helmet>
        <title>{`${item.title} | ${ui.title} | TraceNews`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://tracenews.ng/daily-briefing/${item.slug}`} />
      </Helmet>
      <Link to="/daily-briefing" style={{ display: 'inline-block', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '13px', marginBottom: '28px' }}>
        {ui.title}{state.data.date ? ` · ${new Date(state.data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
      </Link>
      <BriefingItem item={item} ui={ui} more={more} />
    </>
  );
}
