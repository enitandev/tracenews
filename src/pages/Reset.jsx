import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Field, Input } from '../components/ds/Form';
import { Button } from '../components/ds/Button';

export default function Reset() {
  const [view, setView] = useState('request'); // 'request', 'sent', 'update', 'expired'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check for errors in the hash (e.g. invalid/expired link)
    const hash = window.location.hash;
    if (hash && hash.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1));
      const errDesc = params.get('error_description');
      if (errDesc && (errDesc.includes('expired') || errDesc.includes('invalid'))) {
        setView('expired');
      } else {
        setError(errDesc.replace(/\+/g, ' '));
      }
      // Clear hash so it doesn't persist
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return;
    }

    // Check if we have a session (meaning the user clicked a valid reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setView('update');
      }
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('update');
      } else if (session && view === 'request') {
        // If they magically logged in during request view, switch to update
        setView('update');
      }
    });

    return () => subscription.unsubscribe();
  }, [view]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset',
      });
      if (resetError) throw resetError;
      setView('sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      // Password updated successfully
      navigate('/login?redirect=/settings');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {view === 'request' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', marginBottom: '8px' }}>Reset Password</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginBottom: '24px', textAlign: 'left' }}>
            Enter your email and we'll send a link to reset your password.
          </p>
          {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          
          <form onSubmit={handleRequest}>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            
            <Button 
              type="submit" 
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '8px', fontSize: '13px', padding: '10px', borderRadius: '6px' }}
            >
              Send Reset Link
            </Button>
          </form>
          
          <div style={{ marginTop: '24px', textAlign: 'left', fontSize: '11.5px' }}>
            <Link to="/login" style={{ color: 'var(--t-muted)', textDecoration: 'none' }}>&larr; Back to <span style={{ color: 'var(--v-clear)' }}>Log in</span></Link>
          </div>
        </>
      )}

      {view === 'sent' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', marginBottom: '8px' }}>Check your email</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginBottom: '24px', textAlign: 'left' }}>
            We've sent a password reset link to <strong>{email}</strong>.
            Please check your inbox (and spam folder) and click the link to continue.
          </p>
          <div style={{ textAlign: 'left', marginTop: '24px' }}>
            <Link to="/login" style={{ fontSize: '11.5px', color: 'var(--v-clear)', textDecoration: 'none' }}>Return to Login</Link>
          </div>
        </>
      )}

      {view === 'update' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', marginBottom: '8px' }}>Set New Password</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginBottom: '24px', textAlign: 'left' }}>
            Please enter your new password below.
          </p>
          {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          
          <form onSubmit={handleUpdate}>
            <Field label="New Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </Field>
            
            <Button 
              type="submit" 
              variant="primary"
              loading={loading}
              style={{ width: '100%', marginTop: '8px', fontSize: '13px', padding: '10px', borderRadius: '6px' }}
            >
              Update Password
            </Button>
          </form>
        </>
      )}

      {view === 'expired' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', marginBottom: '8px' }}>Link Expired or Used</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginBottom: '24px', textAlign: 'left' }}>
            The password reset link is invalid, expired, or has already been used. Please request a new one.
          </p>
          <Button variant="primary" onClick={() => setView('request')} style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '6px' }}>
            Request New Link
          </Button>
          <div style={{ textAlign: 'left', marginTop: '24px' }}>
            <Link to="/login" style={{ fontSize: '11.5px', color: 'var(--v-clear)', textDecoration: 'none' }}>Return to Login</Link>
          </div>
        </>
      )}
    </>
  );
}
