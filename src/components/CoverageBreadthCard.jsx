import React from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/helpers';

export default function CoverageBreadthCard({ cluster }) {
  if (!cluster) return null;

  const dist = cluster.coverage_stats?.coverage_tier_distribution || {};
  const g = dist.govt_aligned || 0;
  const m = dist.mainstream || 0;
  const w = dist.watchdog || 0;
  const scoredOutlets = g + m + w;
  const totalOutlets = cluster.outlet_count || scoredOutlets;

  // Calculate widths for the tier bar
  let zeros = 0;
  if (g === 0) zeros++;
  if (m === 0) zeros++;
  if (w === 0) zeros++;

  const ghostWidthPct = 12;
  const availablePct = 100 - (zeros * ghostWidthPct);

  const getWidth = (val) => {
    if (val === 0) return `${ghostWidthPct}%`;
    return `${(val / scoredOutlets) * availablePct}%`;
  };

  return (
    <Link to={`/story/${cluster.slug || cluster.id}`} className="bc">
      <div className="bc-count">
        <span className="num">{totalOutlets}</span>
        <span className="unit">outlets</span>
      </div>
      
      <h3 className="bc-hl">{cluster.representative_title}</h3>
      
      {scoredOutlets > 0 && (
        <div className="tb">
          {g === 0 ? <i className="ghost" style={{ width: getWidth(0) }} /> : <i style={{ width: getWidth(g), background: 'var(--tier-govt)' }} />}
          {m === 0 ? <i className="ghost" style={{ width: getWidth(0) }} /> : <i style={{ width: getWidth(m), background: 'var(--tier-main)' }} />}
          {w === 0 ? <i className="ghost" style={{ width: getWidth(0) }} /> : <i style={{ width: getWidth(w), background: 'var(--tier-watch)' }} />}
        </div>
      )}
      
      <div className="tl">
        <span>
          <i className="dot d-g"></i>Govt
          {g === 0 ? <span className="none">none recorded</span> : <b>{g}</b>}
        </span>
        <span>
          <i className="dot d-m"></i>Mainstream
          {m === 0 ? <span className="none">none recorded</span> : <b>{m}</b>}
        </span>
        <span>
          <i className="dot d-w"></i>Watchdog
          {w === 0 ? <span className="none">none recorded</span> : <b>{w}</b>}
        </span>
      </div>
      
      <div className="bc-foot">
        <span>{cluster.first_seen_at ? formatTimeAgo(cluster.first_seen_at) : 'recently'}</span>
        <span>Read →</span>
      </div>
    </Link>
  );
}
