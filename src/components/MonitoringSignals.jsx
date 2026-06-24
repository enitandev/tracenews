import React, { useState } from 'react'

export default function MonitoringSignals({ 
  coverageStats, 
  stories,
  compact = false 
}) {
  const [tooltip, setTooltip] = 
    useState(null)
  
  if (!coverageStats) return null
  
  const dist = coverageStats
    .coverage_tier_distribution || {}
  const total = coverageStats
    .total_coverage || 0
  
  if (total < 5) return null
  
  const signals = []
  
  // --- SIGNAL 1: One-Sided Coverage ---
  const govt = dist.pro_establishment || 0
  const mainstream = 
    dist.institutional || 0
  const watchdog = dist.adversarial || 0
  
  const govtPct = total > 0 
    ? (govt / total) * 100 : 0
  const watchdogPct = total > 0 
    ? (watchdog / total) * 100 : 0
  
  if (
    watchdogPct >= 60 && 
    govtPct <= 10
  ) {
    signals.push({
      id: 'watchdog-only',
      pill: 'One-Sided Coverage',
      finding: `Mostly reported by ` +
        `accountability outlets — ` +
        `government-aligned outlets ` +
        `have not covered this.`,
      color: '#C0392B',
      bg: 'rgba(192, 57, 43, 0.12)'
    })
  } else if (
    govtPct >= 70 && 
    watchdogPct <= 10
  ) {
    signals.push({
      id: 'govt-only',
      pill: 'One-Sided Coverage',
      finding: `Mostly reported by ` +
        `government-aligned outlets — ` +
        `accountability outlets have ` +
        `not covered this.`,
      color: '#2980B9',
      bg: 'rgba(41, 128, 185, 0.12)'
    })
  }
  
  // --- SIGNAL 2: Copy-and-Paste ---
  // Only compute if stories array 
  // with s2 scores is available
  if (stories && stories.length > 0) {
    const scoredStories = stories.filter(
      s => s.outlet_s2_score !== null && 
           s.outlet_s2_score !== undefined
    )
    
    // Deduplicate by outlet
    const seenOutlets = new Set()
    const uniqueScored = []
    for (const s of scoredStories) {
      if (!seenOutlets.has(s.outlet_slug)){
        seenOutlets.add(s.outlet_slug)
        uniqueScored.push(s)
      }
    }
    
    if (uniqueScored.length >= 4) {
      const original = uniqueScored
        .filter(s => 
          s.outlet_s2_score >= 70
        ).length
      const republished = uniqueScored
        .filter(s => 
          s.outlet_s2_score < 40
        ).length
      const mixed = uniqueScored
        .filter(s => 
          s.outlet_s2_score >= 40 && 
          s.outlet_s2_score < 70
        ).length
      
      const repubPct = uniqueScored
        .length > 0 
        ? (republished / 
           uniqueScored.length) * 100 
        : 0
      
      // Fire if majority republished
      if (repubPct >= 60) {
        signals.push({
          id: 'copy-paste',
          pill: 'Copy-and-Paste',
          finding: `${republished} of ` +
            `${uniqueScored.length} ` +
            `outlets published nearly ` +
            `the same report — ` +
            `${original} did their ` +
            `own reporting.`,
          color: '#E67E22',
          bg: 'rgba(230, 126, 34, 0.12)'
        })
      }
    }
  }
  
  if (signals.length === 0) return null
  
  // Explainer text per signal type
  const explainers = {
    'watchdog-only': 'Stories covered ' +
      'mainly by watchdog outlets but ' +
      'ignored by government-aligned ' +
      'media may indicate selective ' +
      'suppression.',
    'govt-only': 'Stories covered ' +
      'mainly by government-aligned ' +
      'outlets but ignored by watchdog ' +
      'media may indicate coordinated ' +
      'amplification.',
    'copy-paste': 'Many Nigerian outlets ' +
      'republish the same report without ' +
      'adding new information. This shows ' +
      'how many actually did original work.'
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '6px',
      margin: compact 
        ? '8px 0 0 0' 
        : '12px 0 0 0'
    }}>
      {signals.map(signal => (
        <div 
          key={signal.id}
          style={{ position: 'relative' }}
        >
          {/* Pill + finding row */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {/* Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: signal.bg,
                border: `1px solid ${signal.color}`,
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: signal.color,
                cursor: 'pointer',
                flexShrink: 0,
                whiteSpace: 'nowrap'
              }}
              onClick={() => setTooltip(
                tooltip === signal.id 
                  ? null 
                  : signal.id
              )}
            >
              {/* Eye icon */}
              <svg 
                width="10" 
                height="10" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {signal.pill}
            </div>
            
            {/* Finding text */}
            {!compact && (
              <span style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
                flex: 1
              }}>
                {signal.finding}
              </span>
            )}
          </div>
          
          {/* Tap-to-explain tooltip */}
          {tooltip === signal.id && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              maxWidth: '280px',
              zIndex: 20,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {explainers[signal.id]}
              <div style={{
                marginTop: '6px',
                fontSize: '11px',
                color: signal.color,
                fontWeight: 600,
                cursor: 'pointer'
              }}
                onClick={() => setTooltip(null)}
              >
                Got it ✕
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
