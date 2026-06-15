import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, ExternalLink } from 'lucide-react';
import CoverageBar from '../components/CoverageBar';

const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};

const TIER_LABELS = {
  'pro_establishment': 'Pro-Establishment',
  'institutional': 'Institutional',
  'adversarial': 'Adversarial',
  'unscored': 'Unscored'
};

const CATEGORIES = [
  'Politics', 'Security', 'Economy', 'Sports', 'Health', 
  'Entertainment', 'Technology', 'Education', 'International', 
  'Judiciary', 'Religion'
];

export default function Category() {
  const { topicSlug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Convert slug back to title case, e.g. "politics" -> "Politics"
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading {categoryName} news...
      </div>
    );
  }

  if (!data) return null;

  const { total_cluster_count, top_stories, monitoring_spirit, stories, covered_most_by, bias_breakdown } = data;

  const totalBias = bias_breakdown.total || 1;
  const domTier = Object.keys(bias_breakdown).filter(k => k !== 'total').reduce((a, b) => bias_breakdown[a] > bias_breakdown[b] ? a : b);
  const biasSummary = bias_breakdown[domTier] / totalBias > 0.4 ? 
    `This topic is covered mostly by ${TIER_LABELS[domTier]} sources.` : 
    "Coverage is evenly distributed across tiers.";

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
              <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
                News about {categoryName}
              </h1>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.5 }}>
                Stay current with all the latest and breaking news about {categoryName}. In total, {total_cluster_count} stories have been published about {categoryName} in our database.
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

      <div className="mobile-stack" style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ width: '72%', flexShrink: 0 }}>
          
          {/* ZONE 1: Top Stories */}
          {top_stories && top_stories.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Top {categoryName} News
              </h2>
              <div style={{ display: 'flex', gap: '20px' }}>
                {top_stories.map(cluster => (
                  <Link to={`/story/${cluster.slug}`} key={cluster.id} style={{ 
                    flex: 1, textDecoration: 'none', color: 'inherit',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column'
                  }}>
                    <img src={cluster.image_url} alt="" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '80px', height: '8px' }}>
                          <CoverageBar distribution={cluster.coverage_stats?.coverage_tier_distribution || {}} total={cluster.coverage_stats?.total_coverage || 1} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {cluster.outlet_count} sources
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 16px 0', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                        {cluster.representative_title}
                      </h3>
                      <div style={{ marginTop: 'auto', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                        See the Story →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
              <div style={{ display: 'flex', gap: '20px' }}>
                {monitoring_spirit.map(cluster => {
                  const dist = cluster.coverage_stats?.coverage_tier_distribution || {};
                  const total = cluster.coverage_stats?.total_coverage || 1;
                  const dom = Object.keys(dist).reduce((a, b) => dist[a] > dist[b] ? a : b);
                  const domPct = Math.round((dist[dom] / total) * 100);
                  const color = COVERAGE_TIER_COLORS[dom] || COVERAGE_TIER_COLORS.unscored;

                  return (
                    <Link to={`/story/${cluster.slug}`} key={cluster.id} style={{ 
                      flex: 1, textDecoration: 'none', color: 'inherit',
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img src={cluster.image_url || '/og-default.png'} alt="" style={{ 
                          width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px',
                          border: `2px solid ${color}`
                        }} />
                        <div style={{ 
                          position: 'absolute', bottom: '8px', left: '8px',
                          background: color, color: '#fff', fontSize: '10px', fontWeight: 700,
                          padding: '4px 8px', borderRadius: '12px', textTransform: 'uppercase'
                        }}>
                          Only {domPct}% {TIER_LABELS[dom]}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                          {cluster.outlet_count} sources
                        </div>
                        <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px 0', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                          {cluster.representative_title}
                        </h3>
                        <div style={{ width: '100%', height: '8px' }}>
                          <CoverageBar distribution={dist} total={total} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ZONE 3: Story List */}
          <div style={{ marginBottom: '48px' }}>
            {stories.map((cluster, idx) => (
              <React.Fragment key={cluster.id}>
                <Link to={`/story/${cluster.slug}`} style={{ 
                  display: 'flex', gap: '20px', alignItems: 'flex-start', textDecoration: 'none', color: 'inherit',
                  padding: '20px 0'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '60px', height: '6px' }}>
                        <CoverageBar distribution={cluster.coverage_stats?.coverage_tier_distribution || {}} total={cluster.coverage_stats?.total_coverage || 1} />
                      </div>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                      {cluster.representative_title}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {cluster.category} {cluster.headquarters_city ? `· ${cluster.headquarters_city}` : ''}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      See the Story →
                    </div>
                  </div>
                  {cluster.image_url && (
                    <img src={cluster.image_url} alt="" style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  )}
                </Link>
                {idx < stories.length - 1 && <div style={{ height: '1px', background: 'var(--border)' }}></div>}
              </React.Fragment>
            ))}
            
            <button style={{ 
              width: '100%', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', marginTop: '20px'
            }}>
              More stories
            </button>
          </div>

          {/* ZONE 4: Related Categories */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Related Categories
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {CATEGORIES.filter(c => c !== categoryName).map(cat => (
                <Link to={`/topics/${cat.toLowerCase()}`} key={cat} style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  padding: '8px 16px', borderRadius: '24px', textDecoration: 'none', color: 'var(--text-primary)',
                  fontSize: '14px', fontWeight: 600
                }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '4px', background: 'var(--bg-surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                  }}>
                    {cat.charAt(0)}
                  </div>
                  {cat}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div style={{ width: '28%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* CARD 1: Covered Most By */}
          {covered_most_by && covered_most_by.length > 0 && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>Covered Most By</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {covered_most_by.map((outlet, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {outlet.logo_url ? (
                        <img src={outlet.logo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain', background: '#fff' }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {outlet.name.charAt(0)}
                        </div>
                      )}
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{outlet.name}</span>
                    </div>
                    {outlet.tier !== 'unscored' && (
                      <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%', 
                        background: COVERAGE_TIER_COLORS[outlet.tier] 
                      }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CARD 2: Suggest a source */}
          <div style={{ background: 'rgba(180,160,130,0.12)', borderRadius: '12px', padding: '24px' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
              Looking for a Nigerian source we don't have yet?
            </p>
            <a href="mailto:sources@tracenews.ng" style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' 
            }}>
              Suggest one <ChevronRight size={16} />
            </a>
          </div>

          {/* CARD 3: Coverage Breakdown */}
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Coverage Breakdown</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              How is the Nigerian media covering {categoryName}?
            </p>
            <p style={{ margin: '0 0 20px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {biasSummary}
            </p>
            <div style={{ width: '100%', height: '16px', borderRadius: '8px', overflow: 'hidden' }}>
              <CoverageBar distribution={bias_breakdown} total={bias_breakdown.total || 1} />
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['pro_establishment', 'institutional', 'adversarial'].map(tier => (
                <div key={tier} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COVERAGE_TIER_COLORS[tier] }}></div>
                    <span style={{ color: 'var(--text-primary)' }}>{TIER_LABELS[tier]}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                    {Math.round((bias_breakdown[tier] || 0) / (bias_breakdown.total || 1) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
