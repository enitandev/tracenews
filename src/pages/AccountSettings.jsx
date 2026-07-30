import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteStage, setDeleteStage] = useState(0); // 0: normal, 1: confirming, 2: deleting
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError("Please type DELETE to confirm.");
      return;
    }

    setDeleteStage(2);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const res = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/auth/account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete account");
      }

      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      setError(err.message);
      setDeleteStage(1);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '32px' }}>Account Settings</h1>
      
      <div style={{ background: 'var(--bg-elevated)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>Profile Information</h2>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</label>
          <div style={{ fontWeight: '500' }}>{user?.email}</div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </div>

      <div style={{ background: '#fef2f2', padding: '24px', borderRadius: '8px', border: '1px solid #fecaca' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px', color: '#991b1b' }}>Danger Zone</h2>
        <p style={{ fontSize: '14px', color: '#b91c1c', marginBottom: '20px' }}>
          Deleting your account is permanent and cannot be undone. All associated data will be removed.
        </p>

        {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

        {deleteStage === 0 ? (
          <button 
            onClick={() => setDeleteStage(1)}
            style={{ padding: '10px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Delete My Account
          </button>
        ) : (
          <div style={{ background: 'white', padding: '16px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#7f1d1d', marginBottom: '8px', fontWeight: '500' }}>
              Type <strong>DELETE</strong> to confirm
            </label>
            <input 
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #fca5a5', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleteStage === 2 || confirmText !== 'DELETE'}
                style={{ 
                  padding: '10px 16px', 
                  background: confirmText === 'DELETE' ? '#dc2626' : '#f87171', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: confirmText === 'DELETE' ? 'pointer' : 'not-allowed', 
                  fontWeight: 'bold' 
                }}
              >
                {deleteStage === 2 ? 'Deleting...' : 'Confirm Deletion'}
              </button>
              <button 
                onClick={() => { setDeleteStage(0); setConfirmText(''); setError(null); }}
                disabled={deleteStage === 2}
                style={{ padding: '10px 16px', background: 'transparent', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
