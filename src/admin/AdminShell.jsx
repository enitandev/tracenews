import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isStaffRole, hasPermission } from './permissions';
import { ROUTES } from '../constants/routes';
import './desk.css';

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffName, setStaffName] = useState('Loading...');
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate(`${ROUTES.LOGIN}?redirect=` + encodeURIComponent(location.pathname));
        return;
      }
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      const isStaff = isStaffRole(userProfile?.role, userProfile?.is_staff);
      
      if (userProfile && isStaff) {
        setProfile(userProfile);
        setStaffName(userProfile.display_name || userProfile.email || 'Staff');
      } else {
        navigate(`${ROUTES.LOGIN}?redirect=` + encodeURIComponent(location.pathname));
      }
    };
    checkAuth();
  }, [navigate, location.pathname]);

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
            <div className="ri soon">Daily Briefing <span className="n">Soon</span></div>
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
          
          {children}
        </div>
      </div>
    </div>
  );
}
