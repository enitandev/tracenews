import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import consentData from '../components/MonitoringSpirit/readerAnalyticsConsent.json';
import './Dashboard.css';

function formatTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Coverage Diet');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ govt: 0, mainstream: 0, watchdog: 0, broad: 0, partial: 0 });
  const [hasConsent, setHasConsent] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);
  
  // Feed state for Coverage Diet door
  const [feedStories, setFeedStories] = useState([]);
  
  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      
      // Fetch Consent
      const consentRes = await supabase.from('reader_analytics_consent')
        .select('granted')
        .eq('user_id', session.user.id)
        .order('at', { ascending: false })
        .limit(1);
        
      if (consentRes.data && consentRes.data.length > 0) {
        setHasConsent(consentRes.data[0].granted);
      }
      setConsentLoading(false);

      // Fetch Summary
      try {
        const res = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/reader/summary', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to fetch summary', err);
      }
      
      // Fetch some recent stories for the grid
      try {
        const feedRes = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/feed?limit=4');
        if (feedRes.ok) {
          const fData = await feedRes.json();
          setFeedStories(fData.clusters || []);
        }
      } catch(err) {
        console.error(err);
      }
      
      setLoading(false);
    };
    
    fetchUserAndData();
  }, [navigate]);

  const toggleConsent = async () => {
    if (consentLoading) return;
    const newConsent = !hasConsent;
    setHasConsent(newConsent);
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/reader/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ granted: newConsent })
      }).catch(err => console.error("Consent update failed", err));
    }
  };

  const handleDeleteCounts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/reader/counts', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      setSummary({ govt: 0, mainstream: 0, watchdog: 0, broad: 0, partial: 0 });
    }
  };

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--t-primary)' }}>Loading Dashboard...</div>;
  }

  const totalDiet = summary.govt + summary.mainstream + summary.watchdog;
  const totalDivergence = summary.broad + summary.partial;
  
  const pct = (val, total) => total > 0 ? (val / total) * 100 : 0;

  return (
    <div className="dashboard-root" data-theme={theme}>
      <div className="mast">
        <div className="brand">Trace<b>News</b></div>
        <nav>
          <Link to="/">Home</Link>
          <a>For You</a>
          <a>Local</a>
          <Link to="/daily-briefing">Daily Briefing</Link>
          <a>Monitoring Spirit</a>
          <a className="on">Account</a>
        </nav>
        <div className="right">
          <button className="toggle" onClick={() => toggleTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '◐ Light' : '◑ Dark'}
          </button>
          <span className="avatar">{user?.email?.substring(0, 2).toUpperCase() || 'TN'}</span>
        </div>
      </div>
      
      <div className="shell">
        <aside className="rail">
          <div className="cswitch" onClick={() => setIsCountryOpen(!isCountryOpen)}>
            <div className="lab">Country</div>
            <div className="cur">
              <span className="c"><span className="flag">&#127475;&#127468;</span>Nigeria</span>
              <i className="ti ti-chevron-down chev">⌄</i>
            </div>
            {isCountryOpen && (
              <div className="pop" style={{ display: 'block' }}>
                <div className="popitem on"><span className="c"><span className="flag">&#127475;&#127468;</span>Nigeria</span></div>
                <div className="popitem"><span className="c"><span className="flag">&#127487;&#127462;</span>South Africa</span><span className="soontag">Soon</span></div>
                <div className="popitem"><span className="c"><span className="flag">&#127472;&#127466;</span>Kenya</span><span className="soontag">Soon</span></div>
                <div className="popitem"><span className="c"><span className="flag">&#127466;&#127468;</span>Egypt</span><span className="soontag">Soon</span></div>
              </div>
            )}
          </div>
          
          <div className="railgroup">Nigeria</div>
          <div className={`navitem ${activeTab === 'Coverage Diet' ? 'on' : ''}`} onClick={() => setActiveTab('Coverage Diet')}>
            <i>◉</i>Coverage Diet
          </div>
          <div className={`navitem ${activeTab === 'Divergence' ? 'on' : ''}`} onClick={() => setActiveTab('Divergence')}>
            <i>◓</i>Divergence
          </div>
          <div className={`navitem ${activeTab === 'Alerts' ? 'on' : ''}`} onClick={() => setActiveTab('Alerts')}>
            <i>🔔</i>Alerts
          </div>
          <div className={`navitem ${activeTab === 'Topics' ? 'on' : ''}`} onClick={() => setActiveTab('Topics')}>
            <i>#</i>Topics
          </div>
          <div className={`navitem ${activeTab === 'Saved' ? 'on' : ''}`} onClick={() => setActiveTab('Saved')}>
            <i>🔖</i>Saved
          </div>
          
          <div className="railsep"></div>
          <div className="railgroup">Your account</div>
          <div className={`navitem ${activeTab === 'Subscription' ? 'on' : ''}`} onClick={() => setActiveTab('Subscription')}>
            <i>♔</i>Subscription
          </div>
          <div className={`navitem ${activeTab === 'Account' ? 'on' : ''}`} onClick={() => setActiveTab('Account')}>
            <i>⚙</i>Account
          </div>
        </aside>
        
        <main className="content">
          <div className="crumb"><span className="flag">&#127475;&#127468;</span>Nigeria &middot; {activeTab}</div>
          
          {activeTab === 'Coverage Diet' && (
            <>
              <h1 className="h1">Your reading summary</h1>
              <p className="lede">How you've been reading the news on TraceNews &mdash; the coverage you've seen, and the coverage you haven't.</p>
              
              <div className="consent">
                <span className="sp">
                  <b>You control this.</b> {consentData.TOGGLE.promise} &mdash; {consentData.TOGGLE.shortNotice}
                </span>
                <a onClick={toggleConsent}>{hasConsent ? 'Tracking is ON (Manage)' : 'Tracking is OFF (Turn On)'}</a>
                &middot; 
                <a onClick={handleDeleteCounts}>Delete all</a>
              </div>

              {/* COVERAGE DIET */}
              <div className="card">
                <p className="ct">Who you've been reading &middot; last 30 days</p>
                <p className="hero" style={{fontSize: '16px', marginBottom: '12px'}}>
                  Across {totalDiet} stories, your reading leaned {summary.mainstream > summary.govt ? 'mainstream' : 'government-aligned'} &mdash; with {summary.watchdog} from watchdog coverage.
                </p>
                <div className="spec" style={{height: '10px', background: 'var(--track)'}}>
                  <i style={{width: `${pct(summary.govt, totalDiet)}%`, background: 'var(--tier-govt)'}}></i>
                  <i style={{width: `${pct(summary.mainstream, totalDiet)}%`, background: 'var(--tier-main)'}}></i>
                  <i style={{width: `${pct(summary.watchdog, totalDiet)}%`, background: 'var(--tier-watch)'}}></i>
                </div>
                <div className="legend">
                  <span><i className="dot" style={{background: 'var(--tier-govt)'}}></i>Govt-aligned<b>{summary.govt}</b></span>
                  <span><i className="dot" style={{background: 'var(--tier-main)'}}></i>Mainstream<b>{summary.mainstream}</b></span>
                  <span><i className="dot" style={{background: 'var(--tier-watch)'}}></i>Watchdog<b>{summary.watchdog}</b></span>
                </div>
                <p className="denom">Counts are outlet-visits across the stories you opened. Not a judgment about you &mdash; a log of what you read.</p>
                
                <p className="gapline" style={{marginBottom: '12px'}}>
                  <b>Recent stories you read</b> 
                  {/* Door unwired per instruction, linking home for now */}
                  <Link to="/" className="seeall">See all {totalDiet} &rarr;</Link>
                </p>
                <div className="grid">
                  {feedStories.slice(0, 4).map((story, i) => {
                    const dist = story.coverage_stats?.coverage_tier_distribution || {};
                    const total = (dist.pro_establishment || 0) + (dist.institutional || 0) + (dist.adversarial || 0) || 1;
                    return (
                      <Link to={`/story/${story.slug}`} className="story" key={i}>
                        <div className="thumb" style={{backgroundImage: `url(${story.image_url || ''})`}}>
                          <span className="cat">{story.category}</span>
                        </div>
                        <div className="in">
                          <p className="hl">{story.representative_title}</p>
                          <div className="sbar">
                            <i style={{width: `${(dist.pro_establishment || 0)/total*100}%`, background: 'var(--tier-govt)'}}></i>
                            <i style={{width: `${(dist.institutional || 0)/total*100}%`, background: 'var(--tier-main)'}}></i>
                            <i style={{width: `${(dist.adversarial || 0)/total*100}%`, background: 'var(--tier-watch)'}}></i>
                          </div>
                          <div className="smeta">
                            <span className="tiers">
                              <span>G<b>{dist.pro_establishment || 0}</b></span>
                              <span>M<b>{dist.institutional || 0}</b></span>
                              <span>W<b>{dist.adversarial || 0}</b></span>
                            </span>
                            <span>{formatTimeAgo(story.first_seen_at)}</span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'Divergence' && (
            <>
              <h1 className="h1">Divergence Exposure</h1>
              <p className="lede">Understand how the stories you read vary in coverage across different outlets.</p>
              
              <div className="card">
                <p className="ct">Divergence exposure &middot; last 30 days</p>
                <p className="hero">Of the <em>{totalDivergence}</em> stories you opened, {summary.broad > summary.partial ? 'most were covered broadly' : 'many had partial coverage'}.</p>
                <div className="spec">
                  <i style={{width: `${pct(summary.broad, totalDivergence)}%`, background: 'var(--v-clear)'}}></i>
                  <i style={{width: `${pct(summary.partial, totalDivergence)}%`, background: 'var(--v-mixed)'}}></i>
                </div>
                <div className="legend">
                  <span><i className="dot" style={{background: 'var(--v-clear)'}}></i>Broad<b>{summary.broad}</b></span>
                  <span><i className="dot" style={{background: 'var(--v-mixed)'}}></i>Partial<b>{summary.partial}</b></span>
                </div>
                <p className="gapline"><b>The {summary.partial} stories with partial coverage</b> &mdash; the coverage you may have missed.</p>
                
                <div className="grid">
                  {/* Stubbed data for UI as actual personal read history is never stored */}
                  {feedStories.slice(0, 2).map((story, i) => (
                    <Link to={`/story/${story.slug}`} className="story" key={i}>
                      <div className="thumb" style={{backgroundImage: `url(${story.image_url || ''})`}}>
                        <span className="cat">{story.category}</span>
                      </div>
                      <div className="in">
                        <p className="hl">{story.representative_title}</p>
                        <div className="sbar"><i className="ghost" style={{width: '100%'}}></i></div>
                        <div className="smeta">
                          <span className="conc"><span className="d"></span>Partial tier</span>
                          <span>{formatTimeAgo(story.first_seen_at)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {(activeTab === 'Saved' || activeTab === 'Topics' || activeTab === 'Alerts') && (
            <>
              <h1 className="h1">{activeTab}</h1>
              <p className="lede">Your personal {activeTab.toLowerCase()} lists.</p>
              <div className="grid">
                {feedStories.map((story, i) => (
                  <Link to={`/story/${story.slug}`} className="story" key={i}>
                    <div className="thumb" style={{backgroundImage: `url(${story.image_url || ''})`}}>
                      <span className="cat">{story.category}</span>
                    </div>
                    <div className="in">
                      <p className="hl">{story.representative_title}</p>
                      <div className="sbar"><i className="ghost" style={{width: '100%'}}></i></div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeTab === 'Account' && (
            <>
              <h1 className="h1">Account Settings</h1>
              <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--t-primary)' }}>Data Management</h3>
                <p style={{ fontSize: '14px', color: 'var(--t-sub)', marginBottom: '24px' }}>
                  TraceNews stores aggregate counters of the editorial tiers you read. 
                  We never store your personal reading history.
                </p>
                <button 
                  onClick={handleDeleteCounts}
                  style={{ background: '#E74C3C', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Delete my counts
                </button>
              </div>
            </>
          )}
          
          {activeTab === 'Subscription' && (
            <>
              <h1 className="h1">Subscription</h1>
              <div className="soon"><div className="b">Subscriptions are coming soon</div><p className="s">Manage your TraceNews Premium subscription here once it launches.</p></div>
            </>
          )}

          <p className="ct" style={{marginTop: '26px'}}>Reference &middot; what a &ldquo;coming soon&rdquo; country shows</p>
          <div className="soon"><div className="b">TraceNews South Africa is coming</div><p className="s">We&rsquo;re building the same coverage instrument for South Africa. Your Coverage Diet here will start the day it goes live.</p></div>
        </main>
      </div>
    </div>
  );
}
