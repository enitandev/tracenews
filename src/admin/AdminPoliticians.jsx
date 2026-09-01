import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppShell, Masthead, ShellContainer, ContentArea } from '../components/ds/Layout';
import { ThemeToggle } from '../components/ds/Toggle';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ds/Table';
import { Button } from '../components/ds/Button';
import { Tag } from '../components/ds/Marks';
import { Card } from '../components/ds/Card';

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
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [currentTab, setCurrentTab] = useState('pending_review');
  const [expandedRow, setExpandedRow] = useState(null);
  
  const [staffName, setStaffName] = useState('');
  const [reason, setReason] = useState('');
  const [statusDraft, setStatusDraft] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [historyData, setHistoryData] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchPoliticians = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/politicians?status=${status}`, {
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

  const fetchHistory = async (id) => {
    setLoadingHistory(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/politicians/${id}/history`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
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

  useEffect(() => {
    fetchPoliticians(currentTab);
    setExpandedRow(null);

    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('display_name').eq('id', session.user.id).single();
        if (data) setStaffName(data.display_name || session.user.email);
      }
    };
    getProfile();
  }, [currentTab, navigate]);

  const handleUpdate = async (id) => {
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      const res = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/api/admin/politicians/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publication_status: statusDraft,
          reason: reason
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

  return (
    <AppShell>
      <Masthead brandLink="/admin">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s4)' }}>
          {staffName && <span className="t-muted">Signed in as {staffName}</span>}
          <ThemeToggle />
        </div>
      </Masthead>

      <ShellContainer>
        <ContentArea>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s6)' }}>
            <div>
              <h2 className="t-display" style={{ margin: '0 0 var(--s1) 0' }}>Politicians Review Queue</h2>
            </div>
            <Button onClick={() => fetchPoliticians(currentTab)} size="sm">Refresh</Button>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--s2)', marginBottom: 'var(--s6)' }}>
            {['pending_review', 'excluded', 'published'].map(tab => (
              <Button 
                key={tab}
                variant={currentTab === tab ? 'primary' : 'secondary'}
                onClick={() => setCurrentTab(tab)}
              >
                {tab.replace('_', ' ').toUpperCase()}
              </Button>
            ))}
          </div>

          {loading && <p className="t-muted">Loading...</p>}
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Current Status</Th>
                <Th>Last Updated</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map(row => {
                const isReference = REFERENCE_LIST.find(r => r.name === row.name);
                
                return (
                  <React.Fragment key={row.id}>
                    <Tr 
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
                        cursor: 'pointer',
                        background: expandedRow === row.id ? 'var(--raised)' : 'transparent'
                      }}
                    >
                      <Td>
                        <span style={{ fontWeight: 600 }}>{row.name}</span>
                        {isReference && <span className="t-muted" style={{ marginLeft: 'var(--s2)', fontSize: '12px' }}>★ Reference</span>}
                      </Td>
                      <Td>{row.category}</Td>
                      <Td>
                        <Tag variant={row.publication_status === 'pending_review' ? 'outline' : 'neutral'}>
                          {row.publication_status}
                        </Tag>
                      </Td>
                      <Td>{row.updated_at ? new Date(row.updated_at).toLocaleDateString() : 'N/A'}</Td>
                    </Tr>
                    
                    {expandedRow === row.id && (
                      <Tr style={{ background: 'var(--raised)' }}>
                        <Td colSpan={4} style={{ padding: 'var(--s5)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s6)' }}>
                            
                            <div>
                              <Card style={{ padding: 'var(--s4)' }}>
                                <h4 className="t-primary" style={{ margin: '0 0 var(--s4) 0' }}>Review Action</h4>
                                {isReference && (
                                  <div style={{ padding: 'var(--s3)', background: 'var(--sunk)', borderLeft: '4px solid var(--v-mixed)', marginBottom: 'var(--s4)' }}>
                                    <h5 className="t-primary" style={{ margin: '0 0 var(--s1) 0' }}>Reference Guidance</h5>
                                    <p className="t-body" style={{ margin: 0, fontSize: '13px' }}>{isReference.reason}</p>
                                  </div>
                                )}
                                
                                <div style={{ marginBottom: 'var(--s3)' }}>
                                  <label className="t-sub" style={{ display: 'block', marginBottom: 'var(--s1)', fontSize: '12px' }}>Decision</label>
                                  <select 
                                    value={statusDraft} 
                                    onChange={e => setStatusDraft(e.target.value)}
                                    style={{ width: '100%', padding: 'var(--s2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--t-primary)' }}
                                  >
                                    <option value="pending_review">Pending Review</option>
                                    <option value="published">Publish (Active Politician)</option>
                                    <option value="excluded">Exclude (Not an active politician)</option>
                                  </select>
                                </div>
                                
                                <div style={{ marginBottom: 'var(--s4)' }}>
                                  <label className="t-sub" style={{ display: 'block', marginBottom: 'var(--s1)', fontSize: '12px' }}>Reason / Notes</label>
                                  <textarea 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Explain decision (required)"
                                    style={{ width: '100%', minHeight: '80px', padding: 'var(--s2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--t-primary)' }}
                                  />
                                </div>
                                
                                <Button 
                                  onClick={() => handleUpdate(row.id)} 
                                  loading={updating}
                                  style={{ width: '100%' }}
                                >
                                  Submit Decision
                                </Button>
                              </Card>
                            </div>
                            
                            <div>
                              <h4 className="t-primary" style={{ margin: '0 0 var(--s2) 0' }}>Review History</h4>
                              {loadingHistory && <p className="t-muted">Loading history...</p>}
                              
                              {!loadingHistory && historyData[row.id] && historyData[row.id].length === 0 && (
                                <p className="t-muted" style={{ fontSize: '14px' }}>No previous review history for this entity.</p>
                              )}
                              
                              {!loadingHistory && historyData[row.id] && historyData[row.id].length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
                                  {historyData[row.id].map(h => (
                                    <div key={h.id} style={{ padding: 'var(--s3)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'var(--card)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s1)' }}>
                                        <Tag variant="neutral">{h.new_status}</Tag>
                                        <span className="t-muted" style={{ fontSize: '12px' }}>{new Date(h.created_at).toLocaleString()}</span>
                                      </div>
                                      <p className="t-body" style={{ margin: '0 0 var(--s1) 0', fontSize: '14px' }}>{h.reason}</p>
                                      <div className="t-muted" style={{ fontSize: '12px' }}>By: {h.staff_name || h.staff_id}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                          </div>
                        </Td>
                      </Tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
          
          {data.length === 0 && !loading && (
            <div style={{ padding: 'var(--s6)', textAlign: 'center', color: 'var(--t-muted)' }}>
              No entities found for this status.
            </div>
          )}
        </ContentArea>
      </ShellContainer>
    </AppShell>
  );
}
