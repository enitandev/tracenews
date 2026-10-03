import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BriefingItem } from '../pages/DailyBriefingStory';

/**
 * Staff review of the rebuilt Daily Briefing (counsel, 3 Oct 2026, B6).
 * Items the summary gate holds for review appear in the public edition only
 * after a named editor approves them here. Suppressed and flagged summaries
 * are never in an edition.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
}

export default function AdminBriefing() {
  const [day, setDay] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }));
  const [state, setState] = useState({ loading: true });
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setState({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/api/admin/briefing?day=${day}`, { headers: await authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setState({ loading: false, data: await res.json() });
    } catch (e) {
      setState({ loading: false, error: e.message });
    }
  }, [day]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setBusy(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/briefing/${id}/approve`, { method: 'POST', headers: await authHeaders() });
      if (!res.ok) throw new Error((await res.json()).detail || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      alert(`Approval failed: ${e.message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '820px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Daily Briefing — edition review</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Not public until counsel clears the Briefing (BRIEFING_PUBLIC). Approve only after reading the summary against its sources.
      </p>
      <input type="date" value={day} onChange={e => setDay(e.target.value)} style={{ marginBottom: '16px' }} />
      {state.loading && <p>Loading…</p>}
      {state.error && <p style={{ color: '#c0392b' }}>Could not load the edition: {state.error}</p>}
      {state.data && state.data.items.length === 0 && <p>No edition was built for this day.</p>}
      {state.data && state.data.items.map(item => {
        const held = item.gate === 'review' || item.gate === 'senior_review';
        return (
          <div key={item.id} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '6px',
                          color: item.gate === 'senior_review' ? '#c0392b' : 'var(--text-secondary)' }}>
              #{item.position} · gate: {item.gate}
              {item.gate === 'senior_review' && ' — adverse context involving a principal office-holder'}
              {' · '}{item.publishable ? 'will publish' : 'not publishable'}
              {item.approved_by && ` · approved by ${item.approved_by} at ${item.approved_at}`}
              {item.flags && item.flags.length > 0 && ` · flags: ${item.flags.join(', ')}`}
            </div>
            <BriefingItem item={item} ui={state.data.ui} />
            {held && !item.approved_by && (
              <button disabled={busy === item.id} onClick={() => approve(item.id)} style={{ marginTop: '-12px', marginBottom: '20px' }}>
                {busy === item.id ? 'Approving…' : 'Approve for publication'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
