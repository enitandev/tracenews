import React, { useState, useEffect } from 'react';
import HeroStoryCard from './HeroStoryCard';
import StandardStoryItem from './StandardStoryItem';
import CompactStoryItem from './CompactStoryItem';
import CoverageBreadthCard from './CoverageBreadthCard';

export default function CategorySection({ catName, treatment, stories }) {
  const [railClusters, setRailClusters] = useState([]);
  const [compactStories, setCompactStories] = useState([]);
  const [compactLoading, setCompactLoading] = useState(treatment === 'COMPACT');
  const [compactError, setCompactError] = useState(false);

  useEffect(() => {
    if (treatment === 'COMPACT') return;

    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/clusters/most-carried?category=${catName}&limit=6`)
      .then(r => r.json())
      .then(data => {
        if (!data.clusters) return;
        
        const renderedIds = new Set(stories?.map(s => s.id) || []);
        const filtered = data.clusters.filter(c => !renderedIds.has(c.id));
        
        setRailClusters(filtered.slice(0, 2));
      })
      .catch(e => console.error(`Failed to fetch rail for ${catName}`, e));
  }, [catName, treatment, stories]);

  useEffect(() => {
    if (treatment !== 'COMPACT') return;

    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/clusters/by-category?category=${catName}&limit=8`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then(data => {
        if (data.clusters) setCompactStories(data.clusters);
        setCompactLoading(false);
      })
      .catch(e => {
        console.error(`Failed to fetch compact for ${catName}`, e);
        setCompactError(true);
        setCompactLoading(false);
      });
  }, [catName, treatment]);

  const activeStories = treatment === 'COMPACT' ? compactStories : stories;

  if (treatment !== 'COMPACT' && (!activeStories || activeStories.length === 0)) return null;

  return (
    <section className="section">
      <div className="sec-head">
        <h2>{catName}</h2>
        <div className="acts">
          <span>Follow</span>
          <span>Read more</span>
        </div>
      </div>
      <div className="sec-rule"></div>
      <div className="sec-rule2"></div>

      {treatment === 'LEAD' && (
        <div className="lead">
          <div>
            {activeStories[0] && <HeroStoryCard cluster={activeStories[0]} />}
            {activeStories.slice(1, 4).map(c => <StandardStoryItem key={c.id} cluster={c} />)}
          </div>
          <aside className="category-rail">
            {railClusters.length > 0 && (
              <>
                <div className="rail-head"><span className="lbl">Most widely carried</span><span className="n">{catName}</span></div>
                <div className="rail-rule"></div>
                {railClusters.map(c => <CoverageBreadthCard key={c.id} cluster={c} />)}
              </>
            )}
          </aside>
        </div>
      )}

      {treatment === 'STANDARD' && (
        <div className="standard">
          <div>
            {activeStories.slice(0, 5).map(c => <StandardStoryItem key={c.id} cluster={c} />)}
          </div>
          <aside className="category-rail">
            {railClusters.length > 0 && (
              <>
                <div className="rail-head"><span className="lbl">Most widely carried</span><span className="n">{catName}</span></div>
                <div className="rail-rule"></div>
                {railClusters.map(c => <CoverageBreadthCard key={c.id} cluster={c} />)}
              </>
            )}
          </aside>
        </div>
      )}

      {treatment === 'COMPACT' && (
        <div className="compact">
          {compactLoading ? (
            Array(8).fill(null).map((_, i) => (
              <div key={i} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '85%', height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px' }}></div>
                <div style={{ width: '60%', height: '16px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px' }}></div>
              </div>
            ))
          ) : compactError ? (
            <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
              Failed to load {catName} stories. Please refresh.
            </div>
          ) : activeStories.length === 0 ? (
            <div style={{ padding: '24px 0', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>
              No recent stories found in {catName}.
            </div>
          ) : (
            activeStories.slice(0, 8).map(c => <CompactStoryItem key={c.id} cluster={c} />)
          )}
        </div>
      )}
    </section>
  );
}
