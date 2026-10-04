import { useState } from 'react';
import { useDesk } from './desk/context';
import { deskFetch, stamp, useDeskData, word } from './desk/api';
import { Notice, Page, Row, Section, Stateful, Tabs } from './desk/Kit';
import { evidenceText } from './evidenceText';
import './desk.css';

/**
 * Monitoring Spirit, staff view. Lists the stories from the last 72 hours on
 * which the engine reached a DARK or MIXED verdict. Readers see neither
 * (DARK_ENABLED and MIXED_ENABLED are off in tracenews-api
 * app/monitoring_spirit.py). Withdrawing a verdict records that a named editor
 * judged it wrong, so it can never be published for that story.
 */
const MEANING = {
  dark: 'One tier of outlets is covering a significant story heavily while another tier has gone almost silent, and the pattern has held over time.',
  mixed: 'Most outlets on the story appear to be running the same report. Withheld from readers: it is estimated from each outlet’s 30-day originality, not from this story’s text (counsel, 2 Oct 2026).',
};

function VerdictDetail({ v, onSaved }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const withdraw = async () => {
    if (!reason.trim()) { setError('Say why the verdict is wrong; it goes on the record.'); return; }
    setBusy(true);
    setError(null);
    try {
      await deskFetch('/api/admin/monitoring-spirit/overrides', { method: 'POST', body: { cluster_id: v.cluster_id, original_verdict: v.verdict, reason: reason.trim() } });
      await onSaved(`Withdrawn: ${v.headline}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <dl className="kv">
        {(Array.isArray(v.evidence) ? v.evidence : [v.evidence]).filter(Boolean).map((e, i) => (
          <FragmentRow key={i} label={typeof e === 'string' ? 'Evidence' : e.label || e.type} value={evidenceText([e])} />
        ))}
        <dt>Story</dt><dd><a href={`/story/${v.slug}`} target="_blank" rel="noreferrer">/story/{v.slug}</a></dd>
      </dl>
      {v.has_active_override ? <p className="t-meta">Already withdrawn by an editor.</p> : (
        <>
          <div className="field">
            <label htmlFor={`why-${v.cluster_id}`}>Why the verdict is wrong (required)</label>
            <textarea id={`why-${v.cluster_id}`} value={reason} onChange={e => setReason(e.target.value)}
                      placeholder="e.g. the outlets reported it independently; the silence is explained by …" />
          </div>
          {error && <p className="t-meta" style={{ color: 'var(--v-mixed)' }}>{error}</p>}
          <div className="act">
            <button type="button" className="btn btn-sm btn-secondary" disabled={busy} onClick={withdraw}>{busy ? 'Saving…' : 'Withdraw verdict'}</button>
          </div>
        </>
      )}
    </>
  );
}

function FragmentRow({ label, value }) {
  return <><dt>{label}</dt><dd>{value}</dd></>;
}

export default function MonitoringSpiritAdmin() {
  const verdicts = useDeskData('/api/admin/monitoring-spirit/verdicts');
  const overrides = useDeskData('/api/admin/monitoring-spirit/overrides');
  const { refresh } = useDesk();
  const [tab, setTab] = useState('dark');
  const [open, setOpen] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(null);

  const all = verdicts.data || [];
  const dark = all.filter(v => v.verdict === 'dark');
  const mixed = all.filter(v => v.verdict === 'mixed');
  const withdrawn = overrides.data || [];
  const shown = tab === 'dark' ? dark : mixed;

  const saved = async text => {
    await Promise.all([verdicts.reload(), overrides.reload()]);
    refresh();
    setOpen(null);
    setNotice({ text });
  };
  const reinstate = async o => {
    setBusy(o.id);
    try {
      await deskFetch(`/api/admin/monitoring-spirit/overrides/${o.id}/reinstate`, { method: 'POST', body: {} });
      await saved(`Reinstated: ${o.headline || 'verdict'}`);
    } catch (err) {
      setNotice({ text: err.message, error: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page
      dateline="Intelligence · Monitoring Spirit · last 72 hours"
      lede={!verdicts.data ? 'Monitoring Spirit' : `${word(dark.length, true)} dark and ${word(mixed.length)} mixed ${dark.length + mixed.length === 1 ? 'verdict' : 'verdicts'}. Readers see none of them.`}
      byline="The engine reads how each story is being covered and flags unusual patterns. Nothing on this page is published; it is here so editors can check the engine before any verdict goes public."
      actions={<button type="button" className="btn btn-secondary btn-sm" disabled={verdicts.loading}
                       onClick={() => { verdicts.reload(); overrides.reload(); }}>{verdicts.loading ? 'Refreshing…' : 'Refresh'}</button>}
    >
      <p className="explain"><b>Dark</b> — {MEANING.dark}<br /><b>Mixed</b> — {MEANING.mixed}</p>
      <Tabs value={tab} onChange={t => { setTab(t); setOpen(null); }} tabs={[
        { value: 'dark', label: 'Dark', count: dark.length },
        { value: 'mixed', label: 'Mixed', count: mixed.length },
        { value: 'withdrawn', label: 'Withdrawn', count: withdrawn.length },
      ]} />
      {tab === 'withdrawn' ? (
        <Section title="Withdrawn by an editor">
          <Stateful state={overrides} isEmpty={withdrawn.length === 0} empty="No verdict has been withdrawn.">
            {withdrawn.map(o => (
              <Row key={o.id} open={open === o.id} onToggle={() => setOpen(open === o.id ? null : o.id)}
                   tone="neutral" mark={o.original_verdict} title={o.headline || o.cluster_id}
                   meta={`${(o.actor || 'Unknown').split(' (')[0]} · ${stamp(o.created_at)}`}>
                <p className="led" style={{ borderBottom: 'none' }}><q>{o.reason}</q></p>
                <div className="act">
                  <button type="button" className="btn btn-sm btn-secondary" disabled={busy === o.id} onClick={() => reinstate(o)}>
                    {busy === o.id ? 'Saving…' : 'Reinstate verdict'}
                  </button>
                </div>
              </Row>
            ))}
          </Stateful>
        </Section>
      ) : (
        <Section title={tab === 'dark' ? 'Dark verdicts' : 'Mixed verdicts'}>
          <Stateful state={verdicts} isEmpty={shown.length === 0}
                    empty={tab === 'dark' ? 'No story has a dark verdict in the last 72 hours.' : 'No story has a mixed verdict in the last 72 hours.'}>
            {shown.map(v => (
              <Row key={v.cluster_id} open={open === v.cluster_id} onToggle={() => setOpen(open === v.cluster_id ? null : v.cluster_id)}
                   tone={v.verdict === 'dark' ? 'dark' : 'new'} mark={v.has_active_override ? 'Withdrawn' : v.verdict}
                   title={v.headline} meta={evidenceText(v.evidence, 'No evidence recorded')}>
                <VerdictDetail v={v} onSaved={saved} />
              </Row>
            ))}
          </Stateful>
        </Section>
      )}
      <Notice notice={notice} onDone={() => setNotice(null)} />
    </Page>
  );
}
