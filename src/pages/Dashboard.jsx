import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import consentData from '../components/MonitoringSpirit/readerAnalyticsConsent.json';
import {
  AppShell, Masthead, ShellContainer, Rail, ContentArea,
  Button, EmptyState, NavItem, ThemeToggle,
  TierBar, TierLabels, Avatar, Card, CardHead,
  H1, Body, Meta, SecHead, Dot
} from '../components/ds';
import { 
  IconCircleDot, IconChartPie, IconBell, IconHash, IconBookmark,
  IconCrown, IconSettings, IconChevronDown
} from '@tabler/icons-react';

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('Coverage Diet');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ govt: 0, mainstream: 0, watchdog: 0, broad: 0, partial: 0 });
  const [hasConsent, setHasConsent] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      
      const consentRes = await supabase.from('reader_analytics_consent')
        .select('granted')
        .eq('user_id', session.user.id)
        .order('at', { ascending: false })
        .limit(1);
        
      if (consentRes.data && consentRes.data.length > 0) {
        setHasConsent(consentRes.data[0].granted);
      }
      setConsentLoading(false);

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
    return (
      <AppShell>
        <div style={{ padding: 'var(--s8)', textAlign: 'center' }}>Loading Dashboard...</div>
      </AppShell>
    );
  }

  const totalDiet = summary.govt + summary.mainstream + summary.watchdog;
  const totalDivergence = summary.broad + summary.partial;
  const pct = (val, total) => total > 0 ? (val / total) * 100 : 0;

  return (
    <AppShell>
      <Masthead brandLink="/">
        <nav style={{ display: 'flex', gap: 'var(--s6)' }}>
          <Link to="/" style={{ color: 'var(--t-sub)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--t-sub)' }}>For You</span>
          <span style={{ color: 'var(--t-sub)' }}>Local</span>
          <Link to="/daily-briefing" style={{ color: 'var(--t-sub)', textDecoration: 'none' }}>Daily Briefing</Link>
          <span style={{ color: 'var(--t-sub)' }}>Monitoring Spirit</span>
          <span style={{ color: 'var(--t-primary)', fontWeight: 600 }}>Account</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
          <ThemeToggle />
          <Avatar initials={user?.email?.substring(0, 2).toUpperCase() || 'TN'} />
        </div>
      </Masthead>
      
      <ShellContainer>
        <Rail>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--s3)', marginBottom: 'var(--s5)', cursor: 'pointer', position: 'relative' }} onClick={() => setIsCountryOpen(!isCountryOpen)}>
            <div className="t-label" style={{ marginBottom: 'var(--s1)' }}>Country</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="t-body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', fontWeight: 600, color: 'var(--t-primary)' }}>
                <span className="outlet-mark">&#127475;&#127468;</span>
                Nigeria
              </span>
              <IconChevronDown size={14} style={{ color: 'var(--t-muted)' }} />
            </div>
            {isCountryOpen && (
              <div className="pop" style={{ display: 'block', position: 'absolute', top: '100%', left: 0, width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 'var(--s2)', marginTop: 'var(--s2)', zIndex: 10, boxShadow: 'var(--shadow-pop)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s2)', background: 'var(--active)', borderRadius: 'var(--r-sm)', color: 'var(--t-primary)', fontWeight: 600 }} className="t-body">
                  <span className="outlet-mark">&#127475;&#127468;</span>
                  Nigeria
                </div>
              </div>
            )}
          </div>
          
          <div className="t-label" style={{ margin: 'var(--s2) var(--s2) var(--s2)' }}>Nigeria</div>
          <NavItem active={activeTab === 'Coverage Diet'} onClick={() => setActiveTab('Coverage Diet')} icon={IconCircleDot} label="Coverage Diet" />
          <NavItem active={activeTab === 'Coverage Gaps'} onClick={() => setActiveTab('Coverage Gaps')} icon={IconChartPie} label="Coverage Gaps" />
          <NavItem active={activeTab === 'Alerts'} onClick={() => setActiveTab('Alerts')} icon={IconBell} label="Alerts" />
          <NavItem active={activeTab === 'Topics'} onClick={() => setActiveTab('Topics')} icon={IconHash} label="Topics" />
          <NavItem active={activeTab === 'Saved'} onClick={() => setActiveTab('Saved')} icon={IconBookmark} label="Saved" />
          
          <div style={{ height: '1px', background: 'var(--hair)', margin: 'var(--s4) var(--s2)' }}></div>
          
          <div className="t-label" style={{ margin: 'var(--s2) var(--s2) var(--s2)' }}>Your account</div>
          <NavItem active={activeTab === 'Subscription'} onClick={() => setActiveTab('Subscription')} icon={IconCrown} label="Subscription" />
          <NavItem active={activeTab === 'Account'} onClick={() => setActiveTab('Account')} icon={IconSettings} label="Account" />
        </Rail>
        
        <ContentArea>
          <div className="crumb"><span className="outlet-mark" style={{ marginRight: 'var(--s2)' }}>&#127475;&#127468;</span>Nigeria &middot; {activeTab}</div>
          
          {activeTab === 'Coverage Diet' && (
            <>
              <H1>Your reading summary</H1>
              <Body style={{ color: 'var(--t-sub)', margin: '0 0 var(--s5)', lineHeight: 1.5 }}>How you've been reading the news on TraceNews &mdash; the coverage you've seen, and the coverage you haven't.</Body>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s2)', padding: 'var(--s3) var(--s4)', background: 'var(--sunk)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', marginBottom: 'var(--s5)' }}>
                <Meta style={{ flex: 1 }}>
                  <b style={{ color: 'var(--t-body)', fontWeight: 600 }}>You control this.</b> {consentData.TOGGLE.promise} &mdash; {consentData.TOGGLE.shortNotice}
                </Meta>
                <a onClick={toggleConsent} className="t-meta" style={{ color: 'var(--v-clear)', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '1px solid color-mix(in srgb, var(--v-clear) 35%, transparent)' }}>
                  {hasConsent ? 'Tracking is ON (Manage)' : 'Tracking is OFF (Turn On)'}
                </a>
                <Meta>&middot;</Meta> 
                <a onClick={handleDeleteCounts} className="t-meta" style={{ color: 'var(--v-clear)', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '1px solid color-mix(in srgb, var(--v-clear) 35%, transparent)' }}>Delete all</a>
              </div>

              <Card>
                <SecHead title="Who you've been reading" subtitle="last 30 days" style={{ marginBottom: 'var(--s3)' }} />
                <div className="t-display" style={{ marginBottom: 'var(--s3)', fontWeight: 600, color: 'var(--t-primary)' }}>
                  Across {totalDiet} stories, your reading leaned {summary.mainstream > summary.govt ? 'mainstream' : 'government-aligned'} &mdash; with {summary.watchdog} from watchdog coverage.
                </div>
                <TierBar govt={summary.govt} main={summary.mainstream} watch={summary.watchdog} total={totalDiet} style={{ marginBottom: 'var(--s3)' }} />
                <TierLabels govt={summary.govt} main={summary.mainstream} watch={summary.watchdog} />
                <Meta style={{ marginTop: 'var(--s3)', fontStyle: 'italic' }}>Counts are outlet-visits across the stories you opened. Not a judgment about you &mdash; a log of what you read.</Meta>
                
                <div style={{ marginTop: 'var(--s4)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--hair)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
                    <b className="t-body" style={{ color: 'var(--t-primary)' }}>Recent stories you read</b>
                    {totalDiet > 0 && <span className="t-body" style={{ color: 'var(--v-clear)', cursor: 'pointer' }}>See all {totalDiet} &rarr;</span>}
                  </div>
                  {totalDiet === 0 ? (
                    <EmptyState message="You haven't read any stories yet." />
                  ) : (
                    <EmptyState message="We track your aggregate tiers to build your diet, but we explicitly do not save your personal reading history." />
                  )}
                </div>
              </Card>
            </>
          )}

          {activeTab === 'Coverage Gaps' && (
            <>
              <H1>Coverage Gaps</H1>
              <Body style={{ color: 'var(--t-sub)', margin: '0 0 var(--s5)', lineHeight: 1.5 }}>Understand how the stories you read vary in coverage across different outlets.</Body>
              
              <Card>
                <SecHead title="Coverage Gaps exposure" subtitle="last 30 days" style={{ marginBottom: 'var(--s3)' }} />
                <div className="t-display" style={{ marginBottom: 'var(--s3)', fontWeight: 600, color: 'var(--t-primary)' }}>
                  Of the <em style={{ fontFamily: 'var(--f-mono)', fontStyle: 'normal' }}>{totalDivergence}</em> stories you opened, {summary.broad > summary.partial ? 'most were covered broadly' : 'many had partial coverage'}.
                </div>
                <div className="tierbar" style={{ marginBottom: 'var(--s3)' }}>
                  <i style={{width: `${pct(summary.broad, totalDivergence)}%`, background: 'var(--v-clear)'}}></i>
                  <i style={{width: `${pct(summary.partial, totalDivergence)}%`, background: 'var(--v-mixed)'}}></i>
                </div>
                <div style={{ display: 'flex', gap: 'var(--s4)', fontFamily: 'var(--f-mono)' }} className="t-meta">
                  <span><Dot variant="v-clear" />Broad<b style={{ color: 'var(--t-body)', fontWeight: 500, marginLeft: 'var(--s1)' }}>{summary.broad}</b></span>
                  <span><Dot variant="v-mixed" />Partial<b style={{ color: 'var(--t-body)', fontWeight: 500, marginLeft: 'var(--s1)' }}>{summary.partial}</b></span>
                </div>
                
                <div style={{ marginTop: 'var(--s4)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--hair)' }}>
                  <Body style={{ marginBottom: 'var(--s4)' }}>
                    <b style={{ color: 'var(--t-primary)' }}>The {summary.partial} stories with partial coverage</b> &mdash; the coverage you may have missed.
                  </Body>
                  
                  {summary.partial === 0 ? (
                    <EmptyState message="No partial coverage stories opened yet." />
                  ) : (
                    <EmptyState message="We track your aggregate exposure to divergence, but we explicitly do not save which specific stories you opened." />
                  )}
                </div>
              </Card>
            </>
          )}

          {(activeTab === 'Saved' || activeTab === 'Topics' || activeTab === 'Alerts') && (
            <>
              <H1>{activeTab}</H1>
              <Body style={{ color: 'var(--t-sub)', margin: '0 0 var(--s5)', lineHeight: 1.5 }}>Your personal {activeTab.toLowerCase()} lists.</Body>
              <EmptyState message={`You have no ${activeTab.toLowerCase()} items yet.`} style={{ marginTop: 'var(--s5)' }} />
            </>
          )}

          {activeTab === 'Account' && (
            <>
              <H1>Account Settings</H1>
              <Card style={{ marginTop: 'var(--s5)' }}>
                <SecHead title="Data Management" style={{ marginBottom: 'var(--s3)' }} />
                <Body style={{ marginBottom: 'var(--s5)' }}>
                  TraceNews stores aggregate counters of the editorial tiers you read. 
                  We never store your personal reading history.
                </Body>
                <Button variant="danger" onClick={handleDeleteCounts}>Delete my counts</Button>
              </Card>

              <Card style={{ marginTop: 'var(--s5)' }}>
                <SecHead title="Session" style={{ marginBottom: 'var(--s3)' }} />
                <div style={{ marginTop: 'var(--s3)' }}>
                  <Button variant="secondary" onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  }}>Log Out</Button>
                </div>
              </Card>
            </>
          )}
          
          {activeTab === 'Subscription' && (
            <>
              <H1>Subscription</H1>
              <EmptyState 
                title="Subscriptions are coming soon" 
                message="Manage your TraceNews Premium subscription here once it launches." 
              />
            </>
          )}

          <div style={{ marginTop: 'var(--s6)' }}>
            <SecHead title="Reference" subtitle="what a “coming soon” country shows" />
            <EmptyState 
              title="TraceNews South Africa is coming" 
              message="We’re building the same coverage instrument for South Africa. Your Coverage Diet here will start the day it goes live." 
            />
          </div>
        </ContentArea>
      </ShellContainer>
    </AppShell>
  );
}
