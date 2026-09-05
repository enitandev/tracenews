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
        return <i key={t} className="vc-ghost" style={{ width: '8%' }} data-testid={`track-ghost-${t}`}></i>;
      } else {
        const pct = (count / total) * remainingSpace;
        return <i key={t} style={{ width: `${pct}%`, background: TOKENS.tier[t] }} data-testid={`track-bar-${t}`}></i>;
      }
    });
  };

  const renderTimeline = () => {
    const snaps = verdictData.snapshots || [];
    if (snaps.length < 2) {
      return <p className="vc-hold">{fillTemplate(cardStrings.footerNote)}</p>;
    }
    return (
      <>
        <div className="vc-legend">
          <span><i className="vc-tdot" style={{background: TOKENS.tier.govt, width: '7px', height: '7px'}}></i>Govt</span>
          <span><i className="vc-tdot" style={{background: TOKENS.tier.mainstream, width: '7px', height: '7px'}}></i>Mainstream</span>
          <span><i className="vc-tdot" style={{background: TOKENS.tier.watchdog, width: '7px', height: '7px'}}></i>Watchdog</span>
        </div>
        {snaps.map((snap, i) => {
          const g = snap.coverage_tier_distribution?.govt_aligned || 0;
          const m = snap.coverage_tier_distribution?.mainstream || 0;
          const w = snap.coverage_tier_distribution?.watchdog || 0;
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
            <div className="vc-trow" key={i} data-testid="timeline-row">
              <span className="vc-ttime">{label}</span>
              <div className="vc-tbar">
                {g === 0 ? <i className="vc-ghost" style={{width: `${wG}%`}}></i> : <i style={{width: `${wG}%`, background: TOKENS.tier.govt}}></i>}
                {m === 0 ? <i className="vc-ghost" style={{width: `${wM}%`}}></i> : <i style={{width: `${wM}%`, background: TOKENS.tier.mainstream}}></i>}
                {w === 0 ? <i className="vc-ghost" style={{width: `${wW}%`}}></i> : <i style={{width: `${wW}%`, background: TOKENS.tier.watchdog}}></i>}
              </div>
              <span className="vc-tnums">{g}·{m}·{w}</span>
            </div>
          );
        })}
        <p className="vc-hold">{fillTemplate(evidenceStrings.held)}</p>
      </>
    );
  };

  const renderRosterTier = (key) => {
    const count = liveCounts[key];
    const stories = rosterMap[key];
    if (count === 0) {
      return (
        <React.Fragment key={key}>
          <div className="vc-tier">
            <span className="vc-tname" style={{ color: TOKENS.tier[key] }}>
              <i className="vc-tdot" style={{ background: TOKENS.tier[key] }}></i>
              {TIER_LABEL_FULL[key]}
            </span>
            <span className="vc-tcount">0 outlets</span>
          </div>
          <p className="vc-rnone">{UI.noneRecordedLong}</p>
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
        <div className="vc-tier">
          <span className="vc-tname" style={{ color: TOKENS.tier[key] }}>
            <i className="vc-tdot" style={{ background: TOKENS.tier[key] }}></i>
            {TIER_LABEL_FULL[key]}
          </span>
          <span className="vc-tcount">{count} {count === 1 ? 'outlet' : 'outlets'}</span>
        </div>
        <p className="vc-tmeta">{meta}</p>
        <p className="vc-names">{namesStr}</p>
      </React.Fragment>
    );
  };

  return (
    <div className="vc-col" data-testid="monitoring-spirit-card">
      <style dangerouslySetInnerHTML={{__html: `
        .vc-col{max-width:360px;margin:0 auto;font-family:${TOKENS.font.body}}
        .vc-card{background:${TOKENS.surface.card};border:1px solid ${TOKENS.surface.border};border-radius:12px;overflow:hidden}
        .vc-gauge{display:flex;gap:4px;padding:3px 3px 0}
        .vc-seg{flex:1;height:5px;border-radius:2px;background:${TOKENS.surface.segDim}}
        .vc-seg.vc-on{background:var(--accent)}
        .vc-zones{display:flex;padding:6px 6px 0;font-size:11px;font-weight:500}
        .vc-zones span{flex:1;color:#565b64}.vc-zones .vc-z2{text-align:center}.vc-zones .vc-z3{text-align:right}
        .vc-zones .vc-on{color:var(--accent)}
        .vc-body{padding:13px 16px 15px}
        .vc-eye{display:flex;align-items:center;gap:6px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;font-weight:600;margin-bottom:9px;color:var(--accent)}
        .vc-verdict{font-family:${TOKENS.font.verdict};font-weight:600;font-size:21px;line-height:1.24;margin:0 0 8px;letter-spacing:.1px;color:var(--accent)}
        .vc-verdict.vc-sm{font-size:20px}
        .vc-sub{font-size:13px;line-height:1.5;color:${TOKENS.text.sub};margin:0 0 14px}
        .vc-sub.vc-tight{font-size:12.5px;margin:0}
        .vc-track{height:8px;border-radius:3px;background:${TOKENS.surface.trackBg};display:flex;overflow:hidden}
        .vc-track i{display:block;height:100%}
        .vc-track .vc-ghost{background-image:repeating-linear-gradient(45deg,#2b2e35 0,#2b2e35 3px,#212429 3px,#212429 6px)}
        .vc-blabels{display:flex;justify-content:space-between;margin-top:8px;font-family:${TOKENS.font.mono};font-size:11px;color:${TOKENS.text.muted}}
        .vc-blabels b{color:#a4a9b2;font-weight:500}
        .vc-blabels .vc-none{color:${TOKENS.text.faint};font-family:${TOKENS.font.body};font-size:10.5px}
        .vc-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:1px}
        .vc-ev{border-top:1px solid ${TOKENS.surface.divider};padding:12px 16px;display:flex;gap:12px}
        .vc-evl{font-size:11px;letter-spacing:.8px;text-transform:uppercase;color:#797e88;font-weight:600;flex:0 0 82px;line-height:1.5}
        .vc-evt{font-size:12.5px;line-height:1.5;color:${TOKENS.text.evidence};margin:0}
        .vc-evt em{font-family:${TOKENS.font.mono};font-style:normal;color:#d0d4da}
        .vc-tap{border-top:1px solid ${TOKENS.surface.divider};padding:12px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:13px;color:#c4c9d1;font-weight:500}
        .vc-tap:hover{background:#1c1f24}
        .vc-tap .vc-chev{font-size:15px;transition:transform .15s}
        .vc-foot{border-top:1px solid ${TOKENS.surface.divider};padding:10px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .vc-fnote{font-size:11px;color:${TOKENS.text.faint};font-style:italic}
        .vc-flink{font-size:11px;color:${TOKENS.text.link};font-weight:500;cursor:pointer;white-space:nowrap}
        /* evidence-view specific */
        .vc-sec{border-top:1px solid ${TOKENS.surface.divider};padding:13px 16px}
        .vc-sech{font-size:11px;letter-spacing:.9px;text-transform:uppercase;color:#797e88;font-weight:600;margin:0 0 10px}
        .vc-lead{font-size:12.5px;line-height:1.5;color:${TOKENS.text.evidence};margin:0 0 13px}
        .vc-lead em{font-family:${TOKENS.font.mono};font-style:normal;color:#d0d4da}
        .vc-tier{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px}
        .vc-tname{font-size:12.5px;font-weight:600;display:flex;align-items:center}
        .vc-tdot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px}
        .vc-tcount{font-family:${TOKENS.font.mono};font-size:11px;color:#8a8f98}
        .vc-tmeta{font-size:11.5px;color:${TOKENS.text.muted};margin:0 0 3px 15px;font-style:italic}
        .vc-names{font-size:12px;color:${TOKENS.text.names};line-height:1.5;margin:0 0 14px 15px}
        .vc-names:last-child{margin-bottom:0}
        .vc-rnone{font-size:12px;color:${TOKENS.text.faint};margin:0 0 0 15px;font-style:italic}
        .vc-trow{display:grid;grid-template-columns:56px 1fr 68px;gap:9px;align-items:center;margin-bottom:9px}
        .vc-trow:last-child{margin-bottom:0}
        .vc-ttime{font-family:${TOKENS.font.mono};font-size:11px;color:${TOKENS.text.muted}}
        .vc-tbar{height:7px;border-radius:3px;background:${TOKENS.surface.trackBg};display:flex;overflow:hidden}
        .vc-tbar i{display:block;height:100%}
        .vc-tnums{font-family:${TOKENS.font.mono};font-size:11px;color:${TOKENS.text.sub};text-align:right}
        .vc-hold{font-size:11.5px;color:${TOKENS.text.muted};margin:11px 0 0;line-height:1.5}
        .vc-legend{display:flex;gap:14px;margin:0 0 12px}
        .vc-legend span{font-size:11px;color:${TOKENS.text.muted};display:flex;align-items:center}
        .vc-caveat{font-size:11.5px;line-height:1.55;color:${TOKENS.text.muted};margin:0}
        .vc-links{border-top:1px solid ${TOKENS.surface.divider};padding:11px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .vc-link-a{font-size:11.5px;font-weight:500;color:${TOKENS.text.link};cursor:pointer;white-space:nowrap}
        .vc-link-b{font-size:11.5px;font-weight:500;color:var(--accent);cursor:pointer;white-space:nowrap}
      `}} />
      <div className="vc-card" style={{ '--accent': accent }}>
        <div className="vc-gauge">
          {GAUGE_ZONES.map((_, i) => <div key={i} className={`vc-seg ${i === gaugeActiveIndex ? 'vc-on' : ''}`}></div>)}
        </div>
        <div className="vc-zones">
          {GAUGE_ZONES.map((z, i) => <span key={i} className={i === gaugeActiveIndex ? 'vc-on' : i===1 ? 'vc-z2' : i===2 ? 'vc-z3' : ''}>{z}</span>)}
        </div>
        
        {!isExpanded ? (
          <>
            <div className="vc-body">
              <div className="vc-eye"><i className="ti ti-eye"></i>{cardStrings.eyebrow}</div>
              <p className="vc-verdict">{cardStrings.verdict}</p>
              <p className="vc-sub">{cardStrings.sub}</p>
              <div className="vc-track">
                {renderTrack()}
              </div>
              <div className="vc-blabels">
                {['govt', 'mainstream', 'watchdog'].map(t => (
                  <span key={t}>
                    <i className="vc-dot" style={{ background: TOKENS.tier[t] }}></i>
                    {TIER_LABEL[t]} {liveCounts[t] > 0 ? <b>{liveCounts[t].toString()}</b> : <span className="vc-none">{UI.noneRecordedShort}</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="vc-ev">
              <div className="vc-evl">{cardStrings.evidenceLabel}</div>
              <p className="vc-evt" dangerouslySetInnerHTML={{ __html: fillTemplate(cardStrings.evidenceText).replace(/([0-9]+)/g, '<em>$1</em>') }}></p>
            </div>
            <div className="vc-tap" onClick={() => setIsExpanded(true)}>
              <span>{UI.tap}</span><i className="ti ti-chevron-down vc-chev"></i>
            </div>
            <div className="vc-foot">
              <span className="vc-fnote">{fillTemplate(cardStrings.footerNote)}</span>
              <span className="vc-flink">{UI.methodologyLink}</span>
            </div>
          </>
        ) : (
          <>
            <div className="vc-body">
              <div className="vc-eye"><i className="ti ti-eye"></i>{cardStrings.eyebrow}</div>
              <p className="vc-verdict vc-sm">{cardStrings.verdict}</p>
              <p className="vc-sub vc-tight">{cardStrings.sub}</p>
            </div>
            <div className="vc-sec">
              <p className="vc-sech">{evidenceStrings.sectionHeader}</p>
              {evidenceStrings.lead && <p className="vc-lead" dangerouslySetInnerHTML={{ __html: fillTemplate(evidenceStrings.lead).replace(/([0-9]+)/g, '<em>$1</em>') }}></p>}
              {['mainstream', 'watchdog', 'govt']
                .sort((a, b) => liveCounts[b] - liveCounts[a])
                .map(t => renderRosterTier(t))}
            </div>
            <div className="vc-sec">
              <p className="vc-sech">{evidenceStrings.timelineHeader}</p>
              {renderTimeline()}
            </div>
            <div className="vc-sec">
              <p className="vc-caveat">{evidenceStrings.caveat}</p>
            </div>
            <div className="vc-tap" onClick={() => setIsExpanded(false)} style={{ borderTop: 0 }}>
              <span>{UI.tapOpen}</span><i className="ti ti-chevron-up vc-chev" style={{transform: 'rotate(180deg)'}}></i>
            </div>
            <div className="vc-links">
              <span className="vc-link-a">{UI.methodologyLink}</span>
              <span className="vc-link-b">{UI.correctionLink}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
