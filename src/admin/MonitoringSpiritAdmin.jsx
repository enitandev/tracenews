import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function MonitoringSpiritAdmin() {
  const navigate = useNavigate();
  const [verdicts, setVerdicts] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedVerdict, setExpandedVerdict] = useState(null);
  const [dismissReason, setDismissReason] = useState('');
  const [staffName, setStaffName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const [vRes, oRes] = await Promise.all([
        fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/verdicts`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/overrides`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        })
      ]);
      
      if (!vRes.ok || !oRes.ok) {
        if (vRes.status === 401 || vRes.status === 403 || oRes.status === 401 || oRes.status === 403) {
          navigate('/login');
          throw new Error('Unauthorized or staff access required');
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

  useEffect(() => {
    fetchData();

    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('display_name').eq('id', session.user.id).single();
        if (data) setStaffName(data.display_name || session.user.email);
      }
    };
    getProfile();
  }, [navigate]);

  const handleDismiss = async (clusterId, originalVerdict) => {

    if (!dismissReason.trim()) {
      alert("Reason is required.");
      return;
    }
    
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/overrides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          cluster_id: clusterId,
          original_verdict: originalVerdict,
          reason: dismissReason
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

    
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/monitoring-spirit/overrides/${overrideId}/reinstate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({})
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



  const getBadgeColor = (verdict) => {
    if (verdict === 'mixed') return { bg: '#8f9a6f', color: '#fff' }; // amber replacement (Gate B)
    if (verdict === 'dark') return { bg: '#6d7f92', color: '#fff' }; // indigo replacement (Gate B)
    return { bg: '#555', color: '#fff' };
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Monitoring Spirit Oversight</h2>
          {staffName && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signed in as {staffName}</div>}
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}>
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
