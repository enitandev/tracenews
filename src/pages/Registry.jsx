import { useState, useMemo } from "react";
import outlets from "../data/outlets.json";
import {
  Search, Filter, Globe, Radio, Tv, Newspaper,
  ChevronDown, ChevronUp, ExternalLink, Eye, EyeOff,
  AlertCircle, CheckCircle, HelpCircle
} from "lucide-react";

const LEAN_COLORS = {
  "National":      { bg: "#1a2a1a", border: "#2d5a2d", text: "#6fcf6f" },
  "Southwest":     { bg: "#1a1a2e", border: "#2d2d6b", text: "#7b7bf5" },
  "Southeast":     { bg: "#2a1a1a", border: "#6b2d2d", text: "#f57b7b" },
  "North":         { bg: "#2a2a1a", border: "#6b6b2d", text: "#f5f57b" },
  "North Central": { bg: "#1a2a2a", border: "#2d6b6b", text: "#7bf5f5" },
  "Niger Delta":   { bg: "#2a1a2a", border: "#6b2d6b", text: "#f57bf5" },
};

const PARTY_COLORS = {
  "APC":     "#00aa44",
  "PDP":     "#e53e3e",
  "LP":      "#d69e2e",
  "NNPP":    "#805ad5",
  "None":    "#4a5568",
  "Unknown": "#2d3748",
};

const MEDIUM_ICONS = {
  online:    <Globe size={12} />,
  print:     <Newspaper size={12} />,
  broadcast: <Tv size={12} />,
};

const TRANSPARENCY_ICONS = {
  high:   <CheckCircle size={12} className="text-green-400" />,
  medium: <HelpCircle size={12} className="text-yellow-400" />,
  low:    <AlertCircle size={12} className="text-red-400" />,
};

