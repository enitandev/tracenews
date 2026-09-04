import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ds/Button';
import { Card } from '../components/ds/Card';

const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';

export default function MonitoringSpiritAdmin() {
  const navigate = useNavigate();
  const [verdicts, setVerdicts] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedVerdict, setExpandedVerdict] = useState(null);
  const [dismissReason, setDismissReason] = useState('');
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
        fetch(`${API_BASE}/api/admin/monitoring-spirit/verdicts`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        }),
        fetch(`${API_BASE}/api/admin/monitoring-spirit/overrides`, {
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
      const res = await fetch(`${API_BASE}/api/admin/monitoring-spirit/overrides`, {
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
      const res = await fetch(`${API_BASE}/api/admin/monitoring-spirit/overrides/${overrideId}/reinstate`, {
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
    if (verdict === 'mixed') return { bg: 'var(--v-mixed)', color: 'var(--on-accent)' };
    if (verdict === 'dark') return { bg: 'var(--v-dark)', color: 'var(--on-accent)' };
    return { bg: 'var(--t-sub)', color: 'var(--on-accent)' };
  };

  return (
    <div className="desk-col" style={{ borderRight: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }}>
        <div>
          <h2 className="t-display" style={{ margin: '0 0 var(--s1) 0' }}>Monitoring Spirit Oversight</h2>
        </div>
        <Button onClick={fetchData} size="sm">Refresh</Button>
      </div>

      {error && <div style={{ padding: 'var(--s3)', background: 'var(--danger)', color: 'var(--on-accent)', borderRadius: 'var(--r-sm)', marginBottom: 'var(--s5)' }}>{error}</div>}
      {loading && <p className="t-muted">Loading data...</p>}

      {!error && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s6)' }}>
        
        {/* Active Verdicts Column */}
        <div>
          <h3 className="t-primary" style={{ marginBottom: 'var(--s4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--s2)' }}>Live Verdicts</h3>
          {verdicts.length === 0 && !loading ? <p className="t-muted">No active non-CLEAR verdicts found in the last 72 hours.</p> : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {verdicts.map(v => (
              <Card key={v.cluster_id} style={{ opacity: v.has_active_override ? 0.5 : 1, padding: 'var(--s4)' }}>
                <div style={{ marginBottom: 'var(--s2)' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: 'var(--s1) var(--s2)', 
                    borderRadius: 'var(--r-sm)', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    textTransform: 'uppercase',
                    background: getBadgeColor(v.verdict).bg,
                    color: getBadgeColor(v.verdict).color,
                    marginBottom: 'var(--s2)'
                  }}>
                    {v.verdict}
                  </span>
                  {v.has_active_override && (
                    <span style={{ marginLeft: 'var(--s2)', fontSize: '12px', color: 'var(--t-sub)' }}>(Overridden)</span>
                  )}
                </div>
                <h4 className="t-primary" style={{ margin: '0 0 var(--s2) 0' }}>{v.headline}</h4>
                <p className="t-sub" style={{ fontSize: '14px', margin: '0 0 var(--s3) 0' }}>{v.evidence}</p>
                
                {!v.has_active_override && expandedVerdict !== v.cluster_id && (
                  <Button 
                    variant="secondary"
                    size="sm"
                    onClick={() => setExpandedVerdict(v.cluster_id)}
                  >
                    Dismiss...
                  </Button>
                )}
                
                {expandedVerdict === v.cluster_id && (
                  <div style={{ marginTop: 'var(--s4)', paddingTop: 'var(--s4)', borderTop: '1px solid var(--border)' }}>
                    <label className="t-sub" style={{ display: 'block', marginBottom: 'var(--s2)', fontSize: '12px' }}>Reason for Dismissal</label>
                    <textarea 
                      value={dismissReason}
                      onChange={e => setDismissReason(e.target.value)}
                      placeholder="Why is this verdict inaccurate?"
                      style={{ width: '100%', minHeight: '80px', padding: 'var(--s2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--t-primary)', marginBottom: 'var(--s3)' }}
                    />
                    <div style={{ display: 'flex', gap: 'var(--s3)' }}>
                      <Button 
                        loading={submitting} 
                        onClick={() => handleDismiss(v.cluster_id, v.verdict)}
                      >
                        Confirm Dismissal
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => { setExpandedVerdict(null); setDismissReason(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Overrides / Audit Log Column */}
        <div>
          <h3 className="t-primary" style={{ marginBottom: 'var(--s4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--s2)' }}>Recent Overrides (72h)</h3>
          {overrides.length === 0 && !loading ? <p className="t-muted">No manual overrides active.</p> : null}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s4)' }}>
            {overrides.map(o => (
              <Card key={o.id} style={{ padding: 'var(--s4)', borderLeft: '4px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s2)' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--t-primary)' }}>Dismissed: {o.original_verdict}</span>
                    <div className="t-muted" style={{ fontSize: '12px', marginTop: 'var(--s1)' }}>
                      By {o.staff_email} at {new Date(o.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleReinstate(o.id)}
                    disabled={submitting}
                  >
                    Reinstate
                  </Button>
                </div>
                <div style={{ background: 'var(--raised)', padding: 'var(--s3)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', marginTop: 'var(--s3)' }}>
                  <span className="t-sub" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</span>
                  <p className="t-body" style={{ margin: 'var(--s1) 0 0 0', fontSize: '14px' }}>{o.reason}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        </div>
      )}
    </div>
  );
}
