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
      <>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Check your email</h2>
        <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>
          We've sent a confirmation link to <strong>{email}</strong>. 
          Please click the link to activate your account.
        </p>
        <div style={{ textAlign: 'left', marginTop: '18px' }}>
          <Link to="/login" style={{ fontSize: '11.5px', color: 'var(--v-clear)', textDecoration: 'none' }}>Return to Login</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '19px', fontWeight: 600, color: 'var(--ink, var(--t-primary))', textAlign: 'left', margin: 0 }}>Create your account</h2>
      <p style={{ fontSize: '12px', color: 'var(--t-muted)', lineHeight: 1.5, maxWidth: '34ch', marginTop: '6px', marginBottom: '24px', textAlign: 'left' }}>Free. We count the coverage tiers you read — never the stories you opened.</p>
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

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '16px' }}>
          <input
            type="checkbox"
            id="age_assertion"
            className="checkbox-custom"
            checked={ageAssertion}
            onChange={(e) => setAgeAssertion(e.target.checked)}
          />
          <label htmlFor="age_assertion" style={{ fontSize: '12px', color: 'var(--t-body)', lineHeight: '16px', cursor: 'pointer' }}>
            I confirm I am 18 years of age or older.
          </label>
        </div>

        <Button 
          type="submit" 
          variant="primary"
          disabled={!ageAssertion}
          loading={loading}
          style={{ width: '100%', fontSize: '13px', padding: '10px', borderRadius: '4px', marginTop: '20px' }}
        >
          Sign Up
        </Button>
      </form>
      
      <div style={{ marginTop: '18px', textAlign: 'left', fontSize: '11.5px', color: 'var(--t-muted)' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--v-clear)', textDecoration: 'none' }}>Log in</Link>
      </div>
    </>
  );
}
