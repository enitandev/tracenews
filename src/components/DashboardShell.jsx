import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardShell({ children }) {
  const location = useLocation();
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // The rail items matching tracenews-dashboard-shell.reference.html
  // Nigeria is the only live country group, others are Soon
  return (
    <>
      <div className="mast">
        <div className="brand">Trace<b>News</b></div>
        <nav>
          <Link to="/">Home</Link>
          <div className="nav-item soon" style={{ opacity: 0.5, fontSize: '13px', cursor: 'default' }}>For You</div>
          <div className="nav-item soon" style={{ opacity: 0.5, fontSize: '13px', cursor: 'default' }}>Local</div>
          <Link to="/daily-briefing">Daily Briefing</Link>
          <Link to="/admin/monitoring-spirit">Monitoring Spirit</Link>
          <Link to="/dashboard" className="on">Account</Link>
        </nav>
        <div className="right">
          <button className="toggle" onClick={() => toggleTheme()}>
            {theme === 'dark' ? '◐ Light' : '◑ Dark'}
          </button>
          <span className="avatar">EB</span>
        </div>
      </div>
      
      <div className="shell">
        <aside className="rail">
          <div className="cswitch" onClick={() => setIsCountryOpen(!isCountryOpen)}>
            <div className="lab">Country</div>
            <div className="cur">
              <span className="c"><span className="flag">🇳🇬</span>Nigeria</span>
              <i className="ti ti-chevron-down chev"></i>
            </div>
            {isCountryOpen && (
              <div className="pop" style={{ display: 'block' }}>
                <div className="popitem on"><span className="c"><span className="flag">🇳🇬</span>Nigeria</span></div>
                <div className="popitem"><span className="c"><span className="flag">🇿🇦</span>South Africa</span><span className="soontag">Soon</span></div>
                <div className="popitem"><span className="c"><span className="flag">🇰🇪</span>Kenya</span><span className="soontag">Soon</span></div>
                <div className="popitem"><span className="c"><span className="flag">🇪🇬</span>Egypt</span><span className="soontag">Soon</span></div>
              </div>
            )}
          </div>

          <div className="railgroup">Nigeria</div>
          <Link to="/dashboard" className={`navitem ${location.pathname === '/dashboard' ? 'on' : ''}`} style={{ textDecoration: 'none' }}>
            <i className="ti ti-chart-donut"></i>Coverage Diet
          </Link>
          {/* Stubs with disabled/Soon treatment per user instruction */}
          <div className="navitem soon" style={{ opacity: 0.6, cursor: 'default' }}>
            <i className="ti ti-eye"></i>Divergence
          </div>
          <div className="navitem soon" style={{ opacity: 0.6, cursor: 'default' }}>
            <i className="ti ti-bell"></i>Alerts
          </div>
          <div className="navitem soon" style={{ opacity: 0.6, cursor: 'default' }}>
            <i className="ti ti-hash"></i>Topics
          </div>
          <div className="navitem soon" style={{ opacity: 0.6, cursor: 'default' }}>
            <i className="ti ti-bookmark"></i>Saved
          </div>
          
          <div className="railsep"></div>
          
          <div className="railgroup">Your account</div>
          <div className="navitem soon" style={{ opacity: 0.6, cursor: 'default' }}>
            <i className="ti ti-crown"></i>Subscription
          </div>
          <Link to="/settings" className="navitem" style={{ textDecoration: 'none' }}>
            <i className="ti ti-settings"></i>Account
          </Link>
          <div className="navitem" onClick={async () => {
            const { supabase } = await import('../lib/supabase');
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}>
            <i className="ti ti-logout"></i>Sign Out
          </div>
        </aside>
        <main className="content">
          {children}
        </main>
      </div>
    </>
  );
}
