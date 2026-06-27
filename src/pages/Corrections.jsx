import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Corrections() {
  const [form, setForm] = useState({
    page: '',
    what: '',
    correct: '',
    name: '',
    relationship: '',
    email: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '0.5px solid var(--border)',
    borderRadius: '6px',
    background: 'var(--bg-hover)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    marginBottom: '16px',
    fontFamily: 'var(--font-body)',
    outline: 'none'
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    display: 'block',
    marginBottom: '6px'
  };

  const commitmentStyle = {
    display: 'flex',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '0.5px solid var(--border)'
  };

  const commitmentLabelStyle = {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: '11px',
    color: '#E67E22',
    flexShrink: 0,
    minWidth: '140px'
  };

  const handleSubmit = () => {
    if (!form.email) {
      alert('Please enter an email address for our reply.');
      return;
    }
    window.location.href = `mailto:corrections@tracenews.ng?subject=Correction request: ${encodeURIComponent(form.page)}&body=${encodeURIComponent(
      'Page/Person: ' + form.page + 
      '\n\nWhat is inaccurate:\n' + form.what + 
      '\n\nCorrect information and source:\n' + form.correct + 
      '\n\nName: ' + form.name + 
      '\n\nRelationship: ' + form.relationship + 
      '\n\nEmail: ' + form.email
    )}`;
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'var(--font-body)' }}>
      <Helmet>
        <title>Request a Correction | TraceNews</title>
        <meta name="description" content="If you believe something on a TraceNews page is factually wrong, tell us and we will look into it promptly." />
        <link rel="canonical" href="https://tracenews.ng/corrections" />
      </Helmet>

      {/* SECTION 1 — Header */}
      <div>
        <p style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace", fontSize: '11px', textTransform: 'uppercase', color: '#E67E22', margin: '0 0 12px 0' }}>TRACENEWS ACCURACY</p>
        <h1 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '36px', fontWeight: 600, margin: '0 0 24px 0', color: 'var(--text-primary)' }}>Request a correction</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '16px' }}>
          TraceNews pages describe how Nigerian media has covered stories — the number of stories that mention a person, and how that coverage was distributed across editorial tiers. The pages describe coverage behaviour; they do not pass judgement on any person or outlet.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '580px', marginBottom: '0' }}>
          If you believe something on a page is factually wrong — a wrong office or title, an out-of-date party, a person confused with someone else, a miscounted or mis-dated figure — tell us and we will look into it promptly.
        </p>
      </div>

      {/* SECTION 2 — What we can correct */}
      <div>
        <h2 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '16px', color: 'var(--text-primary)' }}>What we can correct</h2>
        <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: 1.6, margin: 0 }}>
          <li style={{ marginBottom: '8px' }}>A person's current position, party, or state that is out of date or wrong.</li>
          <li style={{ marginBottom: '8px' }}>A story wrongly attributed to a person (for example, a name-match that picked up a different person of the same name).</li>
          <li style={{ marginBottom: '8px' }}>A coverage figure, date, or time window that does not match our records.</li>
          <li style={{ marginBottom: '0' }}>A broken or mislabelled link.</li>
        </ul>
        <div style={{ background: 'var(--bg-elevated)', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '16px', marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This form is for factual accuracy. It is not a route to remove accurate, lawfully published coverage data, or to dispute how Nigerian outlets are classified. Our classification method is explained at{' '}
          <Link to="/methodology" style={{ color: '#E67E22', textDecoration: 'none' }}>/methodology</Link>, and outlet pages carry their own 'dispute this score' route.
        </div>
      </div>

      {/* SECTION 3 — The form */}
      <div>
        <h2 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '24px', color: 'var(--text-primary)' }}>Submit a correction</h2>
        
        {submitted ? (
          <div style={{ background: 'rgba(39,176,96,0.08)', border: '0.5px solid rgba(39,176,96,0.3)', borderRadius: '8px', padding: '20px 24px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              ✓ Your email client should have opened with your request. If it did not, email us directly at corrections@tracenews.ng
            </p>
          </div>
        ) : (
          <div>
            <div>
              <label style={labelStyle}>Page or person this concerns</label>
              <input type="text" placeholder="URL or name (e.g. tracenews.ng/politicians/...)" value={form.page} onChange={e => setForm({...form, page: e.target.value})} style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>What is inaccurate</label>
              <textarea rows={4} placeholder="Describe what you believe is wrong" value={form.what} onChange={e => setForm({...form, what: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
            </div>
            
            <div>
              <label style={labelStyle}>What the correct information is, and your source</label>
              <textarea rows={4} placeholder="Include a public, verifiable source where possible" value={form.correct} onChange={e => setForm({...form, correct: e.target.value})} style={{...inputStyle, resize: 'vertical'}} />
            </div>
            
            <div>
              <label style={labelStyle}>Your name (optional)</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
            </div>
            
            <div>
              <label style={labelStyle}>Your relationship to this matter (optional)</label>
              <select value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})} style={{...inputStyle, appearance: 'auto'}}>
                <option value="">Select...</option>
                <option>The person named</option>
                <option>Representative of the person named</option>
                <option>Member of the public</option>
                <option>A news outlet</option>
                <option>Other</option>
              </select>
            </div>
            
            <div>
              <label style={labelStyle}>Email address for our reply *</label>
              <input type="email" required placeholder="we will respond here" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              By submitting, you confirm the information you provide is true to the best of your knowledge. We process what you send only to assess and, where warranted, action your request.
            </p>
            
            <button onClick={handleSubmit} style={{ background: 'var(--text-primary)', color: 'var(--bg-base)', border: 'none', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', width: '100%' }}>
              Submit correction request
            </button>
          </div>
        )}
      </div>

      {/* SECTION 4 — Our commitment */}
      <div>
        <h2 style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '20px', fontWeight: 600, marginTop: '40px', marginBottom: '16px', color: 'var(--text-primary)' }}>Our commitment</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ ...commitmentStyle, borderTop: '0.5px solid var(--border)' }}>
            <div style={commitmentLabelStyle}>1 business day</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>We acknowledge every request within 1 business day.</div>
          </div>
          <div style={commitmentStyle}>
            <div style={commitmentLabelStyle}>5 business days</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>We give a substantive response — corrected, or an explanation of why not — within 5 business days.</div>
          </div>
          <div style={commitmentStyle}>
            <div style={commitmentLabelStyle}>same day where possible</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Urgent errors during campaign season (wrong office, missed disqualification, person mix-up) are treated as priority.</div>
          </div>
          <div style={commitmentStyle}>
            <div style={commitmentLabelStyle}>immediately</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Formal legal correspondence is routed to our legal team immediately with a same-day acknowledgement.</div>
          </div>
        </div>
      </div>

      {/* SECTION 5 — Footer contact */}
      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '0.5px solid var(--border)', fontSize: '13px', color: 'var(--text-muted)' }}>
        Questions about this process:{' '}
        <a href="mailto:corrections@tracenews.ng" style={{ color: '#E67E22', textDecoration: 'none' }}>
          corrections@tracenews.ng
        </a>
      </div>
    </div>
  );
}
