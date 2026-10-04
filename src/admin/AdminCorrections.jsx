import { useState } from 'react';
import { useDesk } from './desk/context';
import { SUBJECT, ago, deskFetch, plural, stamp, useDeskData, word } from './desk/api';
import { Notice, Page, Row, Section, Stateful, Tabs } from './desk/Kit';
import './desk.css';

/**
 * Corrections queue. Open requests first, ordered by deadline; open a row to
 * read the request and act on it. Every action is written to the audit log
 * with the editor's name (backend: app/routers/corrections.py).
 */
const OPEN = ['new', 'in_review', 'escalated_legal'];
const STATUS = { new: 'New', in_review: 'In review', escalated_legal: 'Legal', actioned: 'Actioned', declined: 'Declined' };
const ACTIONS = [
  { status: 'in_review', label: 'Start review', when: s => s === 'new' },
  { status: 'actioned', label: 'Mark actioned', primary: true, when: s => s !== 'actioned' },
  { status: 'declined', label: 'Decline', when: s => s !== 'declined' },
  { status: 'escalated_legal', label: 'Escalate to legal', when: s => s !== 'escalated_legal' },
  { status: 'in_review', label: 'Reopen', when: s => s === 'actioned' || s === 'declined' },
];

const overdue = r => OPEN.includes(r.status) && r.sla_due_at && new Date(r.sla_due_at) < new Date();

function CorrectionDetail({ row, onSaved }) {
  const [note, setNote] = useState(row.resolution_note || '');
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const act = async status => {
    setBusy(status);
    setError(null);
    try {
      await deskFetch(`/api/admin/corrections/${row.id}`, { method: 'PATCH', body: { status, resolution_note: note.trim() || undefined } });
      await onSaved(`${STATUS[status]}: ${row.category || 'correction'}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <dl className="kv">
        <dt>Page</dt><dd>{row.page_url ? <a href={row.page_url} target="_blank" rel="noreferrer">{row.page_url}</a> : '—'}</dd>
        <dt>What is wrong</dt><dd>{row.description || '—'}</dd>
        {row.claimed_correct_info && <><dt>Says it should be</dt><dd>{row.claimed_correct_info}</dd></>}
        {row.source_url && <><dt>Their source</dt><dd><a href={row.source_url} target="_blank" rel="noreferrer">{row.source_url}</a></dd></>}
        <dt>From</dt><dd>{row.requester_name || 'Name not given'}{row.requester_email ? ` · ${row.requester_email}` : ''}{row.requester_relationship ? ` · ${row.requester_relationship}` : ''}</dd>
        <dt>Received</dt><dd>{stamp(row.created_at)}</dd>
        <dt>Deadline</dt><dd style={{ color: overdue(row) ? 'var(--v-mixed)' : undefined }}>{stamp(row.sla_due_at)}{overdue(row) ? ' · past deadline' : ''}</dd>
        {row.resolved_by && <><dt>Resolved</dt><dd>{row.resolved_by.split(' (')[0]} · {stamp(row.resolved_at)}</dd></>}
      </dl>
      {row.subject_type === 'cluster_summary' && row.status !== 'actioned' && (
        <p className="explain"><b>Marking this actioned withdraws the story’s AI summary</b> until a new one is generated.</p>
      )}
      <div className="field">
        <label htmlFor={`note-${row.id}`}>Note (kept on the record)</label>
        <textarea id={`note-${row.id}`} value={note} onChange={e => setNote(e.target.value)}
                  placeholder="What you checked and what you did" />
      </div>
      {error && <p className="t-meta" style={{ color: 'var(--v-mixed)' }}>{error}</p>}
      <div className="act">
        {ACTIONS.filter(a => a.when(row.status)).map(a => (
          <button key={a.label} type="button" disabled={!!busy}
                  className={`btn btn-sm ${a.primary ? 'btn-primary' : 'btn-secondary'}`} onClick={() => act(a.status)}>
            {busy === a.status ? 'Saving…' : a.label}
          </button>
        ))}
      </div>
    </>
  );
}

export default function AdminCorrections() {
  const state = useDeskData('/api/admin/corrections');
  const { refresh } = useDesk();
  const [tab, setTab] = useState('open');
  const [open, setOpen] = useState(null);
  const [notice, setNotice] = useState(null);

  const rows = state.data || [];
  const openRows = rows.filter(r => OPEN.includes(r.status))
    .sort((a, b) => (a.sla_due_at || '').localeCompare(b.sla_due_at || ''));
  const closedRows = rows.filter(r => !OPEN.includes(r.status));
  const shown = tab === 'open' ? openRows : closedRows;
  const late = openRows.filter(overdue).length;

  const saved = async text => {
    await state.reload();
    refresh();
    setOpen(null);
    setNotice({ text });
  };

  return (
    <Page
      dateline="Desk · Corrections"
      lede={!state.data ? 'Corrections' : openRows.length === 0 ? 'No correction is waiting.'
        : late ? `${plural(openRows.length, 'correction is', 'corrections are')} open, ${word(late)} past ${late === 1 ? 'its' : 'their'} deadline.`
          : `${plural(openRows.length, 'correction is', 'corrections are')} open, all within deadline.`}
      byline="Summary corrections are due in 12 hours, others in five working days. Open a request to read it and act."
      actions={<button type="button" className="btn btn-secondary btn-sm" onClick={state.reload} disabled={state.loading}>{state.loading ? 'Refreshing…' : 'Refresh'}</button>}
    >
      <Tabs value={tab} onChange={t => { setTab(t); setOpen(null); }}
            tabs={[{ value: 'open', label: 'Open', count: openRows.length }, { value: 'closed', label: 'Closed', count: closedRows.length }]} />
      <Section title={tab === 'open' ? 'Open, by deadline' : 'Closed, newest first'}>
        <Stateful state={state} isEmpty={shown.length === 0}
                  empty={tab === 'open' ? 'No open requests. New ones appear here as readers send them.' : 'Nothing has been closed yet.'}>
          {shown.map(r => (
            <Row key={r.id} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)}
                 tone={overdue(r) ? 'new' : r.status === 'actioned' ? 'ok' : 'neutral'}
                 mark={overdue(r) ? 'Overdue' : STATUS[r.status] || r.status}
                 title={`${r.category || 'Correction'} — ${SUBJECT[r.subject_type] || r.subject_type || 'Page'}${r.subject_id ? `: ${r.subject_id}` : ''}`}
                 meta={`${r.requester_name || 'Name not given'} · due ${stamp(r.sla_due_at)}`}
                 age={ago(r.created_at)}>
              <CorrectionDetail row={r} onSaved={saved} />
            </Row>
          ))}
        </Stateful>
      </Section>
      <Notice notice={notice} onDone={() => setNotice(null)} />
    </Page>
  );
}
