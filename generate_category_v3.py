with open("src/pages/Category.jsx", "w") as f:
    f.write('''import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';

import HeroStoryCard from '../components/HeroStoryCard';
import StandardStoryItem from '../components/StandardStoryItem';
import CompactStoryItem from '../components/CompactStoryItem';
import MonitoringAlertCard from '../components/MonitoringAlertCard';
import CoverageBar from '../components/CoverageBar';
import { COVERAGE_TIER_COLORS, TIER_LABELS } from '../utils/helpers';

const CATEGORIES = [
  'Politics', 'Security', 'Economy', 'Sports', 'Health', 
  'Entertainment', 'Technology', 'Education', 'International', 
  'Judiciary', 'Religion'
];

export default function Category() {
  const { topicSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  
  // Collapse states for sidebar cards
  const [isCard1Open, setIsCard1Open] = useState(true);
  const [isCard2Open, setIsCard2Open] = useState(true);
  const [isCard3Open, setIsCard3Open] = useState(true);

  const categoryName = topicSlug.charAt(0).toUpperCase() + topicSlug.slice(1).toLowerCase();

  useEffect(() => {
    setLoading(true);
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/categories/${categoryName}/feed?limit=30&offset=0`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [categoryName]);

  const loadMore = () => {
    const nextOffset = offset + 7;
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/categories/${categoryName}/feed?limit=7&offset=${nextOffset}`)
      .then(res => res.json())
      .then(d => {
        setData(prev => ({
          ...prev,
          stories: [...prev.stories, ...d.stories]
        }));
        setOffset(nextOffset);
      });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading {categoryName} news...
      </div>
    );
  }

  if (!data) return null;

  const { total_cluster_count, top_stories, monitoring_spirit, stories, covered_most_by, bias_breakdown } = data;

  const total = bias_breakdown.total || 1;
  const tiers = ['pro_establishment', 'institutional', 'adversarial'];
  const dominant = tiers.reduce((a,b) => bias_breakdown[a] > bias_breakdown[b] ? a : b);
  const pct = Math.round((bias_breakdown[dominant] || 0)/total*100);

  const biasSummary = pct > 50 ? 
    `${categoryName} is covered mostly by ${TIER_LABELS[dominant]} sources (${pct}%).` : 
    `Coverage of ${categoryName} is relatively balanced across tiers.`;

  const synthCoverageStats = {
    coverage_tier_distribution: {
      pro_establishment: bias_breakdown.pro_establishment || 0,
      institutional: bias_breakdown.institutional || 0,
      adversarial: bias_breakdown.adversarial || 0
    },
    total_coverage: bias_breakdown.total || 1
  };
  
  // Sort top_stories by outlet_count
  const sortedTopStories = top_stories ? [...top_stories].sort((a,b) => (b.outlet_count || 0) - (a.outlet_count || 0)) : [];
  const heroStory = sortedTopStories.length > 0 ? sortedTopStories[0] : null;
  const restTopStories = sortedTopStories.slice(1);
  
  // Only show up to 7 compact stories
  const displayStories = stories ? stories.slice(0, 7) : [];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '8px', 
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)'
            }}>
              {categoryName.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
                News about {categoryName}
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.5 }}>
                Stay current with all the latest and breaking news about {categoryName}. In total, {total_cluster_count} stories have been published in our database.
              </p>
            </div>
          </div>
          <button style={{ 
            background: 'var(--text-primary)', color: 'var(--bg-primary)',
            border: 'none', padding: '8px 24px', borderRadius: '20px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            Follow
          </button>
        </div>
        <div style={{ height: '1px', background: 'var(--border)', marginTop: '32px' }}></div>
      </div>

      <div className="mobile-stack mobile-stack-divider" style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
          
          {/* ZONE 1: Top Stories */}
          {heroStory && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Top {categoryName} News
              </h2>
              
              <HeroStoryCard cluster={heroStory} />
              
              <div>
                {restTopStories.map(cluster => (
                  <StandardStoryItem key={cluster.id} cluster={cluster} />
                ))}
              </div>
              
              <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }}></div>
            </div>
          )}

          {/* ZONE 2: Monitoring Spirit Alerts */}
          {monitoring_spirit && monitoring_spirit.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <AlertTriangle size={20} color="#e67e22" />
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Monitoring Spirit
                </h2>
              </div>
              <div className="mobile-stack" style={{ display: 'flex', gap: '20px' }}>
                {monitoring_spirit.map(cluster => (
                  <div key={cluster.id} style={{ flex: 1, minWidth: 0 }}>
                    <MonitoringAlertCard cluster={cluster} />
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }}></div>
            </div>
          )}

          {/* ZONE 3: Story List */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
              Latest {categoryName} News
            </h2>
            {displayStories.map(cluster => (
              <CompactStoryItem key={cluster.id} cluster={cluster} />
            ))}
            
            <button onClick={loadMore} style={{ 
              width: '100%', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', marginTop: '20px'
            }}>
              Load more
            </button>
          </div>

          {/* ZONE 4: Related Categories */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Related Categories
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.filter(c => c !== categoryName).map(cat => (
                <Link to={`/topics/${cat.toLowerCase()}`} key={cat} style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'transparent', border: '1px solid var(--border)',
                  padding: '8px 12px', borderRadius: '20px', textDecoration: 'none', color: 'var(--text-primary)',
                  fontSize: '13px'
                }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700
                  }}>
                    {cat.charAt(0)}
                  </div>
                  {cat}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* VERTICAL DIVIDER */}
        <div className="hide-on-mobile" style={{
          width: '1px',
          background: 'var(--border)',
          alignSelf: 'stretch',
          flexShrink: 0
        }}></div>

        {/* RIGHT COLUMN: Sidebar */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* CARD 1: Covered Most By */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Covered Most By</span>
              <button onClick={() => setIsCard1Open(!isCard1Open)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <ChevronDown size={20} style={{ transform: isCard1Open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>
            
            {isCard1Open && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {covered_most_by.map((outlet, idx) => {
                  const tierColor = COVERAGE_TIER_COLORS[outlet.tier] || 'var(--border)';
                  const tierTextColor = outlet.tier === 'unscored' ? 'var(--text-muted)' : tierColor;
                  const tierLabel = outlet.tier === 'pro_establishment' ? 'Pro-Est.' : outlet.tier === 'institutional' ? 'Institutional' : outlet.tier === 'adversarial' ? 'Adversarial' : 'Unscored';
                  
                  return (
                    <div key={idx} style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
                      borderBottom: idx < covered_most_by.length - 1 ? '1px solid var(--border)' : 'none'
                    }}>
                      {outlet.logo_url ? (
                        <img src={outlet.logo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: '#fff' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {outlet.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {outlet.name}
                      </div>
                      <div style={{ 
                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px', flexShrink: 0,
                        border: `1px solid ${tierColor}`, color: tierTextColor
                      }}>
                        {tierLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CARD 2: Suggest a Source */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Suggest a Source</span>
              <button onClick={() => setIsCard2Open(!isCard2Open)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <ChevronDown size={20} style={{ transform: isCard2Open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>
            
            {isCard2Open && (
              <div style={{ background: 'rgba(180,160,130,0.10)', border: '1px solid rgba(180,160,130,0.25)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                  Looking for a Nigerian source we don't have yet?
                </p>
                <a href="mailto:sources@tracenews.ng" style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' 
                }}>
                  Suggest one →
                </a>
              </div>
            )}
          </div>

          {/* CARD 3: Coverage Breakdown */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Coverage Breakdown</span>
              <button onClick={() => setIsCard3Open(!isCard3Open)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <ChevronDown size={20} style={{ transform: isCard3Open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>
            
            {isCard3Open && (
              <div>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                  How is the Nigerian media covering {categoryName}?
                </p>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {biasSummary}
                </p>
                <div style={{ width: '100%', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                  <CoverageBar variant="hero" coverageStats={synthCoverageStats} />
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
''')
