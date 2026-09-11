import re

with open("src/components/Header.jsx", "r") as f:
    content = f.read()

# 1. Imports
old_imports = """import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Menu } from 'lucide-react';
import Sidebar from './Sidebar';"""

new_imports = """import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Menu } from 'lucide-react';
import Sidebar from './Sidebar';"""

content = content.replace(old_imports, new_imports)

# 2. State & Hooks
old_comp = """export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return ("""

new_comp = """export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return ("""

content = content.replace(old_comp, new_comp)

# 3. Search UI
old_search = """            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Search" style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-hover)', color: 'var(--text-primary)', outline: 'none' }} />
            </div>"""

new_search = """            <div ref={searchRef} style={{ position: 'relative', width: '300px' }}>
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
            </div>"""

content = content.replace(old_search, new_search)

with open("src/components/Header.jsx", "w") as f:
    f.write(content)

