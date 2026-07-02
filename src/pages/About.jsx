import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>About TraceNews | Nigerian Media Intelligence Platform</title>
        <meta name="description" content="TraceNews is a media intelligence platform that measures editorial independence across Nigerian news outlets. We analyse coverage patterns — we do not produce news." />
        <link rel="canonical" href="https://tracenews.ng/about" />
      </Helmet>

      {/* SECTION 1 — What TraceNews is */}
      <div>
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '11px', textTransform: 'uppercase', color: '#E67E22', margin: '0 0 12px 0' }}>ABOUT TRACENEWS</p>
        <h1 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '36px', fontWeight: 600, margin: '0 0 24px 0', color: 'var(--text-primary)' }}>A media intelligence platform, not a news publisher</h1>
        
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          TraceNews measures editorial independence across Nigerian news outlets. We score how outlets behave — who they quote, what they cover, and what they avoid — and make those measurements publicly searchable.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          We do not produce news. We do not have reporters or editorial positions. We are an analytical instrument: we observe and measure what Nigerian media publishes, the same way an audiometer measures sound.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          Every score on this platform is derived from observable editorial behaviour across a 30-day rolling window, applied consistently across all 82 outlets in our registry. Our methodology is public and fully documented.
        </p>
        
        <Link to="/methodology" style={{ fontSize: '14px', color: '#E67E22', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: '8px' }}>
          Read the methodology →
        </Link>
      </div>

      {/* SECTION 2 — What we measure */}
      <div>
        <h2 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '16px', color: 'var(--text-primary)' }}>What we measure</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          The TraceNews Independence Index (TII) scores outlets on six behavioural signals — who gets quoted, how much original reporting an outlet does, what topics it avoids, and whether its coverage follows or challenges official positions. Scores range from 0 to 100 and are grouped into three editorial tiers: Government-aligned, Mainstream, and Watchdog.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '0' }}>
          We also track how stories are covered across tiers — which outlets report which events, and where significant silence exists.
        </p>
      </div>

      {/* SECTION 3 — Contact */}
      <div>
        <h2 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '16px', color: 'var(--text-primary)' }}>Contact</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          TraceNews is based in Lagos, Nigeria.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '4px' }}>
          For corrections to outlet or politician pages:
        </p>
        <a href="mailto:corrections@tracenews.ng" style={{ fontSize: '14px', color: '#E67E22', textDecoration: 'none', display: 'block', marginBottom: '16px' }}>
          corrections@tracenews.ng
        </a>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '4px' }}>
          For data access or methodology questions:
        </p>
        <a href="mailto:methodology@tracenews.ng" style={{ fontSize: '14px', color: '#E67E22', textDecoration: 'none', display: 'block', marginBottom: '0' }}>
          methodology@tracenews.ng
        </a>
      </div>
    </div>
  );
}
