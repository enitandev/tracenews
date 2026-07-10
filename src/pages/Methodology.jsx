import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SIGNAL_COMPONENT_HTML = `
<style>
.tn-meth{
  --tn-ink:var(--text-primary,#ededed);
  --tn-mut:var(--text-muted,#a0a0a0);
  --tn-faint:var(--text-tertiary,#6b6b6b);
  --tn-line:var(--border,rgba(255,255,255,.12));
  --tn-line2:var(--border,rgba(255,255,255,.25));
  --tn-accent:#a49889;
  --tn-serif:'Spectral',Georgia,serif;
  --tn-mono:'IBM Plex Mono',ui-monospace,monospace;
  max-width:100%;
}
.tn-meth *{box-sizing:border-box;}
.tn-eyebrow{font-family:var(--tn-mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--tn-accent);margin:0 0 10px;}
.tn-h{font-family:var(--tn-serif);font-size:27px;font-weight:600;color:var(--tn-ink);margin:0 0 6px;line-height:1.15;}
.tn-lede{font-family:var(--font-body);font-size:14px;line-height:1.65;color:var(--tn-mut);margin:0 0 22px;max-width:580px;}
.tn-mono{font-family:var(--tn-mono);}

/* ---- 1. signal weights ---- */
.tn-weights{display:flex;height:60px;border-radius:8px;overflow:hidden;margin-bottom:14px;border:.5px solid var(--tn-line);}
.tn-seg{display:flex;flex-direction:column;justify-content:center;padding-left:14px;transform:scaleX(0);transform-origin:left;}
.tn-meth.in-view .tn-seg{animation:tn-grow .9s cubic-bezier(.2,.8,.2,1) forwards;}
.tn-seg .k{font-family:var(--tn-mono);font-size:11px;letter-spacing:.05em;line-height:1.2;}
.tn-seg .v{font-family:var(--tn-mono);font-size:16px;font-weight:500;line-height:1.2;}
.tn-legend{display:grid;grid-template-columns:repeat(3,1fr);gap:2px 18px;}
.tn-legrow{display:flex;gap:9px;padding:7px 0;border-bottom:.5px solid var(--tn-line);}
.tn-legrow .s{font-family:var(--tn-mono);font-size:11px;color:#0F6E56;padding-top:2px;}
.tn-legrow .n{margin:0;font-size:13px;font-weight:500;color:var(--tn-ink);}
.tn-legrow .d{font-family:var(--tn-mono);margin:1px 0 0;font-size:11px;color:var(--tn-faint);}

/* ---- 2. distribution ---- */
.tn-rule{height:1px;background:var(--tn-line);margin:40px 0;}
.tn-bands{position:relative;height:30px;border-radius:5px;overflow:hidden;display:flex;}
.tn-bands>span{display:block;height:100%;}
.tn-plot{position:relative;height:64px;border-bottom:1px solid var(--tn-line2);}
.tn-otick{position:absolute;bottom:0;width:1.5px;background:var(--tn-line2);cursor:pointer;transition:background .15s;opacity:0;transform:translateY(6px);outline:none;}
.tn-meth.in-view .tn-otick{animation:tn-rise .5s ease forwards;}
.tn-otick:hover,.tn-otick:focus-visible{background:var(--tn-accent);}
.tn-olabel{position:absolute;font-family:var(--tn-mono);font-size:9.5px;color:var(--tn-mut);white-space:nowrap;opacity:0;transform:translate(-50%,6px);}
.tn-meth.in-view .tn-olabel{animation:tn-rise .5s ease forwards;}
.tn-axis{position:relative;height:16px;margin-top:6px;font-size:10px;}
.tn-axis>span{position:absolute;font-family:var(--tn-mono);color:var(--tn-faint);}
.tn-readout{font-family:var(--tn-mono);font-size:11px;color:var(--tn-faint);margin:0 0 22px;transition:color .15s;}
.tn-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px;}
.tn-tier{padding-top:9px;}
.tn-tier .tt{margin:0;font-size:13px;font-weight:500;color:var(--tn-ink);}
.tn-tier .tr{font-family:var(--tn-mono);color:var(--tn-faint);font-size:11px;}
.tn-tier .td{margin:4px 0 0;font-size:11.5px;line-height:1.5;color:var(--tn-mut);}
.tn-tier .tc{font-family:var(--tn-mono);margin:6px 0 0;font-size:11px;}

@keyframes tn-grow{to{transform:scaleX(1);}}
@keyframes tn-rise{to{opacity:1;transform:translate(0,0);}}
@media (prefers-reduced-motion:reduce){
  .tn-meth.in-view .tn-seg,.tn-meth.in-view .tn-otick,.tn-meth.in-view .tn-olabel{animation:none;}
  .tn-seg{transform:scaleX(1);}
  .tn-otick,.tn-olabel{opacity:1;transform:none;}
}
@media (max-width:560px){
  .tn-tiers{grid-template-columns:1fr;}
  .tn-h{font-size:23px;}
}
</style>
<div class="tn-meth in-view" style="max-width: none;">
  <div class="tn-weights" role="img" aria-label="Signal weighting: source hierarchy 30 percent, original reporting 25 percent, omission pattern 20 percent, lexical deference 10 percent, story selection 10 percent, editorial indicators 5 percent.">
    <div class="tn-seg" style="width:30%;background:#0F6E56;animation-delay:0s;"><span class="k" style="color:#9FE1CB;">S1</span><span class="v" style="color:#fff;">30%</span></div>
    <div class="tn-seg" style="width:25%;background:#1D9E75;animation-delay:.1s;"><span class="k" style="color:#04342C;">S2</span><span class="v" style="color:#04342C;">25%</span></div>
    <div class="tn-seg" style="width:20%;background:#5DCAA5;animation-delay:.2s;padding-left:12px;"><span class="k" style="color:#04342C;">S3</span><span class="v" style="color:#04342C;font-size:15px;">20%</span></div>
    <div class="tn-seg" style="width:10%;background:#9FE1CB;animation-delay:.3s;padding-left:8px;"><span class="k" style="color:#04342C;font-size:10px;">S4</span><span class="v" style="color:#04342C;font-size:13px;">10</span></div>
    <div class="tn-seg" style="width:10%;background:#C7EDE0;animation-delay:.4s;padding-left:8px;"><span class="k" style="color:#04342C;font-size:10px;">S5</span><span class="v" style="color:#04342C;font-size:13px;">10</span></div>
    <div class="tn-seg" style="width:5%;background:#E1F5EE;animation-delay:.5s;align-items:center;padding-left:0;"><span class="v" style="color:#04342C;font-size:11px;">5</span></div>
  </div>

  <div class="tn-legend">
    <div class="tn-legrow"><span class="s">S1</span><div><p class="n">Source hierarchy</p><p class="d">who gets quoted</p></div></div>
    <div class="tn-legrow"><span class="s">S2</span><div><p class="n">Original reporting</p><p class="d">wire vs own work</p></div></div>
    <div class="tn-legrow"><span class="s">S3</span><div><p class="n">Omission pattern</p><p class="d">what's avoided</p></div></div>
    <div class="tn-legrow"><span class="s">S4</span><div><p class="n">Lexical deference</p><p class="d">honorifics, PR tone</p></div></div>
    <div class="tn-legrow"><span class="s">S5</span><div><p class="n">Story selection</p><p class="d">accountability ratio</p></div></div>
    <div class="tn-legrow"><span class="s">S6</span><div><p class="n">Editorial indicators</p><p class="d">corrections, disputes</p></div></div>
  </div>
</div>
`;

