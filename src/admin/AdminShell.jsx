import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isStaffRole } from './permissions';
import { ROUTES } from '../constants/routes';
import './desk.css';
import DeskErrorBoundary from './DeskErrorBoundary';
import Logo from '../components/Logo';
import { DeskContext } from './desk/context';
import { deskFetch } from './desk/api';

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffName, setStaffName] = useState('Loading...');
  const [profile, setProfile] = useState(null);
  // checking | ok | error. The Desk is never silently blank: while the staff
  // check runs it says so, and if it fails it shows why, with a retry.
  const [check, setCheck] = useState({ status: 'checking' });
  // The Desk summary (counts, queue, health), shared with every screen; a
  // screen calls refresh() after an action so the rail counts stay true.
  const [summary, setSummary] = useState(null);
  const refresh = useCallback(() => deskFetch('/api/admin/desk')
    .then(setSummary)
    .catch(err => console.error('Desk summary failed to load:', err)), []);
  const pathRef = useRef(location.pathname);
  useEffect(() => { pathRef.current = location.pathname; }, [location.pathname]);

  const checkAuth = useCallback(async () => {
    const toLogin = () => navigate(`${ROUTES.LOGIN}?redirect=` + encodeURIComponent(pathRef.current));
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) { toLogin(); return; }
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      if (userProfile && isStaffRole(userProfile.role, userProfile.is_staff)) {
        setProfile(userProfile);
        setStaffName(userProfile.display_name || userProfile.email || 'Staff');
        setCheck({ status: 'ok' });
        refresh();
      } else {
        toLogin();
      }
    } catch (err) {
      console.error('Desk staff check failed:', err);
      setCheck({ status: 'error', message: err?.message || String(err) });
    }
  }, [navigate, refresh]);

  useEffect(() => {
    // Once when the Desk opens, and again whenever the session changes or its
    // token is refreshed (not on every tab click).
    Promise.resolve().then(checkAuth);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') checkAuth();
      if (event === 'SIGNED_OUT') navigate(ROUTES.LOGIN);
    });
    return () => subscription.unsubscribe();
  }, [checkAuth, navigate]);

  const date = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const c = summary?.counts || {};
  // Only tools that exist. A count shows what is waiting; amber when it needs you.
  const groups = [
    { title: 'Desk', links: [
      { to: ROUTES.ADMIN, label: 'Overview', exact: true },
      { to: ROUTES.ADMIN_CORRECTIONS, label: 'Corrections', n: c.corrections_open, att: c.corrections_overdue > 0 },
    ] },
    { title: 'Newsroom', links: [
      { to: ROUTES.ADMIN_BRIEFING, label: 'Daily Briefing', n: c.briefing_waiting, att: c.briefing_waiting_me > 0 },
    ] },
    { title: 'Intelligence', links: [
      { to: ROUTES.ADMIN_POLITICIANS, label: 'Politicians', n: c.politicians_held },
      { to: ROUTES.ADMIN_MONITORING, label: 'Monitoring Spirit', n: c.verdicts },
    ] },
  ];
  const isOn = l => (l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to));

  return (
    <DeskContext.Provider value={{ summary, refresh, profile }}>
    <div className="pg desk-scope">
      <div className="desk">
        <div className="mh">
          <div className="mh-top">
            <Link to={ROUTES.ADMIN} className="mh-id" style={{ textDecoration: 'none' }} aria-label="TraceNews Desk overview">
              <span className="logo"><Logo height="60px" /></span>
              <span className="desk-l">The Desk</span>
            </Link>
            <div className="mh-meta">
              <span>{date}</span>
              <span className="who">{staffName}{profile?.role ? ` · ${profile.role.replace('_', ' ')}` : ''}</span>
            </div>
          </div>
          <div className="mh-rule"></div><div className="mh-rule2"></div>
        </div>

        <div className="dk">
          <nav className="rail" aria-label="Desk">
            {groups.map(g => (
              <div key={g.title}>
                <p className="rg">{g.title}</p>
                {g.links.map(l => (
                  <Link key={l.to} to={l.to} className={`ri ${isOn(l) ? 'on' : ''}`} style={{ textDecoration: 'none' }}
                        aria-current={isOn(l) ? 'page' : undefined}>
                    {l.label}
                    {l.n > 0 && <span className={`n ${l.att ? 'att' : ''}`}>{l.n}</span>}
                  </Link>
                ))}
              </div>
            ))}
            <p className="rg">Site</p>
            <Link to="/" className="ri" style={{ textDecoration: 'none' }}>Open tracenews.ng ↗</Link>
          </nav>

          {/* Nothing under the desk mounts until a staff profile is confirmed */}
          {profile ? <DeskErrorBoundary resetKey={location.pathname}>{children}</DeskErrorBoundary> : (
            <div className="desk-col" style={{ borderRight: 'none' }}>
              {check.status === 'error' ? (
                <>
                  <p className="t-label">The Desk could not confirm your staff account</p>
                  <p className="t-meta" style={{ margin: 'var(--s2) 0 var(--s4)' }}>{check.message}</p>
                  <button className="btn btn-primary btn-sm" onClick={() => { setCheck({ status: 'checking' }); checkAuth(); }}>Try again</button>
                </>
              ) : (
                <p className="t-meta">Checking your staff account…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </DeskContext.Provider>
  );
}
