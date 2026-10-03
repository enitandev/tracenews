import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ds/Button';
import { Pill } from '../components/ds/Marks';
import { Field, Input, Textarea } from '../components/ds/Form';

/**
 * Daily Briefing — edition review on the Desk (counsel, 3 Oct 2026, B6, and
 * counsel's review of the 3 Oct samples, items 2, 7, 8, 9). Items held for
 * review reach readers only after a named editor ticks the checklist and
 * approves. Editors can rewrite an item from its sources, leave it out or
 * restore it; every action goes to the change log. Everything on this page
 * is staff-only; readers see only the published text.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';

const LANE = {
  senior_review: { label: 'Senior review', pill: 'dark', note: 'Adverse context involving a principal office-holder' },
  review: { label: 'Review', pill: 'mixed' },
  auto: { label: 'Auto', pill: 'clear' },
  left_out: { label: 'Left out', pill: 'neutral' },
};
const SECTIONS = [
  { key: 'held', title: 'Needs an editor', match: i => (i.lane === 'review' || i.lane === 'senior_review') && !i.approved_by,
    empty: 'Nothing is waiting for an editor.' },
  { key: 'approved', title: 'Approved', match: i => (i.lane === 'review' || i.lane === 'senior_review') && i.approved_by,
    empty: 'No approvals yet.' },
  { key: 'auto', title: 'Publishes automatically', match: i => i.lane === 'auto', empty: 'None.' },
  { key: 'out', title: 'Left out', match: i => i.lane === 'left_out', empty: 'None.' },
];
const TIERS = [['govt_aligned', 'd-govt'], ['mainstream', 'd-main'], ['watchdog', 'd-watch']];

async function api(path, body) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${API_BASE}/api/admin/briefing${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.detail || `HTTP ${res.status}`);
  return json;
}

function shortDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function longDate(iso) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

function ReaderPreview({ item, ui }) {
  const counts = item.coverage_counts || {};
  const total = TIERS.reduce((n, [t]) => n + (counts[t] || 0), 0);
  return (
    <div>
      <p className="t-label" style={{ marginBottom: 'var(--s2)' }}>As readers would see it</p>
      <h3 className="br-hl">{item.title}</h3>
      <p className="t-meta">{ui.attribution_label}</p>
      <ul className="br-bul">
        {(item.bullets || []).filter(b => typeof b === 'string').map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <p className="t-meta" style={{ marginBottom: 'var(--s1)' }}>{ui.coverage_heading}: {total}</p>
      <div className="tierlabels" style={{ marginTop: 0 }}>
        {TIERS.map(([t, dot]) => (
          <span key={t}><i className={`dot ${dot}`} />{ui.tier_labels[t]}<b>{counts[t] ?? 0}</b></span>
        ))}
      </div>
    </div>
  );
}

function RewriteForm({ item, onDone, onCancel }) {
  const [title, setTitle] = useState(item.title);
  const [bullets, setBullets] = useState((item.bullets || []).join('\n'));
  const [note, setNote] = useState('');
  const [state, setState] = useState({});
  const save = async () => {
    setState({ busy: true });
    try {
      await api(`/${item.id}/rewrite`, { title, bullets: bullets.split('\n').map(b => b.trim()).filter(Boolean), note });
      onDone();
    } catch (e) {
      setState({ error: e.message });
    }
  };
  return (
    <div className="br-sec">
      <Field label="Headline"><Input value={title} onChange={e => setTitle(e.target.value)} /></Field>
      <Field label="Bullets" hint="One bullet per line, 1 to 5. Name every person in full on first mention.">
        <Textarea rows={8} value={bullets} onChange={e => setBullets(e.target.value)} />
      </Field>
      <Field label="Note for the change log" hint="Which source articles you used.">
        <Input value={note} onChange={e => setNote(e.target.value)} />
      </Field>
      <div className="br-actions">
        <Button size="sm" loading={state.busy} onClick={save}>Save rewrite</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      {state.error && <p className="br-err">{state.error}</p>}
    </div>
  );
}

function EditorPanel({ item, checklist, reload }) {
  const [mode, setMode] = useState(null);          // 'rewrite' | 'leave'
  const [ticks, setTicks] = useState({});
  const [reason, setReason] = useState('');
  const [state, setState] = useState({});
  const held = item.lane === 'review' || item.lane === 'senior_review';
  const allTicked = checklist.every(c => ticks[c.key]);

  const run = async (path, body) => {
    setState({ busy: path });
    try {
      await api(path, body);
      setMode(null);
      setState({});
      reload();
    } catch (e) {
      setState({ error: e.message });
    }
  };

  return (
    <div>
      <div className="br-sec">
        <p className="t-label">Why it is here</p>
        {item.reasons.length === 0
          ? <p className="t-meta">No checks fired.</p>
          : <ul className="br-why">{item.reasons.map(r => <li key={r} className={item.lane === 'left_out' ? 'out' : ''}>{r}</li>)}</ul>}
        {LANE[item.lane].note && <p className="t-meta" style={{ marginTop: 'var(--s2)' }}>{LANE[item.lane].note}.</p>}
      </div>

      <div className="br-sec">
        <p className="t-label">Record</p>
        <p className="t-meta">Source headline: {item.source_headline}</p>
        {item.edited_by && <p className="t-meta">Rewritten by {item.edited_by}</p>}
        {item.approved_by && <p className="br-ok">Approved by {item.approved_by}</p>}
        {item.stale_approval_by && <p className="br-err">Approval by {item.stale_approval_by} no longer applies: the text changed. Approve again if it is right.</p>}
        {item.left_out_by && <p className="t-meta">Left out by {item.left_out_by}</p>}
        {item.named_in_sources.length > 0 && <p className="t-meta">Named in the source articles: {item.named_in_sources.join(', ')}</p>}
      </div>

      {mode === 'rewrite' && <RewriteForm item={item} onDone={() => { setMode(null); reload(); }} onCancel={() => setMode(null)} />}

      {mode === 'leave' && (
        <div className="br-sec">
          <Field label="Why leave this item out?"><Input value={reason} onChange={e => setReason(e.target.value)} /></Field>
          <div className="br-actions">
            <Button size="sm" variant="secondary" disabled={!reason.trim()} loading={state.busy === `/${item.id}/leave-out`}
              onClick={() => run(`/${item.id}/leave-out`, { reason })}>Leave out</Button>
            <Button size="sm" variant="ghost" onClick={() => setMode(null)}>Cancel</Button>
          </div>
        </div>
      )}

      {!mode && (
        <div className="br-sec br-actions">
          <Button size="sm" variant="secondary" onClick={() => setMode('rewrite')}>Rewrite from sources</Button>
          {item.left_out_by
            ? <Button size="sm" variant="secondary" loading={state.busy === `/${item.id}/restore`} onClick={() => run(`/${item.id}/restore`, {})}>Restore</Button>
            : <Button size="sm" variant="ghost" onClick={() => setMode('leave')}>Leave out</Button>}
        </div>
      )}

      {held && !item.approved_by && !item.left_out_by && !mode && (
        <div className="br-sec br-check">
          <p className="t-label">Editor's checklist</p>
          {checklist.map(c => (
            <label key={c.key}>
              <input type="checkbox" checked={!!ticks[c.key]} onChange={e => setTicks({ ...ticks, [c.key]: e.target.checked })} />
              <span>{c.label}</span>
            </label>
          ))}
          <div className="br-actions" style={{ marginTop: 'var(--s3)' }}>
            <Button size="sm" disabled={!allTicked} loading={state.busy === `/${item.id}/approve`}
              onClick={() => run(`/${item.id}/approve`, { checklist: ticks })}>Approve for publication</Button>
            {!allTicked && <span className="t-meta">Tick every line to approve.</span>}
          </div>
        </div>
      )}
      {state.error && <p className="br-err">{state.error}</p>}

      <details className="br-sec">
        <summary className="t-label" style={{ cursor: 'pointer' }}>Source articles ({item.sources.length})</summary>
        <ol className="br-src" style={{ marginTop: 'var(--s3)' }}>
          {item.sources.map((s, i) => (
            <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><br />{s.summary}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}

export default function AdminBriefing() {
  const [dates, setDates] = useState(null);
  const [day, setDay] = useState(null);
  const [state, setState] = useState({ loading: true });
  const [open, setOpen] = useState(null);

  const loadDates = useCallback(async () => {
    try {
      const { dates: list } = await api('/dates');
      setDates(list);
      setDay(d => d || list[0]?.date || new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' }));
    } catch (e) {
      setState({ loading: false, error: e.message });
    }
  }, []);

  const load = useCallback(async () => {
    if (!day) return;
    try {
      const [edition, log] = await Promise.all([api(`?day=${day}`), api('/log')]);
      setState({ loading: false, data: edition, log: log.entries.filter(e => e.date === day) });
    } catch (e) {
      setState({ loading: false, error: e.message });
    }
  }, [day]);

  useEffect(() => { loadDates(); }, [loadDates]);
  useEffect(() => { load(); }, [load]);

  const data = state.data;
  const items = data?.items || [];
  const count = key => items.filter(SECTIONS.find(s => s.key === key).match).length;
  const isSample = items.some(i => i.is_sample);

  return (
    <>
      <div className="desk-col">
        <p className="dateline">Newsroom · Daily Briefing{isSample ? ' · Sample edition for counsel' : ''}</p>
        <h1 className="lede" style={{ maxWidth: '26ch' }}>{day ? longDate(day) : 'Daily Briefing'}</h1>
        <div className="byline">
          Not public until counsel clears the Briefing. Read every held item against its sources and check any party or
          candidacy descriptor live today. Every action is recorded with your name.
        </div>

        {state.error && <p className="br-err">Could not load: {state.error}</p>}
        {state.loading && !state.error && <p className="t-meta">Loading…</p>}

        {data && (
          <>
            <div className="figs">
              <div className="fig"><div className="l">Needs an editor</div><div className={`v ${count('held') ? 'att' : ''}`}>{count('held')}</div><div className="s">Held for review</div></div>
              <div className="fig"><div className="l">Approved</div><div className="v">{count('approved')}</div><div className="s">By a named editor</div></div>
              <div className="fig"><div className="l">Automatic</div><div className="v">{count('auto')}</div><div className="s">No check fired</div></div>
              <div className="fig"><div className="l">Left out</div><div className="v">{count('out')}</div><div className="s">By the rules or an editor</div></div>
            </div>

            {items.length === 0 && <p className="t-meta">No edition was built for this day.</p>}

            {items.length > 0 && SECTIONS.map(sec => {
              const rows = items.filter(sec.match);
              return (
                <div className="ds" key={sec.key}>
                  <div className="ds-h"><span className="t">{sec.title}</span><span className="ln" /><span className="lk">{rows.length}</span></div>
                  {rows.length === 0 && <p className="t-meta" style={{ padding: 'var(--s2) 0' }}>{sec.empty}</p>}
                  {rows.map(item => (
                    <React.Fragment key={item.id}>
                      <div className={`it br-row ${open === item.id ? 'open' : ''}`} onClick={() => setOpen(open === item.id ? null : item.id)}>
                        <Pill variant={item.approved_by ? 'clear' : LANE[item.lane].pill}>{item.approved_by ? 'Approved' : LANE[item.lane].label}</Pill>
                        <div className="bd">
                          <div className="tt">{item.title}</div>
                          <div className="mt">
                            {item.reasons.length > 0 ? item.reasons[0] : 'No checks fired'}
                            {item.reasons.length > 1 && ` · +${item.reasons.length - 1} more`}
                            {item.edited_by && ' · rewritten'}
                          </div>
                        </div>
                        <span className="ag">#{item.position}</span>
                      </div>
                      {open === item.id && (
                        <div className="br-detail">
                          <ReaderPreview item={item} ui={data.ui} />
                          <EditorPanel item={item} checklist={data.checklist} reload={() => { load(); loadDates(); }} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>

      <aside className="stand">
        <p className="st-h">Editions</p>
        {dates && dates.length === 0 && <p className="t-meta">No editions yet.</p>}
        {dates && dates.map(d => (
          <button key={d.date} className={`br-date ${d.date === day ? 'on' : ''}`} onClick={() => { setOpen(null); setDay(d.date); }}>
            <span>{shortDate(d.date)}</span>
            <span className="n">{d.is_sample ? 'sample · ' : ''}{d.items}</span>
          </button>
        ))}

        <p className="st-h" style={{ marginTop: 'var(--s6)' }}>Change log</p>
        {state.log && state.log.length === 0 && <p className="t-meta">No editor actions on this edition.</p>}
        {state.log && state.log.map(e => (
          <div className="led" key={e.id}>
            <b>{e.editor}</b> {e.action.replace('_', ' ')}
            {e.note && <> — <q>{e.note}</q></>}
            <span className="ts">{new Date(e.created_at).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </aside>
    </>
  );
}
