import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ds/Button';

export default function Verify() {
  const [status, setStatus] = useState('pending'); // 'pending', 'success', 'already_verified', 'expired', 'error'
  const [errorMsg, setErrorMsg] = useState(null);
  
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(location.search);
    
    if (hash && hash.includes('error_description')) {
      const params = new URLSearchParams(hash.substring(1));
      const errDesc = params.get('error_description');
      
      if (errDesc && (errDesc.includes('expired') || errDesc.includes('invalid'))) {
        setStatus('expired');
      } else if (errDesc && errDesc.includes('already')) {
        setStatus('already_verified');
      } else {
        setStatus('error');
        setErrorMsg(errDesc ? errDesc.replace(/\+/g, ' ') : 'Unknown error');
      }
      
      // Clear hash
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return;
    }

    // Check if session exists (means successful verification)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        if (session.user?.email_confirmed_at) {
          // If we just got here and they are confirmed, it's a success or already verified.
          // Since Supabase usually returns an error if already verified and clicking a link,
          // landing here with a valid session means success.
          setStatus('success');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('success');
      }
    });

    return () => subscription.unsubscribe();
  }, [location]);

  return (
    <>
      
      {status === 'pending' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Verifying...</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>
            Please wait while we verify your email address.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Email Verified!</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>
            Your email has been successfully verified. You can now sign in to your account.
          </p>
          <Link to="/login?redirect=/settings" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '4px', marginTop: '20px' }}>
              Continue to Sign In
            </Button>
          </Link>
        </>
      )}

      {status === 'already_verified' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Already Verified</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>
            Your email is already verified. You can proceed to sign in.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '4px', marginTop: '20px' }}>
              Go to Sign In
            </Button>
          </Link>
        </>
      )}

      {status === 'expired' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Link Expired</h2>
          <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>
            The verification link is invalid or has expired.
          </p>
          <Link to="/reset" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '4px', marginTop: '20px' }}>
              Request New Link
            </Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Verification Failed</h2>
          <p style={{ color: '#991b1b', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px', background: '#fee2e2', padding: '12px', borderRadius: '4px', marginTop: '6px' }}>
            {errorMsg || 'An error occurred during verification.'}
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '4px', marginTop: '20px' }}>
              Return to Login
            </Button>
          </Link>
        </>
      )}

    </>
  );
}
