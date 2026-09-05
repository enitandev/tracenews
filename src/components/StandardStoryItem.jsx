import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '../utils/helpers';

export default function StandardStoryItem({ cluster }) {
  const [imgError, setImgError] = useState(false);
  
  if (!cluster) return null;

  const dist = cluster.coverage_stats?.coverage_tier_distribution || {};
  const g = dist.govt_aligned || 0;
  const m = dist.mainstream || 0;
  const w = dist.watchdog || 0;
  const scoredOutlets = g + m + w;

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
            {g > 0 && <i style={{ width: `${(g/scoredOutlets)*100}%`, background: 'var(--tier-govt)' }} />}
            {m > 0 && <i style={{ width: `${(m/scoredOutlets)*100}%`, background: 'var(--tier-main)' }} />}
            {w > 0 && <i style={{ width: `${(w/scoredOutlets)*100}%`, background: 'var(--tier-watch)' }} />}
          </div>
        )}
      </div>
    </Link>
  );
}