function Badge({ children, style, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

function OutletRow({ outlet, expanded, onToggle }) {
  const lean = LEAN_COLORS[outlet.geopolitical_lean] || LEAN_COLORS["National"];

  return (
    <div
      className="outlet-row"
      style={{ borderLeft: `3px solid ${lean.border}` }}
    >
      <div
        className="outlet-header"
        onClick={onToggle}
      >
        <div className="outlet-main">
          <div className="outlet-name-row">
            <span className="outlet-name">{outlet.name}</span>
            <div className="outlet-badges">
              {outlet.medium.map(m => (
                <Badge key={m} className="badge-medium">
                  {MEDIUM_ICONS[m]} {m}
                </Badge>
              ))}
              <Badge style={{
                background: lean.bg,
                border: `1px solid ${lean.border}`,
                color: lean.text,
              }}>
                {outlet.geopolitical_lean}
              </Badge>
              {outlet.party_proximity !== "None" && outlet.party_proximity !== "Unknown" && (
                <Badge style={{
                  background: `${PARTY_COLORS[outlet.party_proximity]}22`,
                  border: `1px solid ${PARTY_COLORS[outlet.party_proximity]}66`,
                  color: PARTY_COLORS[outlet.party_proximity],
                }}>
                  {outlet.party_proximity}
                </Badge>
              )}
              {outlet.ownership_type === "government" && (
                <Badge className="badge-gov">GOV</Badge>
              )}
              {outlet.ownership_type === "foreign" && (
                <Badge className="badge-foreign">FOREIGN</Badge>
              )}
            </div>
          </div>
          <div className="outlet-meta">
            <span className="meta-item">{outlet.headquarters_city}</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">Est. {outlet.founded_year}</span>
            <span className="meta-dot">·</span>
            <span className="meta-item">{outlet.reach}</span>
            <span className="meta-dot">·</span>
            <span className="meta-item transparency">
              {TRANSPARENCY_ICONS[outlet.ownership_transparency]}
              {outlet.ownership_transparency} transparency
            </span>
          </div>
        </div>
        <div className="outlet-toggle">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div className="outlet-detail">
          <div className="detail-grid">
            <div className="detail-block">
              <div className="detail-label">Ownership</div>
              <div className="detail-value">{outlet.ownership_name}</div>
            </div>
            <div className="detail-block">
              <div className="detail-label">Religious Framing</div>
              <div className="detail-value">{outlet.religious_framing}</div>
            </div>
            <div className="detail-block">
              <div className="detail-label">Languages</div>
              <div className="detail-value">{outlet.languages.join(", ")}</div>
            </div>
            <div className="detail-block">
              <div className="detail-label">RSS Feeds</div>
              <div className="detail-value">
                {outlet.rss_feeds.length > 0
                  ? outlet.rss_feeds.map((feed, i) => (
                      <a key={i} href={feed} target="_blank" rel="noreferrer"
                        className="feed-link">
                        {feed} <ExternalLink size={10} />
                      </a>
                    ))
                  : <span className="no-data">None configured</span>
                }
              </div>
            </div>
            {outlet.notes && (
              <div className="detail-block full">
                <div className="detail-label">Notes</div>
                <div className="detail-value note">{outlet.notes}</div>
              </div>
            )}
            <div className="detail-block full">
              <div className="detail-label">Social Handles</div>
              <div className="detail-value socials">
                {Object.entries(outlet.social_handles).map(([platform, handle]) => (
                  <span key={platform} className="social-tag">
                    {platform}: {handle}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="detail-actions">
            <a href={outlet.website} target="_blank" rel="noreferrer" className="action-btn">
              Visit Website <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Registry() {
  const [search, setSearch] = useState("");
  const [filterLean, setFilterLean] = useState("All");
  const [filterMedium, setFilterMedium] = useState("All");
  const [filterOwnership, setFilterOwnership] = useState("All");
  const [expandedId, setExpandedId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return outlets.filter(o => {
      const matchSearch =
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.headquarters_city.toLowerCase().includes(search.toLowerCase()) ||
        o.ownership_name.toLowerCase().includes(search.toLowerCase());
      const matchLean = filterLean === "All" || o.geopolitical_lean === filterLean;
      const matchMedium = filterMedium === "All" || o.medium.includes(filterMedium);
      const matchOwnership = filterOwnership === "All" || o.ownership_type === filterOwnership;
      return matchSearch && matchLean && matchMedium && matchOwnership;
    });
  }, [search, filterLean, filterMedium, filterOwnership]);

  const leans = ["All", ...Object.keys(LEAN_COLORS)];
  const mediums = ["All", "online", "print", "broadcast"];
  const ownerships = ["All", "private", "government", "foreign"];

  return (
    <div className="registry-page">
      <div className="registry-header">
        <div className="header-title">
          <div className="logo-mark">TN</div>
          <div>
            <h1>Outlet Registry</h1>
            <p className="subtitle">Nigerian Media Intelligence Database</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{outlets.length}</span>
            <span className="stat-label">Total Outlets</span>
          </div>
          <div className="stat">
            <span className="stat-number">{outlets.filter(o => o.active).length}</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-number">{outlets.filter(o => o.ownership_type === "government").length}</span>
            <span className="stat-label">Gov-Owned</span>
          </div>
          <div className="stat">
            <span className="stat-number">{outlets.filter(o => o.ownership_type === "foreign").length}</span>
            <span className="stat-label">Foreign-Owned</span>
          </div>
        </div>
      </div>

      <div className="registry-controls">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search outlets, cities, ownership..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className={`filter-toggle ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} /> Filters
          {(filterLean !== "All" || filterMedium !== "All" || filterOwnership !== "All") && (
            <span className="filter-dot" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Geopolitical Lean</label>
            <div className="filter-options">
              {leans.map(l => (
                <button
                  key={l}
                  className={`filter-chip ${filterLean === l ? "active" : ""}`}
                  onClick={() => setFilterLean(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Medium</label>
            <div className="filter-options">
              {mediums.map(m => (
                <button
                  key={m}
                  className={`filter-chip ${filterMedium === m ? "active" : ""}`}
                  onClick={() => setFilterMedium(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>Ownership Type</label>
            <div className="filter-options">
              {ownerships.map(o => (
                <button
                  key={o}
                  className={`filter-chip ${filterOwnership === o ? "active" : ""}`}
                  onClick={() => setFilterOwnership(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="results-count">
        {filtered.length} outlet{filtered.length !== 1 ? "s" : ""} found
      </div>

      <div className="outlet-list">
        {filtered.map(outlet => (
          <OutletRow
            key={outlet.id}
            outlet={outlet}
            expanded={expandedId === outlet.id}
            onToggle={() => setExpandedId(expandedId === outlet.id ? null : outlet.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">No outlets match your search.</div>
        )}
      </div>
    </div>
  );
}
