import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Field, Input } from '../components/ds/Form';
import { Button } from '../components/ds/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    return errs;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed');

      let finalTarget = searchParams.get('redirect');
      if (!finalTarget || finalTarget === '/settings') {
        const { data: profile } = await supabase.from('profiles').select('is_staff').eq('id', data.user.id).single();
        finalTarget = profile?.is_staff ? '/admin' : '/dashboard';
      }
      navigate(finalTarget);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Sign in</h2>
      <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>Your reading summary and alerts, on this device and any other.</p>
      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
      
      <form onSubmit={handleLogin} noValidate>
        <Field label="Email" error={fieldErrors.email}>
          <Input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors(f => ({ ...f, email: undefined })); }}
            hasError={!!fieldErrors.email}
            autoComplete="email"
          />
        </Field>
        
        <Field label="Password" error={fieldErrors.password}>
          <Input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setFieldErrors(f => ({ ...f, password: undefined })); }}
            hasError={!!fieldErrors.password}
            autoComplete="current-password"
          />
        </Field>
        
        <div style={{ textAlign: 'left', marginBottom: '24px', marginTop: '-8px' }}>
          <Link to="/reset" style={{ fontSize: '11.5px', color: 'var(--v-clear)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>

        <Button 
          type="submit" 
          variant="primary"
          loading={loading}
          style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '4px', marginTop: '20px' }}
        >
          Sign in
        </Button>
      </form>
      
      <div style={{ marginTop: '18px', textAlign: 'left', fontSize: '11.5px', color: 'var(--t-muted)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--v-clear)', textDecoration: 'none' }}>Sign up</Link>
      </div>
    </>
  );
}

