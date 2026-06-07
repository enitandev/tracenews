import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BIAS_COLORS = {
  'balanced': '#e5e5e5',
  'government': '#008751',
  'opposition': '#C0392B',
  'tribal-ethnic': '#E67E22',
  'agenda': '#6C3483',
  'sensationalism': '#F39C12',
  'misinformation': '#1A1A1A',
  'foreign-influence': '#2471A3'
};

function StoryCard({ cluster }) {
  const biasSlug = cluster.dominant_bias_slug || 'balanced';
  const biasColor = BIAS_COLORS[biasSlug] || '#e5e5e5';
  
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{
      border: `7px solid ${biasColor}`,
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#F9F9F9',
      marginBottom: '16px',
      cursor: 'pointer',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      {/* IMAGE ZONE */}
      <div style={{
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        background: '#2a2a2a',
        position: 'relative',
        flexShrink: 0
      }}>
        {cluster.image_url && !imgError ? (
          <img 
            src={cluster.image_url} 
            alt={cluster.representative_title}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
              filter: 'grayscale(100%)'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#EAEAEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Montserrat',
            fontWeight: 600,
            fontSize: '14px',
            color: '#aaaaaa',
            textAlign: 'center',
            padding: '0 16px'
          }}>
            TraceNews
          </div>
        )}
      </div>

      {/* CONTENT ZONE */}
      <div style={{
        background: '#ffffff',
        padding: '12px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexGrow: 1
      }}>
        {/* Row 1: Badge and Count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {biasSlug !== 'balanced' && biasSlug && (
            <span style={{
              background: biasColor,
              color: '#ffffff',
              fontFamily: 'Montserrat',
              fontWeight: 600,
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '3px',
              whiteSpace: 'nowrap'
            }}>
              {biasSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          )}
          <span style={{
            fontFamily: 'Montserrat',
            fontWeight: 500,
            fontSize: '11px',
            color: '#666666'
          }}>
            {cluster.outlet_count} sources
          </span>
        </div>

        {/* Row 2: Headline */}
        <div style={{
          fontFamily: '"Merriweather", serif',
          fontWeight: 800,
          fontSize: '18px',
          color: '#1a1a1a',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: '20px',
          flexGrow: 1
        }}>
          {cluster.representative_title}
        </div>

        {/* Row 3: Coverage Bar */}
        <div style={{
          width: '100%',
          height: '28px',
          borderRadius: '3px',
          display: 'flex',
          overflow: 'hidden',
          marginTop: 'auto'
        }}>
          <div style={{
            background: biasColor,
            width: biasSlug !== 'balanced' ? '70%' : '50%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontFamily: 'Montserrat',
            fontWeight: 700,
            fontSize: '11px',
            whiteSpace: 'nowrap'
          }}>
             {biasSlug !== 'balanced' ? `70% ${biasSlug.split('-')[0].toUpperCase()}` : '50% BALANCED'}
          </div>
          <div style={{
            background: '#ffffff',
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1a1a1a',
            fontFamily: 'Montserrat',
            fontWeight: 600,
            fontSize: '11px'
          }}>
             {biasSlug !== 'balanced' ? '30% OTHER' : '50% OTHER'}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      height: '330px',
      background: '#e0e0e0',
      borderRadius: '10px',
      marginBottom: '16px',
      width: '100%',
      animation: 'pulse 1.2s infinite'
    }} />
  );
}

