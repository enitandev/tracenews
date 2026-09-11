import re

with open('src/pages/Methodology.jsx', 'r') as f:
    content = f.read()

# Extract static parts
head_part = content.split('export default function Methodology() {')[0]

# Define the new component body
new_component = """export default function Methodology() {
  useEffect(() => {
    runDistributionPlot();
  }, []);

  const styles = {
    eyebrow: {
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      fontSize: '11px',
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      color: '#E67E22',
      margin: '0 0 8px'
    },
    h2: {
      fontFamily: "'Spectral', Georgia, serif",
      fontSize: '28px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '0 0 20px',
      lineHeight: 1.2
    },
    h2Visual: {
      fontFamily: "'Spectral', Georgia, serif",
      fontSize: '28px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '0 0 24px',
      lineHeight: 1.2
    },
    prose: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: '15px',
      lineHeight: 1.65,
      color: 'var(--text-secondary)',
      margin: '0 0 18px'
    },
    section: {
      paddingTop: '72px',
      borderTop: '0.5px solid var(--border)'
    },
    sectionFirst: {
      paddingTop: '72px',
    },
    narrow: {
      maxWidth: '660px',
      margin: '0 auto'
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>How TraceNews Scores Nigerian Media Independence | Methodology</title>
        <meta name="description" content="The TraceNews Independence Index (TII) — six behavioural signals, three tiers, and complete transparency on every editorial decision behind the scores." />
        <meta property="og:title" content="TraceNews Methodology — Nigerian Media Independence Scoring" />
        <meta property="og:url" content="https://tracenews.ng/methodology" />
        <link rel="canonical" href="https://tracenews.ng/methodology" />
        <style>{`
          .meth-hero-h1 { font-family: 'Spectral', Georgia, serif; font-size: 48px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0; line-height: 1.1; }
          @media (max-width: 768px) {
            .meth-hero-h1 { font-size: 36px; }
          }
        `}</style>
      </Helmet>

      {/* HERO */}
      <div style={{ paddingTop: '48px', ...styles.narrow }}>
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#E67E22', margin: '0 0 16px 0' }}>
          TRACENEWS INDEPENDENCE INDEX
        </p>
        <h1 className="meth-hero-h1">
          How We Score Nigerian Media Independence
        </h1>
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 24px 0' }}>
          82 outlets · 6 signals · 9,165 stories · 30-day rolling window
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
          margin: '20px 0 24px',
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          {[
            ['01', 'what the tii measures', 'section-01'],
            ['02', 'the six signals', 'section-02'],
            ['03', 'the three tiers', 'section-03'],
            ['04', 'monitoring spirit', 'section-04'],
            ['05', 'special cases', 'section-05'],
            ['06', 'what we do not claim', 'section-06'],
            ['07', 'data sources', 'section-07'],
            ['08', 'contact', 'section-08'],
          ].map(([num, label, id]) => (
            <a key={id}
              href={`#${id}`}
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.target.style.color = '#E67E22'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
              <span style={{color: '#E67E22'}}>{num}</span>
              {' '}{label}
            </a>
          ))}
        </div>

        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
          The TII is a 0–100 behavioural score applied to Nigerian news outlets. This page explains every signal, every threshold, and every editorial decision behind the numbers — because a media intelligence instrument you cannot examine is one you should not trust.
        </p>
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--text-muted)', margin: '0' }}>
          Last updated: June 2026
        </p>
      </div>

      {/* 01 — What the TII Measures */}
      <div id="section-01" style={styles.sectionFirst}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>01 / what the tii measures</p>
          <h2 style={styles.h2}>What the TII Measures</h2>
          <p style={styles.prose}>
            The TraceNews Independence Index (TII) measures one specific thing: how freely a Nigerian news outlet makes editorial decisions independent of political and commercial power. It does not measure accuracy, quality of writing, or factual reliability.
          </p>
          <p style={styles.prose}>
            Every outlet is scored on a 30-day rolling sample of up to 150 published stories drawn from RSS ingestion. Scores update periodically or when significant changes in an outlet's behaviour are detected.
          </p>
          <p style={styles.prose}>
            A higher score means greater editorial independence from power. A lower score means editorial choices that consistently defer to government, party, or commercial interests — whether by direct control, ownership alignment, or access-journalism incentives.
          </p>
        </div>
      </div>

      {/* 02 — The Six Signals */}
      <div id="section-02" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>02 / the six signals</p>
          <h2 style={styles.h2Visual}>The Six Signals</h2>
          <p style={{ ...styles.prose, marginBottom: '24px' }}>
            Six behavioural signals, weighted by how reliably each one discriminates editorial independence in the Nigerian context. Two signals — Source Hierarchy and Original Reporting — together account for 55% of the score because they are the most measurable and least gameable indicators of independence.
          </p>
        </div>

        <div style={{ marginTop: '0' }} dangerouslySetInnerHTML={{ __html: SIGNAL_COMPONENT_HTML }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginTop: '32px' }}>
          {/* S1 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>S1</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>30%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Source Hierarchy</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet rely primarily on official government sources, or does it seek independent verification and alternative voices? We assess whether stories draw predominantly from government spokespeople, press releases, and official statements versus journalists, civil society, or independently verified accounts.
            </p>
            <div style={{ borderLeft: '2px solid #E67E22', padding: '8px 12px', marginTop: '16px', background: 'rgba(230,126,34,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#E67E22', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                A story on fuel scarcity that quotes only the NNPC spokesperson scores low. One that also quotes petrol station owners, independent economists, and civil society analysts scores higher.
              </p>
            </div>
          </div>

          {/* S2 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>S2</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>25%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Original Reporting</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              What proportion of stories are original reporting versus republished wire copy or press releases? We compare each story against NAN wire content and detect semantic near-duplicates — stories where the outlet added no original reporting and simply reformatted a government wire or press release.
            </p>
            <div style={{ borderLeft: '2px solid #E67E22', padding: '8px 12px', marginTop: '16px', background: 'rgba(230,126,34,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#E67E22', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                An outlet running 13 of 14 stories as near-identical NAN wire copy scores very low. An outlet where most stories carry original bylines and new information scores high.
              </p>
            </div>
          </div>

          {/* S3 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>S3</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>20%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Omission Pattern</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet consistently avoid covering major accountability stories that the wider Nigerian media ecosystem reports? We identify clusters of stories covered by ≥60% of outlets and check whether this outlet is absent from them — a pattern of strategic silence on accountability topics.
            </p>
            <div style={{ borderLeft: '2px solid #E67E22', padding: '8px 12px', marginTop: '16px', background: 'rgba(230,126,34,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#E67E22', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                If 35 outlets cover a court ruling against a government agency but a specific outlet never publishes it across multiple such cases, this depresses S3.
              </p>
            </div>
          </div>

          {/* S4 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>S4</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>10%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Lexical Deference</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet's language use political honorifics, PR framing, or deferential terms toward officials? We score the density of terms like "His Excellency," "magnanimous," "graciously," and promotional superlatives that signal editorial deference rather than neutral reporting.
            </p>
            <div style={{ borderLeft: '2px solid #E67E22', padding: '8px 12px', marginTop: '16px', background: 'rgba(230,126,34,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#E67E22', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                "His Excellency graciously approved a landmark directive" scores lower than "The governor approved the policy."
              </p>
            </div>
          </div>

          {/* S5 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>S5</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>10%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Story Selection</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              What proportion of coverage focuses on accountability, oversight, and public-interest topics versus government announcements, ceremonies, and promotional content? We classify stories by category and assess the ratio of accountability-relevant coverage.
            </p>
            <div style={{ borderLeft: '2px solid #E67E22', padding: '8px 12px', marginTop: '16px', background: 'rgba(230,126,34,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#E67E22', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                A politics section dominated by "Governor commissions borehole in community" coverage scores lower than one where government-accountability stories predominate.
              </p>
            </div>
          </div>

          {/* S6 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-base)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>S6</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>5%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Editorial Indicators</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet publish corrections, engage with source disputes, or show evidence of editorial independence processes? This is the lightest-weighted signal because it is harder to systematically measure from RSS feeds, but carries meaningful signal when present or provably absent.
            </p>
            <div style={{ borderLeft: '2px solid #E67E22', padding: '8px 12px', marginTop: '16px', background: 'rgba(230,126,34,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#E67E22', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                An outlet that has published named corrections scores higher than one with no public record of corrections or source engagement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 03 — The Three Tiers */}
      <div id="section-03" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>03 / the three tiers</p>
          <h2 style={styles.h2Visual}>The Three Tiers</h2>
        </div>
        <div style={{ marginTop: '0' }} dangerouslySetInnerHTML={{ __html: DISTRIBUTION_COMPONENT_HTML }} />
      </div>

      {/* 04 — Monitoring Spirit Signals */}
      <div id="section-04" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>04 / monitoring spirit</p>
          <h2 style={styles.h2Visual}>Monitoring Spirit Signals</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {/* Card 1 */}
          <div style={{ background: 'var(--bg-base)', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', fontWeight: 600, color: '#C0392B', background: 'rgba(192,57,43,0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '12px' }}>
              ONE-SIDED COVERAGE
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Coverage concentrated in one tier
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Fires when a story's coverage is dominated by one editorial tier while another is largely silent. The signal is direction-agnostic: it fires both when accountability outlets are covering something government-aligned outlets ignore, and when government-aligned outlets are amplifying something accountability outlets ignore.
            </p>
            <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '12px', borderRadius: '6px', color: 'var(--text-muted)' }}>
              Fires when: one tier ≥ 60% of coverage AND another tier ≤ 10%, with total outlets ≥ 5 and imbalance persisting ≥ 2 hours.
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ background: 'var(--bg-base)', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', fontWeight: 600, color: '#E67E22', background: 'rgba(230,126,34,0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '12px' }}>
              COPY-AND-PASTE
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Most outlets ran the same report
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Fires when the majority of outlets covering a story published substantially identical content — indicating the story propagated without independent verification. When the original source is a government wire (NAN, VON), this is specifically noted: the government effectively authored the story that multiple outlets ran.
            </p>
            <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '12px', borderRadius: '6px', color: 'var(--text-muted)' }}>
              Fires when: ≥ 60% of scored outlets in the cluster have S2 &lt; 40 (wire-republishing pattern), with minimum 4 scored outlets.
            </div>
          </div>
        </div>
        
        <div style={styles.narrow}>
          <p style={styles.prose}>
            Both signals are direction-agnostic by design. The same logic fires whether government-aligned outlets are silent or whether watchdog outlets are silent. A monitoring system that only points one way is an advocacy instrument, not an editorial one.
          </p>
        </div>
      </div>

      {/* 05 — Special Cases */}
      <div id="section-05" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>05 / special cases</p>
          <h2 style={styles.h2Visual}>Special Cases</h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '20px', background: 'var(--bg-base)' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
              LANGUAGE SERVICES
            </span>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              S3 signal defaulted to neutral
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              The S3 omission signal compares outlets against English-language accountability clusters. Language service outlets covering Nigerian news in Hausa or Yoruba structurally cannot match these clusters — not because they suppress stories, but because the same events are reported in different language contexts. S3 is set to 70 (neutral) for these outlets rather than treating absence as suppression.
            </p>
            <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>BBC Hausa</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>BBC Yoruba</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>RFI Hausa</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Aminiya</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>VOA Hausa</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>BBC Pidgin</span>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '20px', background: 'var(--bg-base)' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
              SPECIALIST OUTLETS
            </span>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              S3 signal excluded
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Outlets covering a specific beat — technology, finance, sports, pan-African analysis — should not be penalised for not covering political accountability stories outside their editorial mandate. S3 is set to 70 (neutral) for confirmed specialist outlets.
            </p>
            <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Techpoint Africa</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>TechCabal</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Technext</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>The Africa Report</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Investors King</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Quartz Africa</span>
            </div>
          </div>

          {/* Card 3 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '20px', background: 'var(--bg-base)' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
              FEDERAL GOVERNMENT
            </span>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Score capped at 30
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Outlets owned and editorially directed by the federal government are structurally incapable of editorial independence on matters of government conduct, regardless of individual story quality. Their scores are capped at 30. This reflects editorial structure, not a judgment on individual journalists.
            </p>
            <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>NTA</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>NAN</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Voice of Nigeria</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Radio Nigeria</span>
            </div>
          </div>

          {/* Card 4 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '20px', background: 'var(--bg-base)' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
              KNOWN ALIGNED
            </span>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Score capped at 34 (Govt tier)
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Outlets where ownership ties to political figures or parties constitute a documented structural fact — not inferred from behavioural patterns alone — are capped at 34. This reflects structural editorial alignment, regardless of day-to-day content scores. Caps are reviewed as ownership situations change.
            </p>
            <div style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', color: 'var(--text-primary)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>The Nation</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Blueprint Newspaper</span>
              <span style={{ background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: '4px', border: '0.5px solid var(--border)' }}>Channels Television</span>
            </div>
          </div>
        </div>
      </div>

      {/* 06 — What We Do Not Claim */}
      <div id="section-06" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>06 / what we do not claim</p>
          <h2 style={styles.h2}>What We Do Not Claim</h2>
          
          <div style={{ background: 'rgba(192,57,43,0.04)', border: '0.5px solid rgba(192,57,43,0.15)', borderRadius: '12px', padding: '32px' }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, margin: '0 0 24px 0' }}>
              The TII describes observable editorial behaviour across a 30-day sample. We state what we measured. We do not state what we cannot prove.
            </p>

            <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid rgba(192,57,43,0.15)' }}>
              <span style={{ color: '#C0392B', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '14px', fontFamily: "'Montserrat', sans-serif" }}>
                  We do not assert that any outlet accepted payment for coverage.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
                  The promotional_alignment_flag describes an observable behavioural pattern — anomalously positive sentiment combined with low source diversity — not a transaction. Renaming was a deliberate choice: we will not name an inference of bribery on a named outlet in our public data.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid rgba(192,57,43,0.15)' }}>
              <span style={{ color: '#C0392B', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '14px', fontFamily: "'Montserrat', sans-serif" }}>
                  We do not assert that any journalist or editor acted in bad faith.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
                  Structural constraints — ownership, access dependence, commercial pressure — can produce low TII scores without any individual making a dishonest decision.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid rgba(192,57,43,0.15)' }}>
              <span style={{ color: '#C0392B', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '14px', fontFamily: "'Montserrat', sans-serif" }}>
                  We do not measure the factual accuracy of individual stories.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
                  An outlet can produce factually accurate stories while still deferring systematically to official sources. Accuracy and independence are different things; we measure only the latter.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid rgba(192,57,43,0.15)' }}>
              <span style={{ color: '#C0392B', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '14px', fontFamily: "'Montserrat', sans-serif" }}>
                  We do not assert that One-Sided Coverage signals represent deliberate suppression.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
                  "Government-aligned outlets have not reported this" is a fact about which outlets published stories in a given window. It is not an assertion that any outlet chose to suppress the story. The reader supplies the inference; we supply the measurement.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', padding: '14px 0', borderBottom: '0.5px solid transparent' }}>
              <span style={{ color: '#C0392B', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
              <div>
                <p style={{ fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '14px', fontFamily: "'Montserrat', sans-serif" }}>
                  We do not claim the TII is final or infallible.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>
                  It is a behavioural measurement on a 30-day rolling window. An outlet that changes its editorial practices will see its score change. We welcome methodological challenges at methodology@tracenews.ng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 07 — Data Sources */}
      <div id="section-07" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>07 / data sources</p>
          <h2 style={styles.h2}>Data Sources</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>~100</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Nigerian news outlets tracked via RSS</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>10 min</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Story ingestion cycle — live feed updates</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>9,165</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Story clusters with public coverage pages</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '28px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '8px' }}>882</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>Nigerian political actors in entity registry</span>
            </div>
          </div>

          <p style={styles.prose}>
            Coverage snapshots are taken every 10 minutes per cluster and retained permanently, enabling historical analysis of how coverage patterns changed over time. This is what makes Memory Hole detection possible — stories that spike in coverage and then quietly disappear before resolution.
          </p>
          <p style={styles.prose}>
            The entity registry covers 10 categories: Legislature (450 members), Governors (217 current and former since 1999), Security apparatus (73), Executive (33), Party leadership (28), Judiciary (27), Power brokers (24), Civil society (15), Traditional rulers (10), and Business crossovers (5). The registry is updated as appointments, elections, and party changes occur.
          </p>
        </div>
      </div>

      {/* 08 — Disputes and Contact */}
      <div id="section-08" style={styles.section}>
        <div style={styles.narrow}>
          <p style={styles.eyebrow}>08 / disputes and contact</p>
          <h2 style={styles.h2}>Disputes and Contact</h2>
          
          <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
              Challenge a score or request data access
            </h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              If you believe a TII score is inaccurate — whether you represent a scored outlet or are a researcher who has identified a methodological flaw — we will review the challenge and publish our response. We take methodological accountability seriously: this instrument cannot demand it of others if it does not practise it.
            </p>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '15px', lineHeight: 1.6, color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
              Researchers, NGOs, and funders may request the full scoring dataset for specific outlets or date ranges, including historical TII score records and coverage snapshot data. This data is what makes TraceNews citable — the numbers behind the numbers, timestamped and permanent.
            </p>
            
            <a href="mailto:methodology@tracenews.ng" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '16px', color: '#D85A30', textDecoration: 'none', borderBottom: '1px solid rgba(216,90,48,0.4)', paddingBottom: '2px' }}>
              methodology@tracenews.ng
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
"""

with open('src/pages/Methodology.jsx', 'w') as f:
    f.write(head_part + new_component)
