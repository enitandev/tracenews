import React, { useState, useEffect } from 'react';

export default function MonitoringSpiritAdmin() {
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [verdicts, setVerdicts] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedVerdict, setExpandedVerdict] = useState(null);
  const [dismissReason, setDismissReason] = useState('');
  const [actorName, setActorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vRes, oRes] = await Promise.all([
        fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/verdicts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/overrides`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (!vRes.ok || !oRes.ok) {
        if (vRes.status === 401 || oRes.status === 401) {
          setIsLoggedIn(false);
          setToken('');
          throw new Error('Invalid token');
        }
        throw new Error('Failed to fetch data');
      }
      
      const vJson = await vRes.json();
      const oJson = await oRes.json();
      setVerdicts(vJson);
      setOverrides(oJson);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (token.trim()) {
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const handleDismiss = async (clusterId, originalVerdict) => {
    if (!actorName.trim()) {
      alert("Actor name is required.");
      return;
    }
    if (!dismissReason.trim()) {
      alert("Reason is required.");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/overrides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cluster_id: clusterId,
          original_verdict: originalVerdict,
          reason: dismissReason,
          actor: actorName
        })
      });
      
      if (!res.ok) throw new Error('Dismissal failed');
      
      alert('Verdict dismissed successfully');
      setExpandedVerdict(null);
      setDismissReason('');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReinstate = async (overrideId) => {
    if (!actorName.trim()) {
      alert("Actor name is required to reinstate.");
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/overrides/${overrideId}/reinstate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          actor: actorName
        })
      });
      
      if (!res.ok) throw new Error('Reinstate failed');
      
      alert('Verdict reinstated successfully');
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px' }}>Staff Access</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Enter Staff Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  const getBadgeColor = (verdict) => {
    if (verdict === 'mixed') return { bg: '#8f9a6f', color: '#fff' }; // amber replacement (Gate B)
    if (verdict === 'dark') return { bg: '#6d7f92', color: '#fff' }; // indigo replacement (Gate B)
    return { bg: '#555', color: '#fff' };
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2>Monitoring Spirit Oversight</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Your Name (Actor)"
            value={actorName}
            onChange={(e) => setActorName(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
          />
          <button onClick={() => { setIsLoggedIn(false); setToken(''); }} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '20px' }}>{error}</div>}
      {loading && <p>Loading data...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Active Verdicts Column */}
        <div>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Live Verdicts</h3>
          {verdicts.length === 0 && !loading ? <p>No active non-CLEAR verdicts found in the last 72 hours.</p> : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {verdicts.map(v => (
              <div key={v.cluster_id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg-elevated)', opacity: v.has_active_override ? 0.5 : 1 }}>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase',
                    background: getBadgeColor(v.verdict).bg,
                    color: getBadgeColor(v.verdict).color,
                    marginBottom: '8px'
                  }}>
                    {v.verdict}
                  </span>
                  {v.has_active_override && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>(Overridden)</span>
                  )}
                </div>
                <h4 style={{ margin: '0 0 8px 0' }}>{v.headline}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>{v.evidence}</p>
                
                {!v.has_active_override && expandedVerdict !== v.cluster_id && (
                  <button 
                    onClick={() => setExpandedVerdict(v.cluster_id)}
                    style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Dismiss...
                  </button>
                )}
                
                {expandedVerdict === v.cluster_id && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-default)', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Dismissal Reason</p>
                    <textarea 
                      value={dismissReason}
                      onChange={(e) => setDismissReason(e.target.value)}
                      placeholder="Why is this verdict being dismissed?"
                      style={{ width: '100%', minHeight: '60px', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        disabled={submitting}
                        onClick={() => handleDismiss(v.cluster_id, v.verdict)}
                        style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                      >
                        {submitting ? 'Saving...' : 'Confirm Dismissal'}
                      </button>
                      <button 
                        onClick={() => { setExpandedVerdict(null); setDismissReason(''); }}
                        style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overrides Column */}
        <div>
          <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Active Overrides</h3>
          {overrides.length === 0 && !loading ? <p>No active overrides.</p> : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {overrides.map(o => (
              <div key={o.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--bg-elevated)' }}>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{new Date(o.created_at).toLocaleString()}</span>
                  <span>By: {o.actor}</span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>Cluster ID:</strong> <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{o.cluster_id.substring(0,8)}...</span>
                  <br />
                  <strong>Original:</strong> {o.original_verdict}
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-default)', borderRadius: '4px', fontSize: '14px', marginBottom: '12px' }}>
                  <strong>Reason:</strong> {o.reason}
                </div>
                <button 
                  disabled={submitting}
                  onClick={() => handleReinstate(o.id)}
                  style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '14px' }}
                >
                  {submitting ? 'Processing...' : 'Reinstate'}
                </button>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
