import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import CoverageBar from '../components/CoverageBar';
import { formatTimeAgo } from '../utils/helpers';
import TierDistributionTubes from '../components/TierDistributionTubes';

function AccordionQuestion({ item, defaultExpanded }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <div 
      onClick={() => setExpanded(!expanded)}
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '8px', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', flex: 1, paddingRight: '8px' }}>
          {item.question}
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      {expanded && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function DailyBriefingStory() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/daily-briefing/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error("Briefing not found");
        return res.json();
      })
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch daily briefing story", err);
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>Loading...</div>;
  }
  if (error || !data) {
    return <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', color: 'var(--text-muted)' }}>{error || "Story not found"}</div>;
  }

  const { cluster, stories, ground_summary, common_ground, perspectives_title, perspectives_sides, perspectives_table, followup_questions, location_context, more_from_briefing, image_url } = data;

  // For the bias distribution tubes
  const getOutletTier = (out) => {
    if (!out) return 'unscored';
    if (out.credibility_tier === 'blog') return 'blog';
    const score = out.independence_score;
    if (score === null || score === undefined) return 'unscored';
    if (score < 35) return 'pro_establishment';
    if (score < 60) return 'institutional';
    return 'adversarial';
  };

  const groupOutlets = () => {
    const groups = { 'pro_establishment': [], 'institutional': [], 'adversarial': [], 'blog': [], 'unscored': [] };
    const seenOutlets = new Set();
    stories.forEach(s => {
      const out = s.outlets || {};
      let tier = getOutletTier(out);
      
      const outletId = out.slug || s.outlet_slug;
      if (groups[tier] && !seenOutlets.has(outletId)) {
        seenOutlets.add(outletId);
        // Shape object for TierDistributionTubes
        groups[tier].push({
          outlet_name: out.name || s.outlet_slug || s.outlet_name,
          outlets: out
        });
      }
    });
    return groups;
  };
  const outletGroups = groupOutlets();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      {/* Back link */}
      <Link to="/daily-briefing" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, fontSize: '13px', marginBottom: '32px' }}>
        ← Daily Briefing
      </Link>

      <div className="mobile-stack" style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN */}
        <div style={{ width: 'calc(65% - 24px)' }}>
          {/* SECTION 1 - Hero */}
          <div className="mobile-stack" style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div style={{ width: '40%', flexShrink: 0 }}>
              {image_url ? (
                <img src={image_url} alt="" style={{ width: '100%', height: '320px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div style={{ width: '100%', height: '320px', background: 'var(--bg-hover)', borderRadius: '8px' }}></div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {cluster?.outlet_count} articles · {formatTimeAgo(cluster?.first_seen_at)}
              </div>
              <h1 style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1.2, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', margin: '0 0 24px 0' }}>
                {cluster?.representative_title}
              </h1>
              <div style={{ marginTop: 'auto' }}>
                <CoverageBar coverageStats={cluster?.coverage_stats} variant="hero" />
              </div>
            </div>
          </div>

          {/* SECTION 2 - Ground Summary */}
          {ground_summary && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Trace Summary
              </div>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px', margin: 0 }}>
                <li style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                  <strong>What's happening:</strong>{" "}{ground_summary.whats_happening}
                </li>
                <li style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                  <strong>Why it matters:</strong>{" "}{ground_summary.why_it_matters}
                </li>
              </ul>
              <div style={{ height: '1px', background: 'var(--border)', marginTop: '32px' }}></div>
            </div>
          )}

          {/* SECTION 3 - Common Ground */}
          {common_ground && common_ground.length > 0 && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Where Everyone Agrees
              </div>
              <ul style={{ listStyle: 'disc', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '16px', margin: 0 }}>
                {common_ground.map((cg, i) => (
                  <li key={i} style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                    <strong>{cg.label}:</strong>{" "}{cg.text}
                  </li>
                ))}
              </ul>
              <div style={{ height: '1px', background: 'var(--border)', marginTop: '32px' }}></div>
            </div>
          )}

          {/* SECTION 4 - Perspectives */}
          {perspectives_title && perspectives_table && (
            <div style={{ marginTop: '40px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                Perspectives
              </div>
              
              <div style={{ 
                background: 'linear-gradient(to bottom right, var(--bg-elevated), rgba(0,0,0,0.2))',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '40px 32px',
                marginBottom: '32px',
                minHeight: '120px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2, maxWidth: '100%' }}>
                  {perspectives_title}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Header Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '25% 37.5% 37.5%', paddingBottom: '8px', borderBottom: '2px solid var(--border)', marginBottom: '8px' }}>
                  <div></div>
                  <div style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)' }}>
                    {perspectives_sides?.side_a}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, textAlign: 'center', color: 'var(--text-primary)' }}>
                    {perspectives_sides?.side_b}
                  </div>
                </div>

                {/* Data Rows */}
                {perspectives_table.map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '25% 37.5% 37.5%', padding: '16px 0', borderBottom: i < perspectives_table.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', paddingRight: '16px' }}>
                      {row.dimension}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)', paddingRight: '12px' }}>
                      {row.side_a}
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-primary)', paddingLeft: '12px' }}>
                      {row.side_b}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hide-on-mobile" style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }}></div>

        {/* RIGHT COLUMN */}
        <div style={{ width: 'calc(35% - 24px)' }}>
          {/* CARD 1 - Location Context */}
          {location_context && location_context.city && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {location_context.city}, {location_context.country}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {location_context.note}
                  </div>
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <FileText size={16} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cluster?.outlet_count} Articles
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {stories.slice(0, 3).map(s => s.outlets?.name || s.outlet_slug || s.outlet_name).join(', ')}
                    {stories.length > 3 ? ' and more' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CARD 2 - Follow-up Questions */}
          {followup_questions && followup_questions.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '16px' }}>
                Follow-up Questions
              </div>
              {followup_questions.map((q, i) => (
                <AccordionQuestion key={i} item={q} defaultExpanded={i === 0} />
              ))}
            </div>
          )}

          {/* CARD 3 - Bias Distribution */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '16px' }}>
              Bias Distribution
            </div>
            <div style={{ marginBottom: '24px', borderRadius: '6px', overflow: 'hidden' }}>
              <CoverageBar coverageStats={cluster?.coverage_stats} variant="hero" />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <TierDistributionTubes groups={outletGroups} />
            </div>
            
            {/* Untracked bias row */}
            {outletGroups['blog'].length > 0 || outletGroups['unscored'].length > 0 ? (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Untracked bias
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {[...outletGroups['blog'], ...outletGroups['unscored']].map((s, idx) => (
                    <div key={idx} title={s.outlet_name} style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#888', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>
                      {s.outlet_name ? s.outlet_name.charAt(0).toUpperCase() : '?'}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <Link to={`/story/${cluster?.slug}`} style={{ display: 'block', width: '100%', textAlign: 'center', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '10px', borderRadius: '6px', fontWeight: 600, fontSize: '13px', textDecoration: 'none', boxSizing: 'border-box' }}>
              View All Sources →
            </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      {more_from_briefing && more_from_briefing.length > 0 && (
        <div style={{ marginTop: '64px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
            More from Today's Briefing
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(min(3, ${more_from_briefing.length}), 1fr)`, 
            gap: '16px' 
          }} className="mobile-stack">
            {more_from_briefing.map((m, i) => (
              <Link key={i} to={`/daily-briefing/${m.cluster_slug}`} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', padding: '12px' }}>
                  <div style={{ width: '120px', height: '90px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden' }}>
                    {m.image_url ? (
                      <img src={m.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--bg-hover)' }}></div>
                    )}
                  </div>
                  <div style={{ paddingLeft: '12px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {m.outlet_count} articles
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {m.representative_title}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '0 12px 12px 12px' }}>
                  <CoverageBar coverageStats={m.coverage_stats} variant="hero" />
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                    {m.perspectives_title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
