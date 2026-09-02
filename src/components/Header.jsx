import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import Logo from './Logo';
import { supabase } from '../lib/supabase';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data || null))
          .catch((err) => {
            console.error('Failed to load user profile:', err);
            supabase.from('admin_audit_log').insert([{ action: 'client_error', target_id: session.user.id, details: { error: err.message, component: 'Header', context: 'profile_fetch_failed' } }]).catch(() => {});
            setProfile(null);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data || null))
          .catch((err) => {
            console.error('Failed to load user profile:', err);
            supabase.from('admin_audit_log').insert([{ action: 'client_error', target_id: session.user.id, details: { error: err.message, component: 'Header', context: 'profile_fetch_failed' } }]).catch(() => {});
            setProfile(null);
          });
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/search?q=${encodeURIComponent(searchQuery)}`)
        .then(r => r.json())
        .then(data => setSearchResults(data || []))
        .catch(err => console.error(err));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);



  return (
    <header style={{ width: '100%', fontFamily: 'Montserrat, sans-serif' }}>
      {/* TIER 1: Promo Bar */}
      {!session && (
        <div style={{ background: 'var(--header-promo)', padding: '12px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>See every side of every news story</span>
            <button style={{ background: '#1a1a1a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* TIER 2: Utility Bar */}
      <div className="hide-on-mobile" style={{ background: 'var(--header-util)', padding: '8px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--header-util-text)', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span style={{ cursor: 'pointer' }}>Browser Extension</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ opacity: 0.7 }}>Theme:</span>
              <button onClick={() => toggleTheme('light')} style={{ background: 'none', border: 'none', color: theme === 'light' ? '#fff' : 'var(--header-util-text)', opacity: theme === 'light' ? 1 : 0.6, cursor: 'pointer', fontWeight: theme === 'light' ? 600 : 400 }}>Light</button>
              <button onClick={() => toggleTheme('dark')} style={{ background: 'none', border: 'none', color: theme === 'dark' ? '#fff' : 'var(--header-util-text)', opacity: theme === 'dark' ? 1 : 0.6, cursor: 'pointer', fontWeight: theme === 'dark' ? 600 : 400 }}>Dark</button>
              <button style={{ background: 'none', border: 'none', color: 'var(--header-util-text)', opacity: 0.6, cursor: 'pointer' }}>Auto</button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <span>Saturday, June 6, 2026</span>
            <span style={{ cursor: 'pointer' }}>Set Location</span>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>🌍 International Edition ⌄</span>
          </div>
        </div>
      </div>

      {/* TIER 3: Main Navbar */}
      <div style={{ background: 'var(--header-main)', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Menu size={24} color="var(--text-primary)" style={{ cursor: 'pointer' }} onClick={() => setIsSidebarOpen(true)} />
            <div style={{ marginLeft: 'var(--s5)', fontSize: '32px', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ borderRight: '1px solid var(--border)', paddingRight: '12px', marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                 <Logo height="66px" />
              </span>
            </div>
            
            <nav className="hide-on-mobile" style={{ display: 'flex', gap: '20px', fontWeight: 600, fontSize: '15px' }}>
              <Link to="/" style={{ color: 'var(--text-primary)', textDecoration: 'none', borderBottom: location.pathname === '/' ? '2px solid var(--text-primary)' : 'none', paddingBottom: '4px' }}>Home</Link>
              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>For You</a>
              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Local</a>
              <Link to="/daily-briefing" style={{ color: 'var(--text-primary)', textDecoration: 'none', borderBottom: location.pathname.startsWith('/daily-briefing') ? '2px solid var(--text-primary)' : 'none', paddingBottom: '4px' }}>Daily Briefing</Link>
              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Monitoring Spirit</a>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'flex-end' }}>
            <div ref={searchRef} className="hide-on-mobile" style={{ position: 'relative', width: '300px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none' }} 
              />
              
              {isSearchOpen && searchResults.length > 0 && searchQuery && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', zIndex: 100, maxHeight: '400px', overflowY: 'auto', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                  {searchResults.map(c => (
                    <Link 
                      key={c.id} 
                      to={`/story/${c.slug}`} 
                      onClick={() => setIsSearchOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-primary)', textAlign: 'left' }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', lineHeight: 1.3 }}>{c.representative_title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.outlet_count} sources • {c.category || 'General'}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            {session ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <div 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                >
                  {profile?.display_name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                {isMenuOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', zIndex: 100, minWidth: '200px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', padding: '8px 0', overflow: 'hidden' }}>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Your dashboard</Link>
                    <Link to="/settings" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Settings</Link>
                    {profile?.is_staff && (
                      <Link to="/admin/corrections" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>Staff console</Link>
                    )}
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }}></div>
                    <button onClick={handleSignOut} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="hide-on-mobile" style={{ background: 'var(--text-primary)', color: 'var(--bg-base)', border: 'none', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Subscribe</button>
                <Link to="/login" className="hide-on-mobile" style={{ display: 'inline-block', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border)', padding: '10px 24px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', textDecoration: 'none' }}>Login</Link>
              </>
            )}
          </div>

        </div>
      </div>

      {/* TIER 4: Ticker */}
      <div style={{ background: 'var(--header-ticker)', padding: '12px 20px', borderBottom: '1px solid var(--border)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📈 Trending
          </span>
          {['Politics', 'Economy', 'Security', 'Entertainment', 'Sports', 'Technology', 'Health'].map(cat => (
            <Link key={cat} to={`/topics/${cat.toLowerCase()}`} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              {cat} <span>+</span>
            </Link>
          ))}
        </div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        setIsSearchOpen={setIsSearchOpen}
        isSearchOpen={isSearchOpen}
      />
    </header>
  );
}
