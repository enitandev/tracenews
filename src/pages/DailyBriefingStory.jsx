import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { TIER_COLORS } from '../utils/constants';

/**
 * Rebuilt Daily Briefing (counsel, 3 Oct 2026, section B). Each item is the
 * story's cleared event summary, labelled as AI-generated, with outlet counts
 * by tier beside it. Every label comes from the API (app/briefingStrings.py);
 * nothing user-facing is defined here. Routed only while BRIEFING_PUBLIC is on.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';
const TIERS = ['govt_aligned', 'mainstream', 'watchdog'];

function countedAt(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const H4 = { fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '18px 0 8px', fontWeight: 500 };
const LIST = { margin: '0 0 8px', paddingLeft: '20px', lineHeight: 1.6, color: 'var(--text-primary)', fontSize: '15px' };

// The fuller sections (counsel's ruling, 3 Oct 2026, item 6). Each heading and
// every word comes from the API; a section with nothing in it is not shown.
function Sections({ sections, ui }) {
  const heads = ui.sections || {};
  const quotes = sections?.quotes || [];
  const next = sections?.next || [];
  const background = sections?.background || [];
  return (
    <>
      {quotes.length > 0 && (
        <section data-testid="section-quotes">
          <h3 style={H4}>{heads.quotes}</h3>
          {quotes.map((q, i) => (
            <p key={i} style={{ margin: '0 0 10px', paddingLeft: '12px', borderLeft: '2px solid var(--border)', fontSize: '15px', lineHeight: 1.55, color: 'var(--text-primary)' }}>{q.line}</p>
          ))}
        </section>
      )}
      {next.length > 0 && (
        <section data-testid="section-next">
          <h3 style={H4}>{heads.next}</h3>
          <ul style={LIST}>{next.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </section>
      )}
      {background.length > 0 && (
        <section data-testid="section-background">
          <h3 style={H4}>{heads.background}</h3>
          <ul style={LIST}>{background.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </section>
      )}
    </>
  );
}

export function BriefingItem({ item, ui }) {
  const counts = item.coverage_counts || {};
  const total = TIERS.reduce((sum, t) => sum + (counts[t] || 0), 0);
  return (
    <article data-testid="briefing-item" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '20px', background: 'var(--bg-surface)' }}>
      {item.image_url && (
        <img src={item.image_url} alt="" referrerPolicy="no-referrer" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '6px', marginBottom: '16px' }} />
      )}
      <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '22px', margin: '0 0 6px', color: 'var(--text-primary)' }}>
        <Link to={`/story/${item.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.title}</Link>
      </h2>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px', fontFamily: "'IBM Plex Mono', monospace" }}>{ui.attribution_label}</p>
      {ui.sections?.what_happened && <h3 style={{ ...H4, marginTop: '4px' }}>{ui.sections.what_happened}</h3>}
      <ul style={{ ...LIST, margin: '0 0 8px' }}>
        {(item.bullets || []).filter(b => typeof b === 'string').map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <Sections sections={item.sections} ui={ui} />
      <div style={{ height: '8px' }} />
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>{ui.coverage_heading}: {total}</div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {TIERS.map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: TIER_COLORS[t] }} />
              {ui.tier_labels[t]} <b style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{counts[t] ?? 0}</b>
            </span>
          ))}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>{ui.coverage_as_of.replace('{time}', countedAt(item.counts_as_of))}</div>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '13px' }}>
        <Link to={`/corrections?page=${encodeURIComponent(`/daily-briefing/${item.slug}`)}`} style={{ color: 'var(--text-secondary)' }}>{ui.correction_link}</Link>
        <Link to="/methodology#section-03" style={{ color: 'var(--text-secondary)' }}>{ui.methodology_link}</Link>
      </div>
    </article>
  );
}

export default function DailyBriefingStory() {
  const { slug } = useParams();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    const url = slug ? `${API_BASE}/daily-briefing/${encodeURIComponent(slug)}` : `${API_BASE}/daily-briefing`;
    fetch(url)
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(d => setState({ loading: false, data: d }))
      .catch(() => setState({ loading: false, error: true }));
  }, [slug]);

  if (state.loading) return <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>…</div>;
  if (state.error || !state.data) return <div style={{ padding: '80px 20px', textAlign: 'center' }}><Link to="/">TraceNews home</Link></div>;

  const { ui } = state.data;
  const items = slug ? [state.data.item] : state.data.items;
  const first = items[0];
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>{slug && first ? `${first.title} | ${ui.title} | TraceNews` : `${ui.title} | TraceNews`}</title>
        {first && <meta name="description" content={`${ui.attribution_label}: ${(first.bullets || []).join(' ')}`} />}
      </Helmet>
      <h1 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '30px', margin: '0 0 24px', color: 'var(--text-primary)' }}>
        {slug ? <Link to="/daily-briefing" style={{ color: 'inherit', textDecoration: 'none' }}>{ui.title}</Link> : ui.title}
      </h1>
      {items.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>{ui.empty}</p> : items.map(item => <BriefingItem key={item.id} item={item} ui={ui} />)}
    </div>
  );
}
