import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BriefingItem } from '../pages/DailyBriefingStory';

/**
 * Staff review of the Daily Briefing (counsel, 3 Oct 2026, B6, and counsel's
 * review of the 3 Oct samples, items 2, 7, 8, 9). Items held for review
 * appear in the public edition only after a named editor ticks the checklist
 * and approves. Editors can rewrite an item from its sources, leave it out or
 * restore it; every action goes to the change log. Everything in the shaded
 * panel is reviewer-only and never shown to readers.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';
const LANE = {
  auto: 'Publishes automatically',
  review: 'Held for a named editor',
  senior_review: 'Held for a named editor — senior review: adverse context involving a principal office-holder',
  left_out: 'Left out',
};

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' };
}

async function post(path, body) {
  const res = await fetch(`${API_BASE}/api/admin/briefing/${path}`, {
    method: 'POST', headers: await authHeaders(), body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).detail || `HTTP ${res.status}`);
}

function RewriteForm({ item, onSave }) {
  const [title, setTitle] = useState(item.title);
  const [bullets, setBullets] = useState((item.bullets || []).join('\n'));
  const [note, setNote] = useState('');
  return (
    <details style={{ marginTop: '8px' }}>
      <summary style={{ cursor: 'pointer' }}>Rewrite from the sources</summary>
      <label style={{ display: 'block', marginTop: '8px' }}>Headline
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
      </label>
      <label style={{ display: 'block', marginTop: '8px' }}>Bullets (one per line, 1 to 5)
        <textarea value={bullets} onChange={e => setBullets(e.target.value)} rows={6} style={{ width: '100%' }} />
      </label>
      <label style={{ display: 'block', marginTop: '8px' }}>Note for the change log (which sources you used)
        <input value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%' }} />
      </label>
      <button style={{ marginTop: '8px' }}
        onClick={() => onSave({ title, bullets: bullets.split('\n').map(b => b.trim()).filter(Boolean), note })}>
        Save rewrite
      </button>
    </details>
  );
}

function ReviewerPanel({ item, checklist, act }) {
  const [ticks, setTicks] = useState({});
  const held = item.lane === 'review' || item.lane === 'senior_review';
  const allTicked = checklist.every(c => ticks[c.key]);
  return (
    <div style={{ background: 'var(--bg-subtle, #f6f3ea)', borderLeft: '3px solid #b08900', padding: '12px', fontSize: '13px', marginBottom: '28px' }}>
      <div style={{ fontWeight: 600, marginBottom: '6px' }}>Reviewer only — never shown to readers</div>
      <div>Source headline: {item.source_headline}</div>
      {item.reasons.length > 0 && (
        <ul style={{ margin: '6px 0', paddingLeft: '18px' }}>{item.reasons.map(r => <li key={r}>{r}</li>)}</ul>
      )}
      {item.named_in_sources.length > 0 && <div>Named in the source articles: {item.named_in_sources.join(', ')}</div>}
      {item.edited_by && <div>Rewritten by {item.edited_by} at {item.edited_at}</div>}
      {item.stale_approval_by && <div style={{ color: '#c0392b' }}>The approval by {item.stale_approval_by} no longer applies: the text changed since. Approve again if it is right.</div>}
      {item.left_out_by && <div>Left out by {item.left_out_by}</div>}
      <details style={{ marginTop: '8px' }}>
        <summary style={{ cursor: 'pointer' }}>Source articles ({item.sources.length})</summary>
        <ol style={{ paddingLeft: '18px' }}>
          {item.sources.map((s, i) => (
            <li key={i} style={{ marginBottom: '6px' }}>
              <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
              <div style={{ color: 'var(--text-muted)' }}>{s.summary}</div>
            </li>
          ))}
        </ol>
      </details>
      <RewriteForm item={item} onSave={body => act(() => post(`${item.id}/rewrite`, body))} />
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {item.left_out_by
          ? <button onClick={() => act(() => post(`${item.id}/restore`))}>Restore</button>
          : <button onClick={() => { const reason = window.prompt('Why leave this item out?'); if (reason) act(() => post(`${item.id}/leave-out`, { reason })); }}>Leave out</button>}
      </div>
      {held && !item.approved_by && !item.left_out_by && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontWeight: 600 }}>Editor's checklist</div>
          {checklist.map(c => (
            <label key={c.key} style={{ display: 'block' }}>
              <input type="checkbox" checked={!!ticks[c.key]} onChange={e => setTicks({ ...ticks, [c.key]: e.target.checked })} /> {c.label}
            </label>
          ))}
          <button disabled={!allTicked} style={{ marginTop: '8px' }}
            onClick={() => act(() => post(`${item.id}/approve`, { checklist: ticks }))}>
            Approve for publication
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminBriefing() {
  const [day, setDay] = useState(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }));
  const [state, setState] = useState({ loading: true });

  const load = useCallback(async () => {
    try {
      const headers = await authHeaders();
      const [res, logRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/briefing?day=${day}`, { headers }),
        fetch(`${API_BASE}/api/admin/briefing/log`, { headers }),
      ]);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!logRes.ok) throw new Error(`change log: HTTP ${logRes.status}`);
      const log = (await logRes.json()).entries.filter(e => e.date === day);
      setState({ loading: false, data: await res.json(), log });
    } catch (e) {
      setState({ loading: false, error: e.message });
    }
  }, [day]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn) => {
    try { await fn(); await load(); } catch (e) { alert(`Not saved: ${e.message}`); }
  };

  const data = state.data;
  return (
    <div style={{ padding: '24px', maxWidth: '860px' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Daily Briefing — edition review</h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Not public until counsel clears the Briefing (BRIEFING_PUBLIC). Read every held item against its sources before approving.
        Check any candidacy or party descriptor live today. Every action is recorded with your name.
      </p>
      <input type="date" value={day} onChange={e => setDay(e.target.value)} style={{ marginBottom: '16px' }} />
      {state.loading && <p>Loading…</p>}
      {state.error && <p style={{ color: '#c0392b' }}>Could not load the edition: {state.error}</p>}
      {data && data.items.length === 0 && <p>No edition was built for this day.</p>}
      {data && data.items.some(i => i.is_sample) && <p style={{ fontWeight: 600 }}>Sample edition for counsel — never shown to readers.</p>}
      {data && data.items.map(item => (
        <div key={item.id}>
          <div style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace", marginBottom: '6px',
                        color: item.lane === 'senior_review' || item.lane === 'left_out' ? '#c0392b' : 'var(--text-secondary)' }}>
            #{item.position} · {LANE[item.lane]}
            {' · '}{item.publishable ? 'will publish' : 'not publishable'}
            {item.approved_by && ` · approved by ${item.approved_by} at ${item.approved_at}`}
          </div>
          <div style={{ opacity: item.lane === 'left_out' ? 0.5 : 1 }}>
            <BriefingItem item={item} ui={data.ui} />
          </div>
          <ReviewerPanel item={item} checklist={data.checklist} act={act} />
        </div>
      ))}
      {state.log && state.log.length > 0 && (
        <>
          <h2 style={{ fontSize: '17px' }}>Change log for {day}</h2>
          <ul style={{ fontSize: '12px', fontFamily: "'IBM Plex Mono', monospace" }}>
            {state.log.map(e => <li key={e.id}>{e.created_at} · {e.editor} · {e.action}{e.note ? ` · ${e.note}` : ''}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
