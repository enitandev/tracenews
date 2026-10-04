import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isStaffRole } from './permissions';
import { ROUTES } from '../constants/routes';
import './desk.css';

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffName, setStaffName] = useState('Loading...');
  const [profile, setProfile] = useState(null);
  // checking | ok | error. The Desk is never silently blank: while the staff
  // check runs it says so, and if it fails it shows why, with a retry.
  const [check, setCheck] = useState({ status: 'checking' });
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
      } else {
        toLogin();
      }
    } catch (err) {
      console.error('Desk staff check failed:', err);
      setCheck({ status: 'error', message: err?.message || String(err) });
    }
  }, [navigate]);

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

  return (
    <div className="pg desk-scope">
      <div className="desk">
        <div className="mh">
          <div className="mh-top">
            <div className="mh-id">
              <span className="wm">Trace<i>News</i></span>
              <span className="desk-l">The Desk</span>
            </div>
            <div className="mh-meta">
              <span>{date}</span>
              <span className="who">{staffName} · {profile?.role || 'Super Admin'}</span>
            </div>
          </div>
          <div className="mh-rule"></div><div className="mh-rule2"></div>
        </div>

        <div className="dk">
          <aside className="rail">
            <p className="rg">Desk</p>
            <Link to={ROUTES.ADMIN} className={`ri ${location.pathname === ROUTES.ADMIN ? 'on' : ''}`} style={{textDecoration: 'none'}}>Overview</Link>
            <Link to={ROUTES.ADMIN_CORRECTIONS} className={`ri ${location.pathname.includes(ROUTES.ADMIN_CORRECTIONS) ? 'on' : ''}`} style={{textDecoration: 'none'}}>Corrections</Link>
            <div className="ri soon">Data requests <span className="n">Soon</span></div>
            <div className="ri soon">Audit ledger <span className="n">Soon</span></div>

            <p className="rg">Intelligence</p>
            <Link to={ROUTES.ADMIN_MONITORING} className={`ri ${location.pathname.includes(ROUTES.ADMIN_MONITORING) ? 'on' : ''}`} style={{textDecoration: 'none'}}>Monitoring Spirit</Link>
            <div className="ri soon">Outlets <span className="n">Soon</span></div>
            <Link to={ROUTES.ADMIN_POLITICIANS} className={`ri ${location.pathname.includes(ROUTES.ADMIN_POLITICIANS) ? 'on' : ''}`} style={{textDecoration: 'none'}}>Politicians</Link>
            <div className="ri soon">Stories <span className="n">Soon</span></div>
            <div className="ri soon">Taxonomy <span className="n">Soon</span></div>

            <p className="rg">Newsroom</p>
            <div className="ri soon">Reports <span className="n">Soon</span></div>
            <Link to={ROUTES.ADMIN_BRIEFING} className={`ri ${location.pathname.includes(ROUTES.ADMIN_BRIEFING) ? 'on' : ''}`} style={{textDecoration: 'none'}}>Daily Briefing</Link>
            <div className="ri soon">Newsletter <span className="n">Soon</span></div>
            <div className="ri soon">Site copy <span className="n">Soon</span></div>

            <p className="rg">People</p>
            <div className="ri soon">Readers <span className="n">Soon</span></div>
            <div className="ri soon">Staff <span className="n">Soon</span></div>
            <div className="ri soon">Subscriptions <span className="n">Soon</span></div>

            <p className="rg">Platform</p>
            <div className="ri soon">Ingestion <span className="n">Soon</span></div>
            <div className="ri soon">Scorer <span className="n">Soon</span></div>
            <div className="ri soon">Deploys <span className="n">Soon</span></div>
            <div className="ri soon">Counsel file <span className="n">Soon</span></div>
          </aside>
          
          {/* Nothing under the desk mounts until a staff profile is confirmed */}
          {profile ? children : (
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
  );
}
