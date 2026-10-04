import { useState } from 'react';
import { useDesk } from './desk/context';
import { deskFetch, stamp, useDeskData } from './desk/api';
import { Empty, Loading, Notice, Page, Row, Section, Stateful, Tabs } from './desk/Kit';
import './desk.css';

/**
 * Politician pages: held pages (and excluded ones) are 404 to readers and
 * crawlers; a decision publishes, excludes or keeps a page held, always with
 * a reason, and is written to the audit log (app/routers/politicians_admin.py).
 */
const TABS = [
  { value: 'pending_review', label: 'Held' },
  { value: 'published', label: 'Published' },
  { value: 'excluded', label: 'Excluded' },
];
const DECISIONS = [
  { status: 'published', label: 'Publish', primary: true },
  { status: 'excluded', label: 'Exclude' },
  { status: 'pending_review', label: 'Keep held' },
];
const LABEL = { pending_review: 'Held', published: 'Published', excluded: 'Excluded' };
// Standing guidance carried over from the previous screen.
const ALWAYS_INCLUDE = {
  'Bola Ahmed Tinubu': 'Sitting President. Always include.',
  'Peter Obi': 'Major opposition figure. Always include.',
  'Nyesom Wike': 'Minister of the FCT, highly active. Always include.',
};

function History({ id }) {
  const state = useDeskData(`/api/admin/politicians/${id}/history`);
  if (!state.data && !state.error) return <Loading rows={2} />;
  if (state.error) return <p className="t-meta" style={{ color: 'var(--v-mixed)' }}>{state.error}</p>;
  if (!state.data.length) return <Empty>No decisions recorded yet.</Empty>;
  return state.data.map(h => (
    <div className="led" key={h.id}>
      <b>{(h.actor || 'Unknown').split(' (')[0]}</b> set it to <b>{LABEL[h.after_state?.publication_status] || h.after_state?.publication_status}</b>
      {h.before_state?.reason && <> — <q>{h.before_state.reason}</q></>}
      <span className="ts">{stamp(h.created_at)} · was {LABEL[h.before_state?.publication_status] || h.before_state?.publication_status}</span>
    </div>
  ));
}

function Decision({ row, onSaved }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const decide = async status => {
    if (!reason.trim()) { setError('Give a reason for the decision; it goes on the record.'); return; }
    setBusy(status);
    setError(null);
    try {
      await deskFetch(`/api/admin/politicians/${row.id}`, { method: 'PATCH', body: { publication_status: status, reason: reason.trim() } });
      await onSaved(`${row.name}: ${LABEL[status]}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      {ALWAYS_INCLUDE[row.name] && <p className="explain"><b>Guidance:</b> {ALWAYS_INCLUDE[row.name]}</p>}
      <dl className="kv">
        <dt>Status</dt><dd>{LABEL[row.publication_status]}</dd>
        <dt>Category</dt><dd>{row.category || '—'}</dd>
        <dt>Page</dt><dd>{row.slug ? <a href={`/politicians/${row.slug}`} target="_blank" rel="noreferrer">/politicians/{row.slug}</a> : '—'}</dd>
        <dt>Last change</dt><dd>{stamp(row.updated_at) || '—'}</dd>
      </dl>
      <div className="field">
        <label htmlFor={`reason-${row.id}`}>Reason (required, kept on the record)</label>
        <textarea id={`reason-${row.id}`} value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="The basis for this decision" />
      </div>
      {error && <p className="t-meta" style={{ color: 'var(--v-mixed)' }}>{error}</p>}
      <div className="act" style={{ marginBottom: 'var(--s5)' }}>
        {DECISIONS.filter(d => d.status !== row.publication_status).map(d => (
          <button key={d.status} type="button" disabled={!!busy}
                  className={`btn btn-sm ${d.primary ? 'btn-primary' : 'btn-secondary'}`} onClick={() => decide(d.status)}>
            {busy === d.status ? 'Saving…' : d.label}
          </button>
        ))}
      </div>
      <p className="st-h">History</p>
      <History id={row.id} />
    </>
  );
}

export default function AdminPoliticians() {
  const [tab, setTab] = useState('pending_review');
  const state = useDeskData(`/api/admin/politicians?status=${tab}`);
  const { summary, refresh } = useDesk();
  const [open, setOpen] = useState(null);
  const [notice, setNotice] = useState(null);
  const rows = state.data || [];
  const held = summary?.counts?.politicians_held;

  const saved = async text => {
    await state.reload();
    refresh();
    setOpen(null);
    setNotice({ text });
  };

  return (
    <Page
      dateline="Intelligence · Politicians"
      lede={held == null ? 'Politicians' : held === 0 ? 'No politician page is held.' : `${held} politician ${held === 1 ? 'page is' : 'pages are'} held for review.`}
      byline="Held and excluded pages return 404 to readers and search engines. Every decision needs a reason and is recorded with your name."
      actions={<button type="button" className="btn btn-secondary btn-sm" onClick={state.reload} disabled={state.loading}>{state.loading ? 'Refreshing…' : 'Refresh'}</button>}
    >
      <Tabs value={tab} onChange={t => { setTab(t); setOpen(null); }}
            tabs={TABS.map(t => ({ ...t, count: t.value === 'pending_review' ? held : undefined }))} />
      <Section title={`${TABS.find(t => t.value === tab).label}, A–Z`}>
        <Stateful state={state} isEmpty={rows.length === 0} empty={`No ${TABS.find(t => t.value === tab).label.toLowerCase()} pages.`}>
          {rows.map(r => (
            <Row key={r.id} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)}
                 tone={r.publication_status === 'pending_review' ? 'new' : r.publication_status === 'published' ? 'ok' : 'neutral'}
                 mark={LABEL[r.publication_status]} title={r.name}
                 meta={[r.category, ALWAYS_INCLUDE[r.name] ? 'Always include' : null].filter(Boolean).join(' · ') || '—'}
                 age={r.updated_at ? stamp(r.updated_at) : ''}>
              <Decision row={r} onSaved={saved} />
            </Row>
          ))}
        </Stateful>
      </Section>
      <Notice notice={notice} onDone={() => setNotice(null)} />
    </Page>
  );
}
