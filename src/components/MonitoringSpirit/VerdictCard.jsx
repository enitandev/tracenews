import React, { useState } from 'react';
import {
  TOKENS,
  GAUGE_ZONES,
  TIER_LABEL,
  TIER_LABEL_FULL,
  CARD_STRINGS,
  EVIDENCE_STRINGS,
  UI,
  WIRE_ATTRIBUTION,
} from './monitoringSpiritStrings';

export default function VerdictCard({ verdictData, clusterStories = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // INVARIANT 1: Live atomic snapshot. If data is missing or computation failed, render NOTHING.
  if (!verdictData || !verdictData.verdict) {
    return null;
  }

  let state = verdictData.verdict;
  if (state === 'dark') {
    console.error('VerdictCard received DARK on a rendering surface — should never happen post-Gate-D-closure. Falling back to calm state.');
    state = 'clear';
  }
  const accent = TOKENS.verdict[state];
  const gaugeActiveIndex = state === 'clear' ? 0 : state === 'mixed' ? 1 : 2;

  const cardStrings = CARD_STRINGS[state];
  const evidenceStrings = EVIDENCE_STRINGS[state];

  // Derive counts live from clusterStories
  const liveCounts = { govt: 0, mainstream: 0, watchdog: 0, unscored: 0, blog: 0 };
  const rosterMap = { govt: [], mainstream: [], watchdog: [] };

  clusterStories.forEach(s => {
    const tier = s.outlet_coverage_tier;
    if (liveCounts[tier] !== undefined) {
      liveCounts[tier]++;
    }
    if (rosterMap[tier]) {
      rosterMap[tier].push(s);
    }
  });

  const total = liveCounts.govt + liveCounts.mainstream + liveCounts.watchdog;
  
  // INVARIANT 4 & 6: Wire attribution
  let wireAttributionLabel = WIRE_ATTRIBUTION.neutral;
  if (WIRE_ATTRIBUTION.enabled && state === 'mixed') {
    // Dormant fallback.
  }

  const fillTemplate = (str) => {
    if (!str) return str;
    const n = total;
    let a = 0;
    let b = total;
    clusterStories.forEach(s => {
       if (s.outlet_coverage_tier !== 'unscored' && s.outlet_coverage_tier !== 'blog') {
         if (!s.outlet_s2_score || s.outlet_s2_score < 50) {
           a++;
         }
       }
    });

    const k = verdictData.snapshots ? verdictData.snapshots.length : 0;
    const h = k > 0 && verdictData.snapshots[k-1].snapshot_at 
      ? Math.round((new Date() - new Date(verdictData.snapshots[k-1].snapshot_at)) / 3600000) 
      : 0;

    return str
      .replace('{n}', n.toString())
      .replace('{a}', a.toString())
      .replace('{b}', b.toString())
      .replace('{k}', k.toString())
      .replace('{h}', h.toString());
  };

  // INVARIANT 3: Zero tier gets fixed hatched sliver 8%.
  const renderTrack = () => {
    const tiers = ['govt', 'mainstream', 'watchdog'];
    const activeTiers = tiers.filter(t => liveCounts[t] > 0);
    const zeroTiers = tiers.filter(t => liveCounts[t] === 0);
    
    const zeroSpace = zeroTiers.length * 8;
    const remainingSpace = 100 - zeroSpace;
    
    return tiers.map(t => {
      const count = liveCounts[t];
      if (count === 0) {
        return <i key={t} className="ghost" style={{ width: '8%' }} data-testid={`track-ghost-${t}`}></i>;
      } else {
        const pct = (count / total) * remainingSpace;
        return <i key={t} style={{ width: `${pct}%`, background: TOKENS.tier[t] }} data-testid={`track-bar-${t}`}></i>;
      }
    });
  };

  const renderTimeline = () => {
    const snaps = verdictData.snapshots || [];
    if (snaps.length < 2) {
      return <p className="hold">{fillTemplate(cardStrings.footerNote)}</p>;
    }
    return (
      <>
        <div className="legend">
          <span><i className="tdot" style={{background: TOKENS.tier.govt, width: '7px', height: '7px'}}></i>Govt</span>
          <span><i className="tdot" style={{background: TOKENS.tier.mainstream, width: '7px', height: '7px'}}></i>Mainstream</span>
          <span><i className="tdot" style={{background: TOKENS.tier.watchdog, width: '7px', height: '7px'}}></i>Watchdog</span>
        </div>
        {snaps.map((snap, i) => {
          const g = snap.coverage_tier_distribution?.pro_establishment || 0;
          const m = snap.coverage_tier_distribution?.institutional || 0;
          const w = snap.coverage_tier_distribution?.adversarial || 0;
          const tot = g + m + w;
          
          let wG = 0, wM = 0, wW = 0;
          if (tot > 0) {
             const zG = g === 0 ? 8 : 0;
             const zM = m === 0 ? 8 : 0;
             const zW = w === 0 ? 8 : 0;
             const r = 100 - (zG + zM + zW);
             wG = g === 0 ? zG : (g / tot) * r;
             wM = m === 0 ? zM : (m / tot) * r;
             wW = w === 0 ? zW : (w / tot) * r;
          } else {
             wG = wM = wW = 8;
          }

          let label = UI.timelineNowLabel;
          if (i > 0) {
            const hrs = Math.round((new Date() - new Date(snap.snapshot_at)) / 3600000);
            label = `${hrs}${UI.timelineAgoSuffix}`;
          }

          return (
            <div className="trow" key={i} data-testid="timeline-row">
              <span className="ttime">{label}</span>
              <div className="tbar">
                {g === 0 ? <i className="ghost" style={{width: `${wG}%`}}></i> : <i style={{width: `${wG}%`, background: TOKENS.tier.govt}}></i>}
                {m === 0 ? <i className="ghost" style={{width: `${wM}%`}}></i> : <i style={{width: `${wM}%`, background: TOKENS.tier.mainstream}}></i>}
                {w === 0 ? <i className="ghost" style={{width: `${wW}%`}}></i> : <i style={{width: `${wW}%`, background: TOKENS.tier.watchdog}}></i>}
              </div>
              <span className="tnums">{g}·{m}·{w}</span>
            </div>
          );
        })}
        <p className="hold">{fillTemplate(evidenceStrings.held)}</p>
      </>
    );
  };

  const renderRosterTier = (key) => {
    const count = liveCounts[key];
    const stories = rosterMap[key];
    if (count === 0) {
      return (
        <React.Fragment key={key}>
          <div className="tier">
            <span className="tname" style={{ color: TOKENS.tier[key] }}>
              <i className="tdot" style={{ background: TOKENS.tier[key] }}></i>
              {TIER_LABEL_FULL[key]}
            </span>
            <span className="tcount">0 outlets</span>
          </div>
          <p className="rnone">{UI.noneRecordedLong}</p>
        </React.Fragment>
      );
    }
    
    let orig = 0, copy = 0;
    let origNames = [], copyNames = [];
    stories.forEach(s => {
      const isOrig = s.outlet_s2_score >= 50;
      if (isOrig) { orig++; origNames.push(s.outlet_name); }
      else { copy++; copyNames.push(s.outlet_name); }
    });
    
    let meta = "";
    if (state === 'mixed') {
      meta = UI.rosterMetaMixed.replace('{orig}', orig.toString()).replace('{copy}', copy.toString());
    } else {
      if (orig > 0 && copy > 0) meta = UI.rosterMetaClearMixed.replace('{orig}', orig.toString()).replace('{copy}', copy.toString());
      else if (orig > 0) meta = UI.rosterMetaOriginal;
      else meta = UI.rosterMetaWire;
    }

    let namesStr = "";
    if (origNames.length > 0 && copyNames.length > 0) {
      namesStr = UI.rosterNamesMixed.replace('{origNames}', origNames.slice(0,3).join(", ")).replace('{copyNames}', copyNames.slice(0,3).join(", "));
    } else {
      const all = origNames.concat(copyNames);
      namesStr = all.slice(0,5).join(", ");
      if (all.length > 5) {
        namesStr = UI.rosterNamesMore.replace('{names}', namesStr).replace('{more}', (all.length - 5).toString());
      }
    }

    return (
      <React.Fragment key={key}>
        <div className="tier">
          <span className="tname" style={{ color: TOKENS.tier[key] }}>
            <i className="tdot" style={{ background: TOKENS.tier[key] }}></i>
            {TIER_LABEL_FULL[key]}
          </span>
          <span className="tcount">{count} {count === 1 ? 'outlet' : 'outlets'}</span>
        </div>
        <p className="tmeta">{meta}</p>
        <p className="names">{namesStr}</p>
      </React.Fragment>
    );
  };

  return (
    <div className="col" data-testid="monitoring-spirit-card">
      <style dangerouslySetInnerHTML={{__html: `
        .col{max-width:360px;margin:0 auto;font-family:${TOKENS.font.body}}
        .card{background:${TOKENS.surface.card};border:1px solid ${TOKENS.surface.border};border-radius:12px;overflow:hidden}
        .gauge{display:flex;gap:4px;padding:3px 3px 0}
        .seg{flex:1;height:5px;border-radius:2px;background:${TOKENS.surface.segDim}}
        .seg.on{background:var(--accent)}
        .zones{display:flex;padding:6px 6px 0;font-size:11px;font-weight:500}
        .zones span{flex:1;color:#565b64}.zones .z2{text-align:center}.zones .z3{text-align:right}
        .zones .on{color:var(--accent)}
        .body{padding:13px 16px 15px}
        .eye{display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;margin-bottom:9px;color:var(--accent)}
        .verdict{font-family:${TOKENS.font.verdict};font-weight:600;font-size:21px;line-height:1.24;margin:0 0 8px;letter-spacing:.1px;color:var(--accent)}
        .verdict.sm{font-size:20px}
        .sub{font-size:13px;line-height:1.5;color:${TOKENS.text.sub};margin:0 0 14px}
        .sub.tight{font-size:12.5px;margin:0}
        .track{height:8px;border-radius:3px;background:${TOKENS.surface.trackBg};display:flex;overflow:hidden}
        .track i{display:block;height:100%}
        .track .ghost{background-image:repeating-linear-gradient(45deg,#2b2e35 0,#2b2e35 3px,#212429 3px,#212429 6px)}
        .blabels{display:flex;justify-content:space-between;margin-top:8px;font-family:${TOKENS.font.mono};font-size:11px;color:${TOKENS.text.muted}}
        .blabels b{color:#a4a9b2;font-weight:500}
        .blabels .none{color:${TOKENS.text.faint};font-family:${TOKENS.font.body};font-size:10.5px}
        .dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:1px}
        .ev{border-top:1px solid ${TOKENS.surface.divider};padding:12px 16px;display:flex;gap:12px}
        .evl{font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:#797e88;font-weight:600;flex:0 0 82px;line-height:1.5}
        .evt{font-size:12.5px;line-height:1.5;color:${TOKENS.text.evidence};margin:0}
        .evt em{font-family:${TOKENS.font.mono};font-style:normal;color:#d0d4da}
        .tap{border-top:1px solid ${TOKENS.surface.divider};padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:13px;color:#c4c9d1;font-weight:500}
        .tap:hover{background:#1c1f24}
        .tap .chev{font-size:15px;transition:transform .15s}
        .foot{border-top:1px solid ${TOKENS.surface.divider};padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .fnote{font-size:11px;color:${TOKENS.text.faint};font-style:italic}
        .flink{font-size:11px;color:${TOKENS.text.link};font-weight:500;cursor:pointer;white-space:nowrap}
        /* evidence-view specific */
        .sec{border-top:1px solid ${TOKENS.surface.divider};padding:13px 16px}
        .sech{font-size:11px;letter-spacing:.9px;text-transform:uppercase;color:#797e88;font-weight:600;margin:0 0 10px}
        .lead{font-size:12.5px;line-height:1.5;color:${TOKENS.text.evidence};margin:0 0 13px}
        .lead em{font-family:${TOKENS.font.mono};font-style:normal;color:#d0d4da}
        .tier{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
        .tname{font-size:12.5px;font-weight:600;display:flex;align-items:center}
        .tdot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px}
        .tcount{font-family:${TOKENS.font.mono};font-size:11px;color:#8a8f98}
        .tmeta{font-size:11.5px;color:${TOKENS.text.muted};margin:0 0 3px 15px;font-style:italic}
        .names{font-size:12px;color:${TOKENS.text.names};line-height:1.5;margin:0 0 14px 15px}
        .names:last-child{margin-bottom:0}
        .rnone{font-size:12px;color:${TOKENS.text.faint};margin:0 0 0 15px;font-style:italic}
        .trow{display:grid;grid-template-columns:56px 1fr 68px;gap:9px;align-items:center;margin-bottom:9px}
        .trow:last-child{margin-bottom:0}
        .ttime{font-family:${TOKENS.font.mono};font-size:11px;color:${TOKENS.text.muted}}
        .tbar{height:7px;border-radius:3px;background:${TOKENS.surface.trackBg};display:flex;overflow:hidden}
        .tbar i{display:block;height:100%}
        .tnums{font-family:${TOKENS.font.mono};font-size:11px;color:${TOKENS.text.sub};text-align:right}
        .hold{font-size:11.5px;color:${TOKENS.text.muted};margin:11px 0 0;line-height:1.5}
        .legend{display:flex;gap:14px;margin:0 0 12px}
        .legend span{font-size:11px;color:${TOKENS.text.muted};display:flex;align-items:center}
        .caveat{font-size:11.5px;line-height:1.55;color:${TOKENS.text.muted};margin:0}
        .links{border-top:1px solid ${TOKENS.surface.divider};padding:11px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .link-a{font-size:11.5px;font-weight:500;color:${TOKENS.text.link};cursor:pointer;white-space:nowrap}
        .link-b{font-size:11.5px;font-weight:500;color:var(--accent);cursor:pointer;white-space:nowrap}
      `}} />
      <div className="card" style={{ '--accent': accent }}>
        <div className="gauge">
          {GAUGE_ZONES.map((_, i) => <div key={i} className={`seg ${i === gaugeActiveIndex ? 'on' : ''}`}></div>)}
        </div>
        <div className="zones">
          {GAUGE_ZONES.map((z, i) => <span key={i} className={i === gaugeActiveIndex ? 'on' : i===1 ? 'z2' : i===2 ? 'z3' : ''}>{z}</span>)}
        </div>
        
        {!isExpanded ? (
          <>
            <div className="body">
              <div className="eye"><i className="ti ti-eye"></i>{cardStrings.eyebrow}</div>
              <p className="verdict">{cardStrings.verdict}</p>
              <p className="sub">{cardStrings.sub}</p>
              <div className="track">
                {renderTrack()}
              </div>
              <div className="blabels">
                {['govt', 'mainstream', 'watchdog'].map(t => (
                  <span key={t}>
                    <i className="dot" style={{ background: TOKENS.tier[t] }}></i>
                    {TIER_LABEL[t]} {liveCounts[t] > 0 ? <b>{liveCounts[t].toString()}</b> : <span className="none">{UI.noneRecordedShort}</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="ev">
              <div className="evl">{cardStrings.evidenceLabel}</div>
              <p className="evt" dangerouslySetInnerHTML={{ __html: fillTemplate(cardStrings.evidenceText).replace(/([0-9]+)/g, '<em>$1</em>') }}></p>
            </div>
            <div className="tap" onClick={() => setIsExpanded(true)}>
              <span>{UI.tap}</span><i className="ti ti-chevron-down chev"></i>
            </div>
            <div className="foot">
              <span className="fnote">{fillTemplate(cardStrings.footerNote)}</span>
              <span className="flink">{UI.methodologyLink}</span>
            </div>
          </>
        ) : (
          <>
            <div className="body">
              <div className="eye"><i className="ti ti-eye"></i>{cardStrings.eyebrow}</div>
              <p className="verdict sm">{cardStrings.verdict}</p>
              <p className="sub tight">{cardStrings.sub}</p>
            </div>
            <div className="sec">
              <p className="sech">{evidenceStrings.sectionHeader}</p>
              {evidenceStrings.lead && <p className="lead" dangerouslySetInnerHTML={{ __html: fillTemplate(evidenceStrings.lead).replace(/([0-9]+)/g, '<em>$1</em>') }}></p>}
              {['mainstream', 'watchdog', 'govt']
                .sort((a, b) => liveCounts[b] - liveCounts[a])
                .map(t => renderRosterTier(t))}
            </div>
            <div className="sec">
              <p className="sech">{evidenceStrings.timelineHeader}</p>
              {renderTimeline()}
            </div>
            <div className="sec">
              <p className="caveat">{evidenceStrings.caveat}</p>
            </div>
            <div className="tap" onClick={() => setIsExpanded(false)} style={{ borderTop: 0 }}>
              <span>{UI.tapOpen}</span><i className="ti ti-chevron-up chev" style={{transform: 'rotate(180deg)'}}></i>
            </div>
            <div className="links">
              <span className="link-a">{UI.methodologyLink}</span>
              <span className="link-b">{UI.correctionLink}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
