import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppShell, Masthead, ShellContainer, Rail, ContentArea } from '../components/ds/Layout';
import { ThemeToggle } from '../components/ds/Toggle';
import Logo from '../components/Logo';
import { Button } from '../components/ds/Button';
import { isStaffRole, hasPermission } from './permissions';

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { id: 'corrections', label: 'Corrections Queue', path: '/admin/corrections', active: true },
    { id: 'monitoring_spirit', label: 'Monitoring Spirit', path: '/admin/monitoring-spirit', active: true },
    { id: 'politicians', label: 'Politicians Review', path: '/admin/politicians', active: true },
    { id: 'reports', label: 'Content Taxonomy', path: '#', active: false },
    { id: 'staff_management', label: 'User Management', path: '#', active: false },
  ];

  return (
    <AppShell>
      <Masthead brandLink="/admin/corrections">
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: 'var(--s4)' }}>
          <span className="t-sub" style={{ fontWeight: 600, fontSize: '14px', marginLeft: 'var(--s3)', borderLeft: '1px solid var(--border)', paddingLeft: 'var(--s3)' }}>Staff Console</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)', marginRight: 'var(--s5)' }}>
          <span className="t-muted" style={{ fontSize: '13px' }}>Signed in as {staffName}</span>
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={handleLogout}>Log Out</Button>
        </div>
      </Masthead>
      <ShellContainer>
        <Rail>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
            {navItems.map((item, idx) => {
              if (profile && !hasPermission(profile.role, profile.is_staff, item.id, 'view')) {
                return null; // hide rail item if user lacks permission
              }
              const isActiveRoute = location.pathname === item.path;
              if (!item.active) {
                return (
                  <div key={idx} style={{ padding: 'var(--s3) var(--s4)', borderRadius: 'var(--r-sm)', color: 'var(--t-faint)', cursor: 'not-allowed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px' }}>{item.label}</span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', background: 'var(--raised)', padding: '2px 6px', borderRadius: '4px' }}>Soon</span>
                  </div>
                );
              }
              return (
                <Link key={idx} to={item.path} style={{
                  padding: 'var(--s3) var(--s4)',
                  borderRadius: 'var(--r-sm)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  color: isActiveRoute ? 'var(--v-brand)' : 'var(--t-body)',
                  background: isActiveRoute ? 'var(--raised)' : 'transparent',
                  fontWeight: isActiveRoute ? 600 : 400
                }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Rail>
        <ContentArea>
          {children}
        </ContentArea>
      </ShellContainer>
    </AppShell>
  );
}
