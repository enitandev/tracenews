import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CoverageBar from '../components/CoverageBar';
import { formatTimeAgo } from '../utils/helpers';

function SkeletonHeroCard() {
  return (
    <div className="mobile-stack" style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', minHeight: '280px' }}>
      <div style={{ width: '45%', flexShrink: 0, background: 'var(--bg-hover)', minHeight: '280px' }}></div>
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
        <div style={{ width: '30%', height: '14px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
        <div style={{ width: '90%', height: '36px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
        <div style={{ width: '60%', height: '20px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
        <div style={{ marginTop: 'auto', width: '100%', height: '30px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}

function SkeletonStandardCard() {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '160px', background: 'var(--bg-hover)', width: '100%' }}></div>
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
        <div style={{ width: '40%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
        <div style={{ width: '90%', height: '20px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
        <div style={{ width: '70%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
        <div style={{ marginTop: 'auto', width: '100%', height: '24px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}

export default function DailyBriefing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/daily-briefing')
      .then(res => res.json())
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch daily briefing", err);
        setLoading(false);
      });
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const displayDate = data?.date ? new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : todayStr;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Daily Briefing
        </h1>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {displayDate}
        </div>
      </div>
      <div style={{ height: '1px', background: 'var(--border)', marginBottom: '32px' }}></div>

      {loading ? (
        <div className="briefing-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <SkeletonHeroCard />
          </div>
          {Array(4).fill(0).map((_, i) => <SkeletonStandardCard key={i} />)}
        </div>
      ) : data?.status === 'no_briefing' ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          Today's briefing is being prepared. Check back soon.
        </div>
      ) : (
        <div className="briefing-grid">
          {data?.stories?.map((story, i) => {
            const isHero = i === 0;

            if (isHero) {
              return (
                <div key={story.cluster_slug} style={{ gridColumn: '1 / -1' }}>
                  <Link 
                    to={`/daily-briefing/${story.cluster_slug}`} 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', minHeight: '280px' }}
                    className="mobile-stack"
                  >
                    <div style={{ width: '45%', flexShrink: 0 }}>
                      {story.image_url ? (
                        <img src={story.image_url} alt="" style={{ width: '100%', height: '100%', minHeight: '280px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', minHeight: '280px', background: 'var(--bg-hover)' }}></div>
                      )}
                    </div>
                    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {story.outlet_count} sources · {formatTimeAgo(story.first_seen_at)}
                      </div>
                      <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                        {story.representative_title}
                      </h2>
                      <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
                        {story.perspectives_title}
                      </div>
                      
                      <div style={{ marginTop: 'auto' }}>
                        <CoverageBar coverageStats={story.coverage_stats} variant="hero" />
                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px', marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          Read Full Briefing <span style={{ fontSize: '16px' }}>→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            }

            return (
              <Link 
                key={story.cluster_slug}
                to={`/daily-briefing/${story.cluster_slug}`}
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ height: '160px', width: '100%' }}>
                  {story.image_url ? (
                    <img src={story.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--bg-hover)' }}></div>
                  )}
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {story.outlet_count} sources · {story.category}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
                    {story.representative_title}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                    {story.perspectives_title}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <CoverageBar coverageStats={story.coverage_stats} variant="compact" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
