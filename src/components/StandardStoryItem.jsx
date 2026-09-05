import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/helpers';

export default function StandardStoryItem({ cluster }) {
  const [imgError, setImgError] = useState(false);
  
  if (!cluster) return null;

  const dist = cluster.coverage_stats?.coverage_tier_distribution || {};
  const g = dist.pro_establishment || dist.govt_aligned || 0;
  const m = dist.institutional || dist.mainstream || 0;
  const w = dist.adversarial || dist.watchdog || 0;
  const scoredOutlets = g + m + w;
  
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
    <Link to={`/story/${cluster.slug || cluster.id}`} style={{ textDecoration: 'none' }} className="srow">
      <div className="thumb">
        {cluster.image_url && !imgError && (
          <img src={cluster.image_url} onError={() => setImgError(true)} alt="" />
        )}
      </div>
      <div className="b">
        <div className="t">{cluster.representative_title}</div>
        <div className="m">
          {cluster.first_seen_at ? formatTimeAgo(cluster.first_seen_at) : 'recently'}
        </div>
        {scoredOutlets > 0 && (
          <div className="tb">
            {g === 0 ? <i className="ghost" style={{ width: getWidth(0) }} /> : <i style={{ width: getWidth(g), background: 'var(--tier-govt)' }} />}
            {m === 0 ? <i className="ghost" style={{ width: getWidth(0) }} /> : <i style={{ width: getWidth(m), background: 'var(--tier-main)' }} />}
            {w === 0 ? <i className="ghost" style={{ width: getWidth(0) }} /> : <i style={{ width: getWidth(w), background: 'var(--tier-watch)' }} />}
          </div>
        )}
      </div>
    </Link>
  );
}
