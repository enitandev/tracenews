import { useState } from 'react';
import { useDesk } from './desk/context';
import { deskFetch, plural, useDeskData, word } from './desk/api';
import { Empty, Failure, Loading, Notice, Page, Section, Stateful, Tabs } from './desk/Kit';
import { NotificationRow } from './desk/Notify';
import { browserAlertsSupported } from './desk/useNotifications';
import './desk.css';

/**
 * Notifications: everything on the platform or in the queue that needs an
 * editor, in one place. Each one is a condition that clears itself when the
 * work is done or the problem stops, so this list is always current; nothing
 * is emailed unless a person turns it on below.
 */
function lede(c) {
  if (!c) return 'Notifications';
  if (!c.open) return 'Nothing needs attention.';
  if (!c.unread) return `${plural(c.open, 'notification is', 'notifications are')} open, all read.`;
  const parts = [`${word(c.unread, true)} unread`];
  if (c.urgent) parts.push(`${word(c.urgent)} urgent`);
  if (c.for_you) parts.push(`${word(c.for_you)} for you`);
  return `${parts.join(', ')}.`;
}

const WHAT = [
  ['Daily Briefing', 'An item waiting for an approval (marked “For you” when it is yours to give). Urgent if no edition has been built by 08:00 WAT.'],
  ['Corrections', 'Every open request. Due within three hours says so; past its deadline is urgent.'],
  ['Politicians', 'One note while any page is held for review.'],
  ['Platform', 'No new story for 90 minutes (urgent after four hours); no finished worker run for 70 minutes (urgent after three hours); new code not live 30 minutes after it reached main; a sitemap with no URLs; the AI provider refusing requests (urgent); a check that keeps failing. Platform notifications go to super admins and tech.'],
];

