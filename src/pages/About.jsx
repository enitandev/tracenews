import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';

export default function About() {
  // The footer and menu link to /about#contact; the router does not scroll to anchors.
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>About TraceNews | Nigerian Media Intelligence Platform</title>
        <meta name="description" content="TraceNews is a media intelligence platform that measures editorial independence across Nigerian news outlets. We analyse coverage patterns — we do not produce news." />
        <link rel="canonical" href="https://tracenews.ng/about" />
      </Helmet>

      {/* SECTION 1 — What TraceNews is */}
      <div>
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '11px', textTransform: 'uppercase', color: '#a49889', margin: '0 0 12px 0' }}>ABOUT TRACENEWS</p>
        <h1 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '36px', fontWeight: 600, margin: '0 0 24px 0', color: 'var(--text-primary)' }}>A media intelligence platform, not a news publisher</h1>
        
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          TraceNews measures editorial independence across Nigerian news outlets. We measure how outlets behave — who they quote and what they cover — and make those measurements publicly searchable.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          We do not produce news. We do not have reporters or editorial positions. We are an analytical instrument: we observe and measure what Nigerian media publishes, the same way an audiometer measures sound.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          Every score on this platform is derived from observable editorial behaviour in a sample of an outlet's stories from the past 30 days, using the same method for every outlet. Our methodology is public and fully documented.
        </p>
        
        <Link to="/methodology" style={{ fontSize: '14px', color: '#a49889', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: '8px' }}>
          Read the methodology →
        </Link>
      </div>

      {/* SECTION 2 — What we measure */}
      <div>
        <h2 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '16px', color: 'var(--text-primary)' }}>What we measure</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          The TraceNews Independence Index (TII) scores outlets from 0 to 100 on six behavioural signals — who gets quoted, how much reads as original reporting, how often an outlet is absent from widely reported stories, and the language used about officials. Separately, each outlet is placed in one of three tiers — Government-aligned, Mainstream or Watchdog — according to how it is owned, as set out in our methodology.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '0' }}>
          We also track how stories are covered across tiers — which outlets report which events, and where significant silence exists.
        </p>
      </div>

      {/* SECTION 3 — Contact */}
      <div>
        <h2 id="contact" style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '16px', color: 'var(--text-primary)' }}>Contact</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          TraceNews is based in Lagos, Nigeria.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '4px' }}>
          For corrections to outlet or politician pages:
        </p>
        <a href="mailto:corrections@tracenews.ng" style={{ fontSize: '14px', color: '#a49889', textDecoration: 'none', display: 'block', marginBottom: '16px' }}>
          corrections@tracenews.ng
        </a>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '4px' }}>
          For data access or methodology questions:
        </p>
        <a href="mailto:methodology@tracenews.ng" style={{ fontSize: '14px', color: '#a49889', textDecoration: 'none', display: 'block', marginBottom: '0' }}>
          methodology@tracenews.ng
        </a>
      </div>
    </div>
  );
}