const DISTRIBUTION_COMPONENT_HTML = `
<div class="tn-meth in-view" style="max-width: none;" id="distribution-container">
  <p class="tn-readout" id="tn-readout">hover any mark to read an outlet &nbsp;·&nbsp; 81 outlets &nbsp;·&nbsp; 30-day window</p>

  <div class="tn-bands" aria-hidden="true">
    <span style="width:34%;background:#6d7f92;opacity:.85;"></span>
    <span style="width:25%;background:#a49889;opacity:.85;"></span>
    <span style="width:41%;background:#8f9a6f;opacity:.85;"></span>
  </div>

  <div class="tn-plot" id="tn-plot" role="img" aria-label="Distribution of all 82 outlets across the 0 to 100 independence spectrum, clustered densely in the lower-middle range."></div>

  <div class="tn-axis" aria-hidden="true">
    <span style="left:0;">0</span>
    <span style="left:34%;transform:translateX(-50%);">34</span>
    <span style="left:59%;transform:translateX(-50%);">59</span>
    <span style="right:0;">100</span>
  </div>

  <div class="tn-tiers">
    <div class="tn-tier" style="border-top:2px solid #6d7f92;"><p class="tt">Govt <span class="tr">0–34</span></p><p class="td">Editorial choices consistently defer to government or aligned interests.</p><p class="tc" style="color:#6d7f92;">7 outlets</p></div>
    <div class="tn-tier" style="border-top:2px solid #a49889;"><p class="tt">Mainstream <span class="tr">35–59</span></p><p class="td">Broadly balanced but constrained by access and commercial pressure.</p><p class="tc" style="color:#a49889;">50 outlets</p></div>
    <div class="tn-tier" style="border-top:2px solid #8f9a6f;"><p class="tt">Watchdog <span class="tr">60–100</span></p><p class="td">Consistent original accountability reporting, independent of official narratives.</p><p class="tc" style="color:#8f9a6f;">24 outlets</p></div>
  </div>
</div>
`;

