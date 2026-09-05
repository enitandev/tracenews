import React, { useState, useEffect } from 'react';
import HeroStoryCard from './HeroStoryCard';
import StandardStoryItem from './StandardStoryItem';
import CompactStoryItem from './CompactStoryItem';
import CoverageBreadthCard from './CoverageBreadthCard';

export default function CategorySection({ catName, treatment, stories }) {
  const [railClusters, setRailClusters] = useState([]);

  useEffect(() => {
    if (treatment === 'COMPACT') return;

    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/clusters/most-carried?category=${catName}&limit=6`)
      .then(r => r.json())
      .then(data => {
        if (!data.clusters) return;
        
        const renderedIds = new Set(stories.map(s => s.id));
        const filtered = data.clusters.filter(c => !renderedIds.has(c.id));
        
        setRailClusters(filtered.slice(0, 2));
      })
      .catch(e => console.error(`Failed to fetch rail for ${catName}`, e));
  }, [catName, treatment, stories]);

  if (!stories || stories.length === 0) return null;

  return (
    <section className="section">
      <div className="sec-head">
        <h2>{catName === 'General' ? 'General News' : catName}</h2>
        <div className="acts">
          <span>Follow</span>
          <span>Read more</span>
        </div>
      </div>
      <div className="sec-rule"></div>
      <div className="sec-rule2"></div>

      {treatment === 'LEAD' && (
        <div className={railClusters.length > 0 ? "lead" : ""} style={railClusters.length === 0 ? { display: 'block' } : {}}>
          <div>
            {stories[0] && <HeroStoryCard cluster={stories[0]} />}
            {stories.slice(1, 4).map(c => <StandardStoryItem key={c.id} cluster={c} />)}
          </div>
          {railClusters.length > 0 && (
            <aside className="rail">
              <div className="rail-head"><span className="lbl">Most widely carried</span><span className="n">{catName}</span></div>
              <div className="rail-rule"></div>
              <p className="rail-sub">The stories the most outlets are covering, and who is covering them.</p>
              {railClusters.map(c => <CoverageBreadthCard key={c.id} cluster={c} />)}
            </aside>
          )}
        </div>
      )}

      {treatment === 'STANDARD' && (
        <div className={railClusters.length > 0 ? "standard" : ""} style={railClusters.length === 0 ? { display: 'block' } : {}}>
          <div>
            {stories.slice(0, 5).map(c => <StandardStoryItem key={c.id} cluster={c} />)}
          </div>
          {railClusters.length > 0 && (
            <aside className="rail">
              <div className="rail-head"><span className="lbl">Most widely carried</span><span className="n">{catName}</span></div>
              <div className="rail-rule"></div>
              <p className="rail-sub">The stories the most outlets are covering, and who is covering them.</p>
              {railClusters.map(c => <CoverageBreadthCard key={c.id} cluster={c} />)}
            </aside>
          )}
        </div>
      )}

      {treatment === 'COMPACT' && (
        <div className="compact">
          {stories.slice(0, 8).map(c => <CompactStoryItem key={c.id} cluster={c} />)}
        </div>
      )}
    </section>
  );
}
