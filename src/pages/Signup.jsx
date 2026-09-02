import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Field, Input } from '../components/ds/Form';
import { Button } from '../components/ds/Button';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageAssertion, setAgeAssertion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!ageAssertion) {
      setError("You must confirm you are 18 or older to create an account.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          age_assertion: ageAssertion
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Signup failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Check your email</h2>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          We've sent a confirmation link to <strong>{email}</strong>. 
          Please click the link to activate your account.
        </p>
        <div style={{ marginTop: '32px' }}>
          <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Create an Account</h2>
      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
      
      <form onSubmit={handleSignup}>
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
            minLength={6}
            autoComplete="new-password"
          />
        </Field>

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '16px' }}>
          <input
            type="checkbox"
            id="age_assertion"
            checked={ageAssertion}
            onChange={(e) => setAgeAssertion(e.target.checked)}
            style={{ marginTop: '4px', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="age_assertion" style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.4', cursor: 'pointer' }}>
            I confirm I am 18 years of age or older.
          </label>
        </div>

        <Button 
          type="submit" 
          variant="primary"
          disabled={!ageAssertion}
          loading={loading}
          style={{ width: '100%' }}
        >
          Sign Up
        </Button>
      </form>
      
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
      </div>
    </div>
  );
}
