import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { isStaffRole, hasPermission } from './permissions';
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
        navigate('/login?redirect=' + encodeURIComponent(location.pathname));
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
        navigate('/login?redirect=' + encodeURIComponent(location.pathname));
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
            <Link to="/admin" className={`ri ${location.pathname === '/admin' ? 'on' : ''}`} style={{textDecoration: 'none'}}>Overview</Link>
            <Link to="/admin/corrections" className={`ri ${location.pathname.includes('/corrections') ? 'on' : ''}`} style={{textDecoration: 'none'}}>Corrections</Link>
            <div className="ri soon">Data requests <span className="n">Soon</span></div>
            <div className="ri soon">Audit ledger <span className="n">Soon</span></div>

            <p className="rg">Intelligence</p>
            <Link to="/admin/monitoring-spirit" className={`ri ${location.pathname.includes('/monitoring-spirit') ? 'on' : ''}`} style={{textDecoration: 'none'}}>Monitoring Spirit</Link>
            <div className="ri soon">Outlets <span className="n">Soon</span></div>
            <Link to="/admin/politicians" className={`ri ${location.pathname.includes('/politicians') ? 'on' : ''}`} style={{textDecoration: 'none'}}>Politicians</Link>
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
