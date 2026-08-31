import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminCorrections() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [expandedRow, setExpandedRow] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchCorrections = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/corrections`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          navigate('/login');
          throw new Error('Unauthorized or staff access required');
        }
        throw new Error('Failed to fetch');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrections();

    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('display_name').eq('id', session.user.id).single();
        if (data) setStaffName(data.display_name || session.user.email);
      }
    };
    getProfile();
  }, [navigate]);

  const handleUpdate = async (id) => {

    
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/corrections/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          status: statusDraft || undefined,
          resolution_note: resolutionNote || undefined
        })
      });
      
      if (!res.ok) throw new Error('Update failed');
      
      alert('Updated successfully');
      setExpandedRow(null);
      fetchCorrections();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };



  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px 0' }}>Corrections Queue</h2>
          {staffName && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signed in as {staffName}</div>}
        </div>
        <button onClick={fetchCorrections} style={{ padding: '6px 12px', cursor: 'pointer' }}>Refresh</button>
      </div>
      
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-elevated)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '12px' }}>Created</th>
            <th style={{ padding: '12px' }}>Category</th>
            <th style={{ padding: '12px' }}>Subject</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>SLA Due</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const due = new Date(row.sla_due_at);
            const now = new Date();
            const isOverdue = due < now;
            
            return (
              <React.Fragment key={row.id}>
                <tr 
                  onClick={() => {
                    if (expandedRow === row.id) {
                      setExpandedRow(null);
                    } else {
                      setExpandedRow(row.id);
                      setStatusDraft(row.status);
                      setResolutionNote(row.resolution_note || '');
                    }
                  }}
                  style={{ 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    background: expandedRow === row.id ? 'var(--bg-default)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px' }}>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{row.category}</td>
                  <td style={{ padding: '12px' }}>
                    {row.subject_type}: {row.subject_id || 'N/A'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: row.status === 'new' ? '#3b82f620' : '#8882',
                      color: row.status === 'new' ? '#3b82f6' : 'var(--text-secondary)'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: isOverdue && row.status !== 'actioned' && row.status !== 'declined' ? 'red' : 'inherit' }}>
                    {due.toLocaleDateString()} {isOverdue && row.status !== 'actioned' && row.status !== 'declined' ? '(Overdue)' : ''}
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-default)' }}>
                    <td colSpan={5} style={{ padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0' }}>Request Details</h4>
                          <p><strong>Page:</strong> <a href={row.page_url} target="_blank" rel="noreferrer">{row.page_url}</a></p>
                          <p><strong>Description:</strong> {row.description}</p>
                          {row.claimed_correct_info && <p><strong>Claimed Correct Info:</strong> {row.claimed_correct_info}</p>}
                          {row.source_url && <p><strong>Source URL:</strong> <a href={row.source_url} target="_blank" rel="noreferrer">{row.source_url}</a></p>}
                          
                          <h4 style={{ margin: '16px 0 8px 0' }}>Requester</h4>
                          <p>{row.requester_name || 'Anonymous'} ({row.requester_email})</p>
                          <p>Relationship: {row.requester_relationship || 'None stated'}</p>
                        </div>
                        
                        <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                          <h4 style={{ margin: '0 0 16px 0' }}>Resolution Actions</h4>
                          

                          
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Status</label>
                            <select 
                              value={statusDraft} 
                              onChange={e => setStatusDraft(e.target.value)}
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                            >
                              <option value="new">New</option>
                              <option value="in_review">In Review</option>
                              <option value="actioned">Actioned</option>
                              <option value="declined">Declined</option>
                              <option value="escalated_legal">Escalated (Legal)</option>
                            </select>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Resolution Note</label>
                            <textarea 
                              value={resolutionNote} 
                              onChange={e => setResolutionNote(e.target.value)}
                              rows={3}
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                            />
                          </div>
                          
                          <button 
                            onClick={() => handleUpdate(row.id)}
                            disabled={updating}
                            style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            {updating ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
      {data.length === 0 && !loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Queue is empty.
        </div>
      )}
    </div>
  );
}
