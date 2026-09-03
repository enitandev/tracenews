import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import consentData from '../components/MonitoringSpirit/readerAnalyticsConsent.json';
import {
  AppShell, Masthead, ShellContainer, Rail, ContentArea,
  Button, EmptyState, NavItem, ThemeToggle,
  TierBar, TierLabels, Avatar, Card, CardHead,
  H1, Body, Meta, SecHead, Dot
} from '../components/ds';
import { Modal } from '../components/ds/Feedback';
import { Switch } from '../components/ds/Toggle';
import { Field, Input } from '../components/ds/Form';
import { 
  IconCircleDot, IconChartPie, IconBell, IconHash, IconBookmark,
  IconCrown, IconSettings, IconChevronDown
} from '@tabler/icons-react';

export default function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize from path
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === '/dashboard/settings') return 'Settings';
    return 'Coverage Diet';
  });

  // Sync path to tab if path changes externally (like back button)
  useEffect(() => {
    if (location.pathname === '/dashboard/settings') {
      setActiveTab('Settings');
    } else if (activeTab === 'Settings') {
      setActiveTab('Coverage Diet');
    }
  }, [location.pathname]);

  // Sync tab to path
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'Settings') {
      navigate('/dashboard/settings');
    } else if (location.pathname === '/dashboard/settings') {
      navigate('/dashboard');
    }
  };
  
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({ govt: 0, mainstream: 0, watchdog: 0, broad: 0, partial: 0 });
  const [hasConsent, setHasConsent] = useState(false);
  const [consentLoading, setConsentLoading] = useState(true);

  // Settings states
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCountsModalOpen, setIsCountsModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?redirect=' + encodeURIComponent(location.pathname));
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
      setIsCountsModalOpen(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword('');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const res = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete account");
      }

      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
      setDeleteLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
          <NavItem active={activeTab === 'Coverage Diet'} onClick={() => handleTabChange('Coverage Diet')} icon={IconCircleDot} label="Coverage Diet" />
          <NavItem active={activeTab === 'Coverage Gaps'} onClick={() => handleTabChange('Coverage Gaps')} icon={IconChartPie} label="Coverage Gaps" />
          <NavItem active={activeTab === 'Alerts'} onClick={() => handleTabChange('Alerts')} icon={IconBell} label="Alerts" />
          <NavItem active={activeTab === 'Topics'} onClick={() => handleTabChange('Topics')} icon={IconHash} label="Topics" />
          <NavItem active={activeTab === 'Saved'} onClick={() => handleTabChange('Saved')} icon={IconBookmark} label="Saved" />
          
          <div style={{ height: '1px', background: 'var(--hair)', margin: 'var(--s4) var(--s2)' }}></div>
          
          <div className="t-label" style={{ margin: 'var(--s2) var(--s2) var(--s2)' }}>Your account</div>
          <NavItem active={activeTab === 'Subscription'} onClick={() => handleTabChange('Subscription')} icon={IconCrown} label="Subscription" />
          <NavItem active={activeTab === 'Settings'} onClick={() => handleTabChange('Settings')} icon={IconSettings} label="Settings" />
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
                <a onClick={() => setIsCountsModalOpen(true)} className="t-meta" style={{ color: 'var(--v-clear)', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: '1px solid color-mix(in srgb, var(--v-clear) 35%, transparent)' }}>Delete all</a>
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

          {activeTab === 'Settings' && (
            <div style={{ maxWidth: '600px' }}>
              <H1>Settings</H1>
              
              <div style={{ marginTop: 'var(--s6)' }}>
                <SecHead title="Profile" />
                <div style={{ margin: 'var(--s4) 0' }}>
                  <div style={{ fontSize: '12.5px', color: 'var(--t-body)', marginBottom: 'var(--s4)' }}>
                    <span style={{ color: 'var(--t-sub)' }}>Email:</span> <span style={{ fontWeight: 500 }}>{user?.email}</span>
                  </div>
                  
                  <form onSubmit={handleChangePassword}>
                    <Field label="Change Password" error={passwordError}>
                      <Input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                        hasError={!!passwordError}
                        placeholder="New password"
                        style={{ maxWidth: '280px' }}
                      />
                    </Field>
                    <Button type="submit" variant="secondary" size="sm" loading={passwordLoading} disabled={!newPassword}>Update Password</Button>
                    {passwordSuccess && <span style={{ fontSize: '11.5px', color: 'var(--success)', marginLeft: '12px' }}>Password updated.</span>}
                  </form>
                </div>
              </div>

              <div style={{ marginTop: 'var(--s6)' }}>
                <SecHead title="Data & Privacy" />
                <div style={{ margin: 'var(--s4) 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--s4)' }}>
                    <div style={{ fontSize: '12.5px', color: 'var(--t-body)' }}>
                      <strong>Reader Analytics</strong>
                      <p style={{ margin: '4px 0 0', color: 'var(--t-sub)' }}>Allow TraceNews to aggregate your reading diet.</p>
                    </div>
                    <Switch checked={hasConsent} onChange={toggleConsent} />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--s3)' }}>
                    <Button variant="secondary" size="sm">Export my data</Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsCountsModalOpen(true)}>Delete my counts</Button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--s6)' }}>
                <SecHead title="Notifications" />
                <div style={{ margin: 'var(--s4) 0' }}>
                  <EmptyState message="Notification preferences coming soon." />
                </div>
              </div>

              <div style={{ marginTop: 'var(--s6)' }}>
                <SecHead title="Session" />
                <div style={{ margin: 'var(--s4) 0' }}>
                  <Button variant="secondary" size="sm" onClick={handleSignOut}>Log Out</Button>
                </div>
              </div>

              <div style={{ marginTop: 'var(--s6)' }}>
                <SecHead title="Danger Zone" />
                <div style={{ margin: 'var(--s4) 0' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--t-body)', marginBottom: 'var(--s4)' }}>
                    Deleting your account is permanent. This removes all your reading data, saved stories, and alerts.
                  </p>
                  <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Delete Account</Button>
                </div>
              </div>
            </div>
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

      <Modal
        isOpen={isCountsModalOpen}
        onClose={() => setIsCountsModalOpen(false)}
        title="Delete reading counts?"
        description="This will reset your Coverage Diet and Coverage Gaps charts. This action cannot be undone."
        primaryAction={handleDeleteCounts}
        primaryText="Delete Counts"
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteError(null); }}
        title="Delete Account?"
        description="This will permanently delete your TraceNews account and all associated data. This action cannot be undone."
        primaryAction={handleDeleteAccount}
        primaryText={deleteLoading ? "Deleting..." : "Delete Account"}
      >
        {deleteError && (
          <div style={{ padding: '8px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginTop: '12px', fontSize: '12px' }}>
            {deleteError}
          </div>
        )}
      </Modal>

    </AppShell>
  );
}
