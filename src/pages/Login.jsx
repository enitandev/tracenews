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
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/settings';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Login failed');

      navigate(redirectTarget);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Log In</h2>
      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
      
      <form onSubmit={handleLogin}>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </Field>
        
        <Field label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px', marginTop: '-8px' }}>
          <Link to="/reset" style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none' }}>Forgot password?</Link>
        </div>

        <Button 
          type="submit" 
          variant="primary"
          loading={loading}
          style={{ width: '100%' }}
        >
          Log In
        </Button>
      </form>
      
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
      </div>
    </div>
  );
}
