import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppShell, Masthead, ShellContainer, Rail, ContentArea } from '../components/ds/Layout';
import { ThemeToggle } from '../components/ds/Toggle';
import Logo from '../components/Logo';
import { Button } from '../components/ds/Button';

export default function AdminShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffName, setStaffName] = useState('Loading...');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (profile && profile.is_staff) {
        setStaffName(profile.display_name || profile.email || 'Staff');
      } else {
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Corrections Queue', path: '/admin/corrections', active: true },
    { label: 'Monitoring Spirit', path: '/admin/monitoring-spirit', active: true },
    { label: 'Politicians Review', path: '/admin/politicians', active: true },
    { label: 'Content Taxonomy', path: '#', active: false },
    { label: 'User Management', path: '#', active: false },
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
