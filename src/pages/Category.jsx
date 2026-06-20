import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';

import HeroStoryCard from '../components/HeroStoryCard';
import StandardStoryItem from '../components/StandardStoryItem';
import CompactStoryItem from '../components/CompactStoryItem';
import MonitoringAlertCard from '../components/MonitoringAlertCard';
import CoverageBar from '../components/CoverageBar';
import { COVERAGE_TIER_COLORS, TIER_LABELS } from '../utils/helpers';


function SkeletonHeroStoryCard() {
  return (
    <div style={{ width: '100%', height: '340px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
        <div style={{ width: '70%', height: '24px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '40%', height: '24px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '20px' }}></div>
        <div style={{ width: '100%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}

function SkeletonStandardStoryItem() {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ width: '30%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '90%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ width: '70%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
      <div style={{ width: '100px', height: '80px', background: 'var(--bg-hover)', borderRadius: '6px' }}></div>
    </div>
  );
}

function SkeletonSidebarCard() {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', height: '150px' }}>
      <div style={{ width: '50%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '20px' }}></div>
      <div style={{ width: '100%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
      <div style={{ width: '80%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
      <div style={{ width: '90%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
    </div>
  );
}

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
  const [displayCount, setDisplayCount] = useState(7);
  
  // Collapse states for sidebar cards
  const [isCard1Open, setIsCard1Open] = useState(true);
  const [isCard2Open, setIsCard2Open] = useState(true);
  const [isCard3Open, setIsCard3Open] = useState(true);

  // Suggest a Source modal states
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceReason, setSourceReason] = useState('');
  const [sourceStatus, setSourceStatus] = useState('');

  // Category images for Related Categories
  const [categoryImages, setCategoryImages] = useState({});

  const categoryName = topicSlug ? topicSlug.charAt(0).toUpperCase() + topicSlug.slice(1).toLowerCase() : '';

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
      
    // Fetch global clusters for category hero images (Exact pattern from Home.jsx)
    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/landing?limit=15')
      .then(res => res.json())
      .then(d => {
        const images = {};
        (d.clusters || d).forEach(c => {
          if (c.category && c.image_url && !images[c.category]) {
            images[c.category] = c.image_url;
          }
        });
        setCategoryImages(images);
      })
      .catch(e => console.error("Secondary fetch failed", e));
  }, [categoryName]);

  const loadMore = () => {
    const nextCount = displayCount + 7;
    const currentStories = data ? data.stories : [];
    
    if (nextCount > currentStories.length) {
      const nextOffset = offset + currentStories.length;
      fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/categories/${categoryName}/feed?limit=30&offset=${nextOffset}`)
        .then(res => res.json())
        .then(d => {
          setData(prev => ({
            ...prev,
            stories: [...prev.stories, ...d.stories]
          }));
          setOffset(nextOffset);
        });
    }
    setDisplayCount(nextCount);
  };



  const total_cluster_count = data ? data.total_cluster_count : 0;
  const top_stories = data ? data.top_stories : null;
  const stories = data ? data.stories : null;
  const covered_most_by = data ? data.covered_most_by : [];
  const bias_breakdown = data ? data.bias_breakdown : { pro_establishment: 0, institutional: 0, adversarial: 0, total: 1 };

  // FIX 4: synthCoverageStats total mismatch
  const tierSum = (bias_breakdown.pro_establishment || 0) + (bias_breakdown.institutional || 0) + (bias_breakdown.adversarial || 0);
  const synthCoverageStats = {
    coverage_tier_distribution: {
      pro_establishment: bias_breakdown.pro_establishment || 0,
      institutional: bias_breakdown.institutional || 0,
      adversarial: bias_breakdown.adversarial || 0
    },
    total_coverage: tierSum || 1
  };

  let biasSummary = '';
  if (data && tierSum > 0) {
    const tiers = ['pro_establishment', 'institutional', 'adversarial'];
    const dominant = tiers.reduce((a,b) => (bias_breakdown[a] || 0) > (bias_breakdown[b] || 0) ? a : b);
    const pct = Math.round(((bias_breakdown[dominant] || 0) / tierSum) * 100);
    biasSummary = pct > 50 ? 
      `${categoryName} is covered mostly by ${TIER_LABELS[dominant]} sources (${pct}%).` : 
      `Coverage of ${categoryName} is relatively balanced across tiers.`;
  }

  const sortedTopStories = top_stories ? [...top_stories].sort((a,b) => (b.outlet_count || 0) - (a.outlet_count || 0)) : [];
  const heroStory = sortedTopStories.length > 0 ? sortedTopStories[0] : null;
  const restTopStories = sortedTopStories.slice(1);
  
  const displayStories = stories ? stories.slice(0, displayCount) : [];
  const hasMore = stories ? displayCount < stories.length : false;
  const canLoadMore = hasMore || (stories && stories.length >= 30);

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
              {categoryName ? categoryName.charAt(0) : ''}
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
            background: 'var(--bg-elevated)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', padding: '8px 24px', borderRadius: '20px',
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
          <div style={{ marginBottom: '48px' }}>
            {loading ? <SkeletonHeroStoryCard /> : (heroStory && <HeroStoryCard cluster={heroStory} />)}
            <div>
              {loading ? (
                Array(3).fill(null).map((_, i) => <SkeletonStandardStoryItem key={i} />)
              ) : restTopStories.map(cluster => (
                <StandardStoryItem key={cluster.id} cluster={cluster} />
              ))}
            </div>
            {(!loading && heroStory) && (
              <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }}></div>
            )}
          </div>

          {/* ZONE 3: Story List */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
              Latest {categoryName} News
            </h2>
            {loading ? (
              Array(4).fill(null).map((_, i) => <SkeletonStandardStoryItem key={i} />)
            ) : displayStories.map(cluster => (
              <StandardStoryItem key={cluster.id} cluster={cluster} />
            ))}
            
            {canLoadMore && (
              <button onClick={loadMore} style={{ 
                width: '100%', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', marginTop: '20px'
              }}>
                More Stories
              </button>
            )}
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
          {loading && (
            <>
              <SkeletonSidebarCard />
              <SkeletonSidebarCard />
              <SkeletonSidebarCard />
            </>
          )}

          {/* CARD 1: Covered Most By */}
          {!loading && (
          <>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Covered Most By</span>
              <button onClick={() => setIsCard1Open(!isCard1Open)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                <ChevronDown size={20} style={{ transform: isCard1Open ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
              </button>
            </div>
            
            {isCard1Open && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {(!covered_most_by || covered_most_by.length === 0) ? (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    No outlet data available yet for this category.
                  </div>
                ) : (
                  covered_most_by.map((outlet, idx) => {
                    const tierColor = COVERAGE_TIER_COLORS[outlet.tier] || 'var(--border)';
                    const tierTextColor = outlet.tier === 'unscored' ? 'var(--text-muted)' : tierColor;
                    const tierLabel = outlet.tier === 'pro_establishment' ? 'Pro-Est.' : outlet.tier === 'institutional' ? 'Inst.' : outlet.tier === 'adversarial' ? 'Adversarial' : 'Unscored';
                    
                    return (
                      <div key={idx} style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0',
                        borderBottom: idx < covered_most_by.length - 1 ? '1px solid var(--border)' : 'none'
                      }}>
                        {outlet.logo_url ? (
                          <img src={outlet.logo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', background: '#fff' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {outlet.name ? outlet.name.charAt(0) : '?'}
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
                  })
                )}
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
                <div 
                  onClick={() => setIsSourceModalOpen(true)}
                  style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' 
                  }}>
                  Suggest one →
                </div>
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
                <div style={{ width: '100%', display: 'block', borderRadius: '4px' }}>
                  <CategoryBiasBar coverageStats={synthCoverageStats} />
                </div>
              </div>
            )}
          </div>

          </>
          )}
        </div>

      </div>

      {/* ZONE 4: Related Categories (Full Width Below) */}
      <div style={{ marginTop: '64px' }}>
        <div style={{ width: '100%', height: '1px', background: 'var(--border)', marginBottom: '32px' }}></div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
          Related Categories
        </h2>
        <div className="related-categories-grid">
          {CATEGORIES.filter(c => c && c !== categoryName).map(topicCat => {
            const catHeroImage = categoryImages[topicCat];
            return (
              <Link to={`/topics/${topicCat.toLowerCase()}`} key={topicCat} style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                textDecoration: 'none', color: 'var(--text-primary)'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-hover)', overflow: 'hidden', flexShrink: 0 }}>
                  {catHeroImage && <img src={catHeroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {topicCat}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Suggest a Source Modal */}
      {isSourceModalOpen && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setIsSourceModalOpen(false)}
        >
          <div 
            style={{ background: 'var(--bg-elevated)', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '400px', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>Suggest a Source</h3>
              <button onClick={() => setIsSourceModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            
            {sourceStatus === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--accent-primary)' }}>
                <p>Thanks! We'll review your suggestion.</p>
              </div>
            ) : (
              <>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: 0, marginBottom: '20px' }}>
                  Know a Nigerian news outlet we should be tracking? Tell us about it.
                </p>
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>Outlet name</label>
                <input 
                  type="text"
                  value={sourceName} 
                  onChange={(e) => setSourceName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', marginBottom: '16px', boxSizing: 'border-box' }}
                />

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>Website URL</label>
                <input 
                  type="url"
                  value={sourceUrl} 
                  onChange={(e) => setSourceUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', marginBottom: '16px', boxSizing: 'border-box' }}
                />

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-primary)' }}>Why should we add this source?</label>
                <textarea 
                  rows={3}
                  value={sourceReason}
                  onChange={(e) => setSourceReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box', marginBottom: '20px' }}
                />

                <button 
                  disabled={sourceStatus === 'sending'}
                  onClick={() => {
                    setSourceStatus('sending');
                    console.log("Source suggestion:", { sourceName, sourceUrl, sourceReason });
                    setTimeout(() => {
                      setSourceStatus('sent');
                      setTimeout(() => setIsSourceModalOpen(false), 2000);
                    }, 500);
                  }}
                  style={{ width: '100%', padding: '12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: sourceStatus === 'sending' ? 'not-allowed' : 'pointer' }}
                >
                  {sourceStatus === 'sending' ? 'Sending...' : 'Submit'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
