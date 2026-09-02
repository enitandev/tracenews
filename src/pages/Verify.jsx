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
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      
      {status === 'pending' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Verifying...</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
            Please wait while we verify your email address.
          </p>
        </div>
      )}

      {status === 'success' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Email Verified!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px' }}>
            Your email has been successfully verified. You can now sign in to your account.
          </p>
          <Link to="/login?redirect=/settings" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }}>
              Continue to Sign In
            </Button>
          </Link>
        </div>
      )}

      {status === 'already_verified' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Already Verified</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px' }}>
            Your email is already verified. You can proceed to sign in.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }}>
              Go to Sign In
            </Button>
          </Link>
        </div>
      )}

      {status === 'expired' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Link Expired</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px' }}>
            The verification link is invalid or has expired.
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }}>
              Request New Link
            </Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Verification Failed</h2>
          <p style={{ color: '#991b1b', fontSize: '14px', lineHeight: '1.5', marginBottom: '32px', background: '#fee2e2', padding: '12px', borderRadius: '4px' }}>
            {errorMsg || 'An error occurred during verification.'}
          </p>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ width: '100%' }}>
              Return to Login
            </Button>
          </Link>
        </div>
      )}

    </div>
  );
}