function Settings({ notes }) {
  const prefs = useDeskData('/api/admin/notifications/prefs');
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  const setEmail = async on => {
    setBusy('email');
    try {
      await deskFetch('/api/admin/notifications/prefs', { method: 'PUT', body: { email_urgent: on } });
      await prefs.reload();
      setNotice({ text: on ? 'Urgent notifications will be emailed to you.' : 'No notification will be emailed to you.' });
    } catch (err) {
      setNotice({ text: err.message, error: true });
    } finally {
      setBusy(null);
    }
  };
  const setBrowser = async on => {
    setBusy('browser');
    const problem = await notes.setBrowserAlerts(on);
    setBusy(null);
    setNotice(problem ? { text: problem, error: true } : { text: on ? 'Browser alerts are on for this computer.' : 'Browser alerts are off for this computer.' });
  };

  return (
    <>
      <Section title="On this computer">
        <div className="pref">
          <div>
            <p className="pref-t">Browser alerts</p>
            <p className="pref-s">While the Desk is open in a tab you are not looking at, a new or escalated to-do or urgent
              notification shows a system alert. Applies to this browser only.</p>
          </div>
          {browserAlertsSupported() ? (
            <button type="button" className={`btn btn-sm ${notes.browserAlerts ? 'btn-secondary' : 'btn-primary'}`}
                    disabled={busy === 'browser'} onClick={() => setBrowser(!notes.browserAlerts)}>
              {notes.browserAlerts ? 'Turn off' : 'Turn on'}
            </button>
          ) : <span className="t-meta">This browser does not support alerts.</span>}
        </div>
      </Section>
      <Section title="Email">
        <Stateful state={prefs} rows={2}>
          {prefs.data && (
            <div className="pref">
              <div>
                <p className="pref-t">Email me urgent notifications {prefs.data.email_urgent ? '· on' : '· off'}</p>
                <p className="pref-s">Urgent only: a correction past its deadline, no Briefing edition by 08:00, a silent feed or
                  worker, the AI provider refusing requests. At most one email per problem every six hours, to
                  {prefs.data.email ? ` ${prefs.data.email}` : ' the address you sign in with'}. Everything else stays on the Desk.</p>
              </div>
              <button type="button" className={`btn btn-sm ${prefs.data.email_urgent ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={busy === 'email'} onClick={() => setEmail(!prefs.data.email_urgent)}>
                {busy === 'email' ? 'Saving…' : prefs.data.email_urgent ? 'Turn off' : 'Turn on'}
              </button>
            </div>
          )}
        </Stateful>
      </Section>
      <Section title="What raises a notification">
        <dl className="kv">
          {WHAT.map(([k, v]) => <FragmentKV key={k} k={k} v={v} />)}
        </dl>
        <p className="t-meta">Each is checked every five minutes, and straight after any action on the Desk. A problem that lasts is
          one notification, updated in place; it clears itself when the problem stops.</p>
      </Section>
      <Notice notice={notice} onDone={() => setNotice(null)} />
    </>
  );
}

function FragmentKV({ k, v }) {
  return <><dt>{k}</dt><dd>{v}</dd></>;
}

function OpenList({ notes, open, setOpen, onClear, busy }) {
  if (notes.error && !notes.items) return <Failure message={notes.error} onRetry={notes.reload} />;
  if (!notes.items) return <Loading rows={5} />;
  if (!notes.items.length) return <Empty>Nothing needs attention. New work and platform problems appear here as they happen.</Empty>;
  const groups = [
    { title: 'For you', items: notes.items.filter(n => n.for_you) },
    { title: 'Needs attention', items: notes.items.filter(n => !n.for_you && n.severity !== 'info') },
    { title: 'For information', items: notes.items.filter(n => !n.for_you && n.severity === 'info') },
  ].filter(g => g.items.length);
  const row = n => (
    <NotificationRow key={n.id} n={n} open={open === n.id} busy={busy === n.id}
                     onToggle={() => { setOpen(open === n.id ? null : n.id); if (!n.read) notes.markRead([n.id]); }}
                     onRead={x => notes.markRead([x.id])} onClear={onClear} />
  );
  return (
    <>
      {notes.error && <Failure message={notes.error} onRetry={notes.reload} />}
      {groups.map(g => <Section key={g.title} title={g.title} count={g.items.length}>{g.items.map(row)}</Section>)}
    </>
  );
}

export default function AdminNotifications() {
  const { notes } = useDesk();
  const [tab, setTab] = useState('open');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);
  const resolved = useDeskData(tab === 'resolved' ? '/api/admin/notifications?state=resolved' : null);
  const c = notes.counts;

  const clear = async n => {
    setBusy(n.id);
    try {
      await deskFetch(`/api/admin/notifications/${n.id}/clear`, { method: 'POST', body: {} });
      await notes.reload();
      setOpen(null);
      setNotice({ text: `Cleared: ${n.title}` });
    } catch (err) {
      setNotice({ text: err.message, error: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Page
      dateline="Desk · Notifications"
      lede={lede(c)}
      byline="Work waiting in the queue and problems on the platform. Each clears itself once the work is done or the problem stops; open one to see its history."
      actions={tab === 'open' && c?.unread > 0
        ? <button type="button" className="btn btn-secondary btn-sm" onClick={() => notes.markRead('all')}>Mark all read</button>
        : null}
    >
      <Tabs value={tab} onChange={t => { setTab(t); setOpen(null); }} tabs={[
        { value: 'open', label: 'Open', count: c?.open },
        { value: 'resolved', label: 'Cleared, last 7 days' },
        { value: 'settings', label: 'Settings' },
      ]} />
      {tab === 'open' && <OpenList notes={notes} open={open} setOpen={setOpen} onClear={clear} busy={busy} />}
      {tab === 'resolved' && (
        <Section title="Cleared">
          <Stateful state={resolved} isEmpty={!resolved.data?.items?.length} empty="Nothing has cleared in the last seven days.">
            {(resolved.data?.items || []).map(n => (
              <NotificationRow key={n.id} n={n} open={open === n.id} onToggle={() => setOpen(open === n.id ? null : n.id)} />
            ))}
          </Stateful>
        </Section>
      )}
      {tab === 'settings' && <Settings notes={notes} />}
      <Notice notice={notice} onDone={() => setNotice(null)} />
    </Page>
  );
}
