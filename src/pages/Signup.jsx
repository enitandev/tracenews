import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '8px', textAlign: 'center' }}>
        <h2>Check your email</h2>
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
          We've sent a confirmation link to <strong>{email}</strong>. 
          Please click the link to activate your account.
        </p>
        <div style={{ marginTop: '24px' }}>
          <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px' }}>Create an Account</h2>
      {error && <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}
      
      <form onSubmit={handleSignup}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-primary)' }}
          />
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <input
            type="checkbox"
            id="age_assertion"
            checked={ageAssertion}
            onChange={(e) => setAgeAssertion(e.target.checked)}
            style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="age_assertion" style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.4', cursor: 'pointer' }}>
            I confirm I am 18 years of age or older.
          </label>
        </div>

        <button 
          type="submit" 
          disabled={!ageAssertion || loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: !ageAssertion || loading ? 'var(--border)' : '#3b82f6', 
            color: !ageAssertion || loading ? 'var(--text-muted)' : 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: !ageAssertion || loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
        Already have an account? <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none' }}>Log in</Link>
      </div>
    </div>
  );
}
