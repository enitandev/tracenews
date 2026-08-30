import React, { useState, useEffect } from 'react';

const REFERENCE_LIST = [
  { name: 'Herbert Wigwe', category: 'Business', reason: 'Deceased Feb 2024 — posthumous treatment not reviewed' },
  { name: 'Muhammadu Maccido', category: 'Traditional', reason: 'Deceased' },
  { name: 'Okunade Sijuwade', category: 'Traditional', reason: 'Deceased' },
  { name: 'Lamidi Olayiwola Adeyemi III', category: 'Traditional', reason: 'Deceased' },
  { name: 'Aminu Ado Bayero', category: 'Traditional', reason: 'Kano succession litigation — held pending resolution' },
  { name: 'Samson Itodo', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Kolawole Oluwadare', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Andrew Mamedu', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Ufuoma Nnamdi-Udeh', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Peter Maduoma', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Opeyemi Adamolekun', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Auwal Musa Rafsanjani', category: 'CivilSociety', reason: 'Private figure, NGO director' },
  { name: 'Simon Bagaiya Shaibu', category: 'PowerBroker', reason: 'Identity unconfirmed' }
];

export default function AdminPoliticians() {
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentTab, setCurrentTab] = useState('pending_review');
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [actorName, setActorName] = useState('');
  const [reason, setReason] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [historyData, setHistoryData] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPoliticians = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/politicians?status=${status}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          setIsLoggedIn(false);
          setToken('');
          throw new Error('Invalid token');
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

  const fetchHistory = async (id) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/politicians/${id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setHistoryData(prev => ({ ...prev, [id]: json }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
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
      fetchPoliticians(currentTab);
      setExpandedRow(null);
    }
  }, [isLoggedIn, currentTab]);

  const handleUpdate = async (id) => {
    if (!actorName.trim()) {
      alert('Actor name is required');
      return;
    }
    if (!reason.trim()) {
      alert('Reason is required');
      return;
    }
    if (!statusDraft) {
      alert('Status is required');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/politicians/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publication_status: statusDraft,
          reason: reason,
          actor: actorName
        })
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      setExpandedRow(null);
      setReason('');
      fetchPoliticians(currentTab);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px' }}>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Admin Token"
            style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Politicians Review Queue</h2>
        <button onClick={() => fetchPoliticians(currentTab)} style={{ padding: '6px 12px', cursor: 'pointer' }}>Refresh</button>
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['pending_review', 'excluded', 'published'].map(tab => (
          <button 
            key={tab}
            onClick={() => setCurrentTab(tab)}
            style={{
              padding: '8px 16px',
              background: currentTab === tab ? '#3b82f6' : 'var(--bg-elevated)',
              color: currentTab === tab ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {tab.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-elevated)' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Category</th>
            <th style={{ padding: '12px' }}>Current Status</th>
            <th style={{ padding: '12px' }}>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const isReference = REFERENCE_LIST.find(r => r.name === row.name);
            
            return (
              <React.Fragment key={row.id}>
                <tr 
                  onClick={() => {
                    if (expandedRow === row.id) {
                      setExpandedRow(null);
                    } else {
                      setExpandedRow(row.id);
                      setStatusDraft(row.publication_status);
                      setReason('');
                      if (!historyData[row.id]) fetchHistory(row.id);
                    }
                  }}
                  style={{ 
                    borderBottom: '1px solid var(--border)', 
                    cursor: 'pointer',
                    background: expandedRow === row.id ? 'var(--bg-default)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{row.name} {isReference && <span style={{fontSize: '12px', color: '#f59e0b', marginLeft: '8px'}}>(Addendum)</span>}</td>
                  <td style={{ padding: '12px' }}>{row.category}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: row.publication_status === 'pending_review' ? '#f59e0b20' : 
                                  row.publication_status === 'published' ? '#10b98120' : '#ef444420',
                      color: row.publication_status === 'pending_review' ? '#f59e0b' : 
                             row.publication_status === 'published' ? '#10b981' : '#ef4444'
                    }}>
                      {row.publication_status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
                {expandedRow === row.id && (
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-default)' }}>
                    <td colSpan={4} style={{ padding: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        
                        <div>
                          <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                            <h4 style={{ margin: '0 0 16px 0' }}>Update Status</h4>
                            
                            {isReference && (
                              <div style={{ padding: '12px', background: '#f59e0b20', border: '1px solid #f59e0b50', borderRadius: '4px', marginBottom: '16px' }}>
                                <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '4px' }}>Signed Addendum Match</strong>
                                <p style={{ margin: 0, fontSize: '14px' }}><strong>Reason:</strong> {isReference.reason}</p>
                              </div>
                            )}

                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Actor Name (Required)</label>
                              <input 
                                type="text" 
                                value={actorName} 
                                onChange={e => setActorName(e.target.value)} 
                                placeholder="Your full name"
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                              />
                            </div>
                            
                            <div style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Status</label>
                              <select 
                                value={statusDraft} 
                                onChange={e => setStatusDraft(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
                              >
                                <option value="pending_review">Pending Review</option>
                                <option value="excluded">Excluded</option>
                                <option value="published">Published</option>
                              </select>
                            </div>
                            
                            <div style={{ marginBottom: '16px' }}>
                              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Reason / Justification (Required)</label>
                              <textarea 
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                rows={3}
                                placeholder="Cite the addendum disposition or new basis"
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

                        <div>
                          <h4 style={{ margin: '0 0 16px 0' }}>Audit History</h4>
                          {loadingHistory && !historyData[row.id] ? (
                            <p>Loading history...</p>
                          ) : historyData[row.id] && historyData[row.id].length > 0 ? (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                              {historyData[row.id].map(entry => (
                                <div key={entry.id} style={{ padding: '12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '4px', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                                    <strong>{entry.actor}</strong>
                                  </div>
                                  <div style={{ fontSize: '14px' }}>
                                    Changed to <strong style={{ color: '#3b82f6' }}>{entry.after_state.publication_status}</strong>
                                  </div>
                                  <div style={{ fontSize: '14px', marginTop: '4px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                                    "{entry.before_state.reason}"
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No status history found.</p>
                          )}
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
          No politicians found in this queue.
        </div>
      )}
    </div>
  );
}
