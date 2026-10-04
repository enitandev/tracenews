import { useEffect } from 'react';
import { ROUTES } from '../constants/routes';
import { useDesk } from './desk/context';
import { SUBJECT, ago, plural, stamp } from './desk/api';
import { Empty, Failure, Figures, Loading, Page, Row, Section } from './desk/Kit';
import './desk.css';

/**
 * The Desk overview: one sentence on what needs you, then the figures, then
 * the queue in the order it should be worked. The standing column carries
 * platform health (measured, never a fixed label) and the ledger of staff
 * actions. Data: /api/admin/desk, shared with the rail through the shell.
 */
function lede(c) {
  const parts = [];
  if (c.briefing_waiting_me > 0) parts.push(`${plural(c.briefing_waiting_me, 'Briefing item needs', 'Briefing items need')} you`);
  if (c.corrections_overdue > 0) parts.push(`${plural(c.corrections_overdue, 'correction is', 'corrections are').toLowerCase()} past its deadline`);
  else if (c.corrections_open > 0) parts.push(`${plural(c.corrections_open, 'correction is', 'corrections are').toLowerCase()} open`);
  if (c.politicians_held > 0) parts.push(`${plural(c.politicians_held, 'politician is', 'politicians are').toLowerCase()} held for review`);
  if (!parts.length) return 'Nothing is waiting for you.';
  const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  if (parts.length === 1) return `${first}.`;
  return `${[first, ...parts.slice(1, -1)].join(', ')} and ${parts[parts.length - 1]}.`;
}

const HEALTH_VALUE = h => (h.minutes == null ? 'no record' : `${ago(new Date(Date.now() - h.minutes * 60000).toISOString())} ago`);

export default function AdminOverview() {
  const { summary, refresh } = useDesk();
  useEffect(() => { refresh(); }, [refresh]);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const standing = (
    <>
      <p className="st-h">Platform</p>
      {!summary ? <Loading rows={3} /> : (
        <>
          {summary.health.map(h => (
            <div className="hb" key={h.key}>
              <span>{h.label}</span>
              <span className={`v ${h.late ? 'warn' : 'ok'}`}>{HEALTH_VALUE(h)}</span>
            </div>
          ))}
          <div className="hb"><span>Version</span><span className="v">{summary.version}</span></div>
        </>
      )}
      <p className="st-h" style={{ marginTop: 'var(--s6)' }}>Ledger</p>
      {!summary ? <Loading rows={3} /> : summary.ledger.length === 0 ? <Empty>No staff actions recorded yet.</Empty> : (
        summary.ledger.map((e, i) => (
          <div className="led" key={i}>
            <b>{e.actor?.split(' (')[0]}</b> {e.action} <b>{e.subject}</b>
            {e.reason && <> — <q>{e.reason}</q></>}
            <span className="ts">{stamp(e.at)}</span>
          </div>
        ))
      )}
    </>
  );

  if (!summary) {
    return <Page dateline={`Overview · ${today}`} standing={standing}><Loading rows={6} label="Reading the desk…" /></Page>;
  }

  const c = summary.counts;
  const briefingMine = summary.queue.briefing.filter(i => i.mine);
  const briefingOthers = summary.queue.briefing.filter(i => !i.mine);

  return (
    <Page
      dateline={`Overview · ${today}`}
      lede={lede(c)}
      byline={`Signed in as ${summary.me.split(' (')[0]} · every action on this desk is recorded against your name`}
      standing={standing}
    >
      <Figures items={[
        { label: 'Briefing', value: c.briefing_waiting_me, attention: c.briefing_waiting_me > 0,
          note: c.briefing_items == null ? 'Today’s edition could not be read' : `${c.briefing_waiting} held of ${c.briefing_items} today` },
        { label: 'Corrections', value: c.corrections_open, attention: c.corrections_overdue > 0,
          note: c.corrections_overdue ? `${c.corrections_overdue} past deadline` : 'All within deadline' },
        { label: 'Politicians', value: c.politicians_held, note: 'Held for review' },
        { label: 'Verdicts', value: c.verdicts, note: 'Staff only · not shown to readers' },
      ]} />

      {c.briefing_items == null && <Failure message="Today’s Briefing edition could not be read. Open the Briefing to see why." />}

      <Section title="Waiting for you" link={{ to: ROUTES.ADMIN_BRIEFING, label: 'Daily Briefing' }} count={briefingMine.length}>
        {briefingMine.length === 0 ? <Empty>No Briefing item is waiting for you.</Empty> : briefingMine.map(i => (
          <Row key={i.id} to={ROUTES.ADMIN_BRIEFING} tone="new"
               mark={i.approved_by ? '1 of 2' : i.lane === 'senior_review' ? 'Senior' : 'Review'}
               title={i.title}
               meta={i.approved_by ? `Approved by ${i.approved_by.split(' (')[0]} · needs your approval` : 'Needs an editor’s approval'} />
        ))}
        {briefingOthers.map(i => (
          <Row key={i.id} to={ROUTES.ADMIN_BRIEFING} tone="neutral" mark="Waiting" title={i.title}
               meta={i.waiting_for ? `Waiting for ${i.waiting_for}` : 'Waiting for another editor'} />
        ))}
      </Section>

      <Section title="Corrections" link={{ to: ROUTES.ADMIN_CORRECTIONS, label: 'Open queue' }} count={c.corrections_open}>
        {summary.queue.corrections.length === 0 ? <Empty>No correction requests are open.</Empty> : summary.queue.corrections.map(r => (
          <Row key={r.id} to={ROUTES.ADMIN_CORRECTIONS} tone={r.overdue ? 'new' : 'neutral'}
               mark={r.overdue ? 'Overdue' : r.status.replace('_', ' ')}
               title={`${r.category || 'Correction'} — ${SUBJECT[r.subject_type] || r.subject_type || 'Page'}${r.subject_id ? `: ${r.subject_id}` : ''}`}
               meta={r.page_url || 'No page given'}
               age={ago(r.created_at)} />
        ))}
      </Section>

      <Section title="Politicians" link={{ to: ROUTES.ADMIN_POLITICIANS, label: 'Review queue' }}>
        {c.politicians_held === 0 ? <Empty>No politician is held for review.</Empty>
          : <Row to={ROUTES.ADMIN_POLITICIANS} tone="neutral" mark="Held"
                 title={`${plural(c.politicians_held, 'politician page is', 'politician pages are')} held for review`}
                 meta="Held and private pages return 404 to readers until a decision is recorded." />}
      </Section>
    </Page>
  );
}
