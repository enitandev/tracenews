import re

with open("src/pages/Home.jsx", "r") as f:
    content = f.read()

# 1. Add state and effect
old_state = """export default function Home() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {"""

new_state = """export default function Home() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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

  useEffect(() => {"""

content = content.replace(old_state, new_state)

# 2. Add Search UI
old_ui = """  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* PHASE 1: THE TOP FOLD */}"""

new_ui = """  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* SEARCH BAR */}
      <div style={{ marginBottom: '32px', position: 'relative' }}>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search news clusters..."
          style={{ width: '100%', padding: '16px', fontSize: '18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
        />
        {searchResults.length > 0 && searchQuery && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', zIndex: 100, maxHeight: '400px', overflowY: 'auto', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            {searchResults.map(c => (
              <Link key={c.id} to={`/story/${c.slug}`} style={{ display: 'block', padding: '16px', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-primary)', transition: 'background 0.2s' }}>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{c.representative_title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.outlet_count} sources • {c.category || 'General'}</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* PHASE 1: THE TOP FOLD */}"""

content = content.replace(old_ui, new_ui)

with open("src/pages/Home.jsx", "w") as f:
    f.write(content)