export default function Home() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/landing')
      .then(r => r.json())
      .then(data => {
        setClusters(data.clusters || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const leftCards = clusters.filter((_, i) => i % 2 === 0);
  const rightCards = clusters.filter((_, i) => i % 2 !== 0);

  const leftLoop = [...leftCards, ...leftCards];
  const rightLoop = [...rightCards, ...rightCards];

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        body {
          margin: 0;
          padding: 0;
          background-color: #F4F2EE; /* Unified newsprint background */
        }
        * {
          box-sizing: border-box;
        }
        .subscribe-btn:hover {
          background: #008751 !important;
        }
        .proceed-link:hover {
          color: #008751 !important;
        }
        
        /* Subtle background pattern for the left side */
        .left-bg-pattern {
          background-image: radial-gradient(#d5d5d5 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.5;
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        
        /* Hide scrollbar for scrolling containers */
        .scroll-container::-webkit-scrollbar {
          display: none;
        }
        .scroll-container {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
      
      <div style={{ fontFamily: 'Montserrat, sans-serif', backgroundColor: '#F4F2EE', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* PROCEED BAR */}
        <div style={{
          width: '100%',
          background: '#ffffff',
          borderBottom: '1px solid #e5e5e5',
          padding: '10px 24px',
          textAlign: 'center',
          fontFamily: 'Montserrat',
          fontWeight: 400,
          fontSize: '13px',
          color: '#666666',
          zIndex: 10
        }}>
          Explore TraceNews without subscribing — <Link to="/home" className="proceed-link" style={{
            fontFamily: 'Montserrat',
            fontWeight: 600,
            color: '#1a1a1a',
            textDecoration: 'none',
            transition: 'color 0.2s'
          }}>Go to homepage →</Link>
        </div>

        {/* MAIN SECTION - Centered Wrapper */}
        <div style={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'hidden',
          height: 'calc(100vh - 39px)'
        }}>
          <div style={{
            maxWidth: '1200px',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            position: 'relative'
          }}>
            
            {/* LEFT COLUMN (Text) */}
            <div style={{
              flex: '1',
              display: 'flex',
              alignItems: 'center',
              padding: '40px 60px',
              position: 'relative',
              height: '100%'
            }}>
              <div className="left-bg-pattern"></div>
              
              <div style={{ maxWidth: '420px', position: 'relative', zIndex: 10 }}>
                <h1 style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 800,
                  fontSize: '48px',
                  color: '#1a1a1a',
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  letterSpacing: '-0.02em'
                }}>
                  See every side of every story.
                </h1>
                
                <h2 style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#333333',
                  lineHeight: 1.4,
                  marginBottom: '24px'
                }}>
                  Join our community of smart, well-informed news readers.
                </h2>
                
                <p style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 400,
                  fontSize: '16px',
                  color: '#555555',
                  lineHeight: 1.6,
                  marginBottom: '32px'
                }}>
                  Get unlimited access to our news blindspot feed, unlock bias and factuality ratings for thousands of news sources, and much more.
                </p>
                
                <button className="subscribe-btn" style={{
                  background: '#222222',
                  color: '#ffffff',
                  fontFamily: 'Montserrat',
                  fontWeight: 700,
                  fontSize: '15px',
                  width: '200px',
                  padding: '16px 0',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}>
                  Subscribe
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN (Scrolling Cards) */}
            <div style={{
              width: '560px',
              flexShrink: 0,
              padding: '24px 0',
              display: 'flex',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden',
              height: '100%'
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            >
              {/* Fade masks */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                background: 'linear-gradient(to bottom, #F4F2EE 0%, rgba(244,242,238,0) 8%, rgba(244,242,238,0) 92%, #F4F2EE 100%)'
              }}></div>

              {/* Scroll Column 1 */}
              <div className="scroll-container" style={{ flex: 1, overflow: 'hidden' }}>
                {loading ? (
                  <div style={{ paddingTop: '40px' }}>
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  </div>
                ) : (
                  <div style={{
                    animation: 'scrollUp 60s linear infinite',
                    animationPlayState: isPaused ? 'paused' : 'running',
                    paddingTop: '20px'
                  }}>
                    {leftLoop.map((cluster, idx) => (
                      <StoryCard key={`left-${cluster.id}-${idx}`} cluster={cluster} />
                    ))}
                  </div>
                )}
              </div>

              {/* Scroll Column 2 */}
              <div className="scroll-container" style={{ flex: 1, overflow: 'hidden' }}>
                {loading ? (
                  <div style={{ paddingTop: '80px' }}>
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                  </div>
                ) : (
                  <div style={{
                    animation: 'scrollUp 75s linear infinite',
                    animationPlayState: isPaused ? 'paused' : 'running',
                    paddingTop: '60px' /* Offset so they don't align perfectly */
                  }}>
                    {rightLoop.map((cluster, idx) => (
                      <StoryCard key={`right-${cluster.id}-${idx}`} cluster={cluster} />
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