const runDistributionPlot = () => {
  var TN_OUTLETS=[
    ["NAN",30],
    ["NTA",30],
    ["Radio Nigeria",30],
    ["Voice of Nigeria",30],
    ["Blueprint Newspaper",34],
    ["Channels Television",34],
    ["The Nation",34],
    ["PRNigeria",35],
    ["TVC News",37],
    ["Investors King",39],
    ["Kogi Reports",40],
    ["Lagos Television (LTV)",40],
    ["Nairametrics",40],
    ["The Observer",40],
    ["Techeconomy",42],
    ["The Will",42],
    ["Daily Nigerian",43],
    ["AIT",44],
    ["Daily Independent",44],
    ["New Telegraph",44],
    ["News Central TV",44],
    ["Reuters Africa",46],
    ["The Tide",46],
    ["The Voice",47],
    ["PM News",49],
    ["Africa Check Nigeria",50],
    ["Akwa Ibom Times",50],
    ["Bloomberg Africa",50],
    ["BSN Sports",50],
    ["Complete Sports",50],
    ["Desert Herald",50],
    ["Dubawa",50],
    ["FactCheckHub",50],
    ["Guardian Nigeria",50],
    ["HumAngle",50],
    ["NaijaTechGuide",50],
    ["RFI Hausa",51],
    ["Techpoint Africa",51],
    ["The Punch (Metro)",52],
    ["ICIR",53],
    ["TechCabal",53],
    ["The Point",53],
    ["Sporting Life Nigeria",54],
    ["Aminiya",55],
    ["BBC Pidgin",55],
    ["Goal Nigeria",55],
    ["Punch Nigeria",55],
    ["Quartz Africa",55],
    ["ThisDay",55],
    ["BBC Hausa",56],
    ["Technext",56],
    ["Business Insider Africa",57],
    ["Daily Post Nigeria",57],
    ["Leadership Newspaper",57],
    ["Vanguard Delta",57],
    ["Naija247news",58],
    ["Premium Times",58],
    ["BusinessDay",60],
    ["Dataphyte",60],
    ["The Cable",60],
    ["Daily Trust",61],
    ["Nigerian Tribune Online",61],
    ["Pointblank News",61],
    ["BBC Yoruba",62],
    ["The Conversation Africa",62],
    ["The Niche",63],
    ["Peoples Gazette",64],
    ["Pulse Nigeria",64],
    ["The Sun Nigeria",64],
    ["The Whistler",64],
    ["YNaija",64],
    ["Al Jazeera Africa",65],
    ["The Africa Report",65],
    ["VOA Hausa",65],
    ["African Arguments",66],
    ["Arise News Online",66],
    ["Osun Defender",67],
    ["Ripples Nigeria",68],
    ["Legit.ng",70],
    ["FIJ Nigeria",75],
    ["Sahara Reporters",75]
  ];

  var TN_NOTABLE={
    "NTA":1,
    "Punch Nigeria":1,
    "The Cable":1,
    "FIJ Nigeria":1,
    "Sahara Reporters":1
  };
  var DEFAULT_READOUT="hover any mark to read an outlet  \u00B7  81 outlets  \u00B7  30-day window";

  var plot=document.getElementById('tn-plot');
  var readout=document.getElementById('tn-readout');
  if(!plot) return;

  function tierOf(s){return s<=34?'Govt':s<=59?'Mainstream':'Watchdog';}

  TN_OUTLETS.forEach(function(o,i){
    var name=o[0],score=o[1],isNote=TN_NOTABLE[name];
    var d=document.createElement('div');
    d.className='tn-otick';
    d.style.left=score+'%';
    d.style.height=(isNote?44:26)+'px';
    d.style.animationDelay=(0.3+i*0.012)+'s';
    if(isNote){d.style.background='var(--text-muted,#a0a0a0)';d.style.width='2px';}
    d.tabIndex=0;
    d.setAttribute('role','img');
    d.setAttribute('aria-label',name+', score '+score+', '+tierOf(score)+' tier');
    function show(){readout.textContent='\u203A '+name+'  \u00B7  TII '+score+'  \u00B7  '+tierOf(score);readout.style.color='var(--text-primary,#ededed)';}
    function hide(){readout.textContent=DEFAULT_READOUT;readout.style.color='var(--text-tertiary,#6b6b6b)';}
    d.addEventListener('mouseenter',show);
    d.addEventListener('mouseleave',hide);
    d.addEventListener('focus',show);
    d.addEventListener('blur',hide);
    plot.appendChild(d);

    if(isNote){
      var lab=document.createElement('div');
      lab.className='tn-olabel';
      lab.textContent=name;
      lab.style.left=score+'%';
      var labelHeights = {
        "NTA": '46px',
        "Punch Nigeria": '62px',
        "The Cable": '46px',
        "FIJ Nigeria": '62px',
        "Sahara Reporters": '46px'
      };
      lab.style.bottom = labelHeights[name] || '46px';
      lab.style.animationDelay=(0.6+i*0.01)+'s';
      plot.appendChild(lab);
    }
  });

  var root=plot.closest('.tn-meth');
  if('IntersectionObserver' in window && root){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){root.classList.add('in-view');io.disconnect();} });
    },{threshold:0.2});
    io.observe(root);
  }else if(root){
    root.classList.add('in-view');
  }
};

