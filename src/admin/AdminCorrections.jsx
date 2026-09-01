import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AppShell, Masthead, ShellContainer, ContentArea } from '../components/ds/Layout';
import { ThemeToggle } from '../components/ds/Toggle';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ds/Table';
import { Button } from '../components/ds/Button';
import { Tag } from '../components/ds/Marks';

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
              <h2 className="t-display" style={{ margin: '0 0 var(--s1) 0' }}>Corrections Queue</h2>
            </div>
            <Button onClick={fetchCorrections} size="sm">Refresh</Button>
          </div>
          
          {loading && <p className="t-muted">Loading...</p>}
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          
          <Table>
            <Thead>
              <Tr>
                <Th>Created</Th>
                <Th>Category</Th>
                <Th>Subject</Th>
                <Th>Status</Th>
                <Th>SLA Due</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map(row => {
                const due = new Date(row.sla_due_at);
                const now = new Date();
                const isOverdue = due < now;
                
                return (
                  <React.Fragment key={row.id}>
                    <Tr 
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
                        cursor: 'pointer',
                        background: expandedRow === row.id ? 'var(--raised)' : 'transparent'
                      }}
                    >
                      <Td>{new Date(row.created_at).toLocaleDateString()}</Td>
                      <Td>{row.category}</Td>
                      <Td>
                        {row.subject_type}: {row.subject_id || 'N/A'}
                      </Td>
                      <Td>
                        <Tag variant={row.status === 'new' ? 'outline' : 'neutral'}>{row.status}</Tag>
                      </Td>
                      <Td style={{ color: isOverdue && row.status !== 'actioned' && row.status !== 'declined' ? 'var(--danger)' : 'inherit' }}>
                        {due.toLocaleDateString()} {isOverdue && row.status !== 'actioned' && row.status !== 'declined' ? '(Overdue)' : ''}
                      </Td>
                    </Tr>
                    {expandedRow === row.id && (
                      <Tr style={{ background: 'var(--raised)' }}>
                        <Td colSpan={5} style={{ padding: 'var(--s5)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s6)' }}>
                            <div>
                              <h4 className="t-primary" style={{ margin: '0 0 var(--s2) 0' }}>Request Details</h4>
                              <p className="t-body"><strong>Page:</strong> <a href={row.page_url} target="_blank" rel="noreferrer" style={{ color: 'var(--v-clear)' }}>{row.page_url}</a></p>
                              <p className="t-body"><strong>Description:</strong> {row.description}</p>
                              {row.claimed_correct_info && <p className="t-body"><strong>Claimed Correct Info:</strong> {row.claimed_correct_info}</p>}
                              {row.source_url && <p className="t-body"><strong>Source URL:</strong> <a href={row.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--v-clear)' }}>{row.source_url}</a></p>}
                              
                              <h4 className="t-primary" style={{ margin: 'var(--s4) 0 var(--s2) 0' }}>Requester</h4>
                              <p className="t-body">{row.requester_name || 'Anonymous'} ({row.requester_email})</p>
                              <p className="t-body">Relationship: {row.requester_relationship || 'None stated'}</p>
                            </div>
                            
                            <div style={{ padding: 'var(--s4)', background: 'var(--card)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                              <h4 className="t-primary" style={{ margin: '0 0 var(--s4) 0' }}>Resolution Actions</h4>
                              
                              <div style={{ marginBottom: 'var(--s3)' }}>
                                <label className="t-sub" style={{ display: 'block', marginBottom: 'var(--s1)', fontSize: '12px' }}>Status</label>
                                <select 
                                  value={statusDraft} 
                                  onChange={e => setStatusDraft(e.target.value)}
                                  style={{ width: '100%', padding: 'var(--s2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--t-primary)' }}
                                >
                                  <option value="new">New</option>
                                  <option value="in_review">In Review</option>
                                  <option value="actioned">Actioned</option>
                                  <option value="declined">Declined</option>
                                  <option value="escalated_legal">Escalated (Legal)</option>
                                </select>
                              </div>
                              
                              <div style={{ marginBottom: 'var(--s4)' }}>
                                <label className="t-sub" style={{ display: 'block', marginBottom: 'var(--s1)', fontSize: '12px' }}>Resolution Note</label>
                                <textarea 
                                  value={resolutionNote} 
                                  onChange={e => setResolutionNote(e.target.value)}
                                  style={{ width: '100%', minHeight: '80px', padding: 'var(--s2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', background: 'var(--raised)', color: 'var(--t-primary)' }}
                                  placeholder="Internal notes on how this was resolved..."
                                />
                              </div>
                              
                              <Button 
                                onClick={() => handleUpdate(row.id)} 
                                loading={updating}
                                style={{ width: '100%' }}
                              >
                                Save Updates
                              </Button>
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
              Queue is empty.
            </div>
          )}
        </ContentArea>
      </ShellContainer>
    </AppShell>
  );
}