export default function Methodology() {
  useEffect(() => {
    runDistributionPlot();
  }, []);

  const styles = {
    eyebrow: {
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      fontSize: '12px',
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      color: '#a49889',
      margin: '0 0 10px 0',
      paddingTop: '8px',
      display: 'block',
      opacity: 1
    },
    h2: {
      fontFamily: "'Spectral', Georgia, serif",
      fontSize: '28px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '4px 0 18px 0',
      lineHeight: 1.2
    },
    h2Visual: {
      fontFamily: "'Spectral', Georgia, serif",
      fontSize: '28px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '4px 0 18px 0',
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
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a49889', margin: '0 0 16px 0' }}>
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
                color: 'var(--text-secondary, #888)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.target.style.color = '#a49889'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary, #888)'}
            >
              <span style={{color: '#a49889'}}>{num}</span>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '32px' }}>
          {/* S1 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-elevated, transparent)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: '#0F6E56' }}>S1</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>30%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Source Hierarchy</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet rely primarily on official government sources, or does it seek independent verification and alternative voices? We assess whether stories draw predominantly from government spokespeople, press releases, and official statements versus journalists, civil society, or independently verified accounts.
            </p>
            <div style={{ borderLeft: '2px solid #0F6E56', padding: '8px 12px', marginTop: '16px', background: 'rgba(15,110,86,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#0F6E56', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                A story on fuel scarcity that quotes only the NNPC spokesperson scores low. One that also quotes petrol station owners, independent economists, and civil society analysts scores higher.
              </p>
            </div>
          </div>

          {/* S2 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-elevated, transparent)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: '#0F6E56' }}>S2</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>25%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Original Reporting</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              What proportion of stories are original reporting versus republished wire copy or press releases? We compare each story against NAN wire content and detect semantic near-duplicates — stories where the outlet added no original reporting and simply reformatted a government wire or press release.
            </p>
            <div style={{ borderLeft: '2px solid #1D9E75', padding: '8px 12px', marginTop: '16px', background: 'rgba(29,158,117,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#1D9E75', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                An outlet running 13 of 14 stories as near-identical NAN wire copy scores very low. An outlet where most stories carry original bylines and new information scores high.
              </p>
            </div>
          </div>

          {/* S3 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-elevated, transparent)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: '#1D9E75' }}>S3</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>20%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Omission Pattern</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet consistently avoid covering major accountability stories that the wider Nigerian media ecosystem reports? We identify clusters of stories covered by ≥60% of outlets and check whether this outlet is absent from them — a pattern of strategic silence on accountability topics.
            </p>
            <div style={{ borderLeft: '2px solid #5DCAA5', padding: '8px 12px', marginTop: '16px', background: 'rgba(93,202,165,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#5DCAA5', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                If 35 outlets cover a court ruling against a government agency but a specific outlet never publishes it across multiple such cases, this depresses S3.
              </p>
            </div>
          </div>

          {/* S4 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-elevated, transparent)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: '#1D9E75' }}>S4</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>10%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Lexical Deference</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet's language use political honorifics, PR framing, or deferential terms toward officials? We score the density of terms like "His Excellency," "magnanimous," "graciously," and promotional superlatives that signal editorial deference rather than neutral reporting.
            </p>
            <div style={{ borderLeft: '2px solid #9FE1CB', padding: '8px 12px', marginTop: '16px', background: 'rgba(159,225,203,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#9FE1CB', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                "His Excellency graciously approved a landmark directive" scores lower than "The governor approved the policy."
              </p>
            </div>
          </div>

          {/* S5 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-elevated, transparent)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: '#5DCAA5' }}>S5</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>10%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Story Selection</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              What proportion of coverage focuses on accountability, oversight, and public-interest topics versus government announcements, ceremonies, and promotional content? We classify stories by category and assess the ratio of accountability-relevant coverage.
            </p>
            <div style={{ borderLeft: '2px solid #C7EDE0', padding: '8px 12px', marginTop: '16px', background: 'rgba(199,237,224,0.06)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#C7EDE0', display: 'block', marginBottom: '4px' }}>example</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>
                A politics section dominated by "Governor commissions borehole in community" coverage scores lower than one where government-accountability stories predominate.
              </p>
            </div>
          </div>

          {/* S6 */}
          <div style={{ border: '0.5px solid var(--border)', borderRadius: '8px', padding: '24px', background: 'var(--bg-elevated, transparent)' }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', fontWeight: 500, color: '#5DCAA5' }}>S6</span>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '12px', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)', marginLeft: '8px' }}>5%</span>
            </div>
            <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '12px 0 8px 0' }}>Editorial Indicators</h3>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
              Does the outlet publish corrections, engage with source disputes, or show evidence of editorial independence processes? This is the lightest-weighted signal because it is harder to systematically measure from RSS feeds, but carries meaningful signal when present or provably absent.
            </p>
            <div style={{ borderLeft: '2px solid #E1F5EE', padding: '8px 12px', marginTop: '16px', background: 'rgba(225,245,238,0.04)', borderRadius: '0 4px 4px 0' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', color: '#9FE1CB', display: 'block', marginBottom: '4px' }}>example</span>
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
          {/* Card 1 */}
          <div style={{ background: 'var(--bg-base)', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', fontWeight: 600, color: '#8f9a6f', background: 'rgba(192,57,43,0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '12px' }}>
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
            <div style={{ display: 'inline-block', fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '10px', fontWeight: 600, color: '#a49889', background: 'rgba(230,126,34,0.1)', padding: '4px 8px', borderRadius: '4px', marginBottom: '12px' }}>
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
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
              <span style={{ color: '#8f9a6f', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
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
              <span style={{ color: '#8f9a6f', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
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
              <span style={{ color: '#8f9a6f', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
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
              <span style={{ color: '#8f9a6f', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
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
              <span style={{ color: '#8f9a6f', fontWeight: 700, fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✕</span>
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
            Coverage snapshots are taken every 10 minutes per cluster and retained permanently, enabling historical analysis of how coverage patterns changed over time. This accumulated data makes it possible to track whether coverage of a story broadens or narrows over its lifecycle.
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
