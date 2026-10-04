import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ago, stamp } from './api';
import { Row } from './Kit';

/**
 * Notification pieces shared by the bell and the inbox. A notification is a
 * condition on the platform or in the queue; it resolves itself when the
 * condition clears (tracenews-api app/notifications.py).
 */
const SEVERITY = { urgent: 'Urgent', action: 'To do', info: 'Note' };
const TONE = { urgent: 'new', action: 'ok', info: 'neutral' };
const PLACE = { '/admin/corrections': 'Corrections', '/admin/briefing': 'Daily Briefing',
  '/admin/politicians': 'Politicians', '/admin/monitoring-spirit': 'Monitoring Spirit', '/admin': 'Overview' };

function placeOf(link) {
  return PLACE[link] || 'the Desk';
}

/** One notification as a ruled row; opening it shows its history and what to do. */
export function NotificationRow({ n, open, onToggle, onRead, onClear, busy }) {
  const resolved = !!n.resolved_at;
  const meta = [
    n.for_you && !resolved ? 'For you' : null,
    n.body,
  ].filter(Boolean).join(' · ');
  return (
    <Row className={!n.read ? 'nt-unread' : ''} open={open} onToggle={onToggle}
         tone={resolved ? 'neutral' : TONE[n.severity]} mark={resolved ? 'Cleared' : SEVERITY[n.severity]}
         title={n.title} meta={meta} age={ago(resolved ? n.resolved_at : n.last_seen_at)}>
      <dl className="kv">
        <dt>First noticed</dt><dd>{stamp(n.first_seen_at)}</dd>
        {n.last_seen_at !== n.first_seen_at && <><dt>Last changed</dt><dd>{stamp(n.last_seen_at)}</dd></>}
        {n.occurrences > 1 && <><dt>Happened</dt><dd>{n.occurrences} times</dd></>}
        {n.escalated_at && <><dt>Escalated</dt><dd>{stamp(n.escalated_at)}</dd></>}
        {resolved && <><dt>Cleared</dt><dd>{stamp(n.resolved_at)} · {n.resolved_by === 'system'
          ? 'the problem cleared or the work was done' : `by ${(n.resolved_by || '').split(' (')[0]}`}</dd></>}
      </dl>
      <div className="act">
        {n.link && <Link to={n.link} className="btn btn-sm btn-primary" style={{ textDecoration: 'none' }}
                         onClick={() => !n.read && onRead?.(n)}>Go to {placeOf(n.link)}</Link>}
        {!n.read && onRead && <button type="button" className="btn btn-sm btn-secondary" onClick={() => onRead(n)}>Mark read</button>}
        {!resolved && n.meta?.event && onClear && (
          <button type="button" className="btn btn-sm btn-secondary" disabled={busy} onClick={() => onClear(n)}>
            {busy ? 'Clearing…' : 'Clear — it has been dealt with'}
          </button>
        )}
      </div>
      {!resolved && !n.meta?.event && (
        <p className="t-meta" style={{ marginTop: 'var(--s3)' }}>This clears itself once the work is done or the problem stops.</p>
      )}
    </Row>
  );
}

/** The bell in the masthead: the count, and the latest few in a panel. */
export function Bell({ notes }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const c = notes.counts || {};

  useEffect(() => {
    if (!open) return undefined;
    const away = e => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const items = (notes.items || []).slice(0, 6);
  const label = c.unread ? `${c.unread} unread${c.urgent ? `, ${c.urgent} urgent` : ''}` : 'nothing unread';
  return (
    <div className="bell-wrap" ref={box}>
      <button type="button" className={`bell ${c.urgent ? 'urgent' : c.unread ? 'unread' : ''}`}
              aria-haspopup="dialog" aria-expanded={open} aria-label={`Notifications, ${label}`}
              onClick={() => { setOpen(o => !o); if (!open) notes.reload(); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <span>Notifications</span>
        {c.unread > 0 && <span className="bell-n">{c.unread}</span>}
      </button>
      {open && (
        <div className="bell-panel" role="dialog" aria-label="Notifications">
          <div className="bell-h">
            <span>{c.unread ? label.charAt(0).toUpperCase() + label.slice(1) : 'All read'}</span>
            {c.unread > 0 && <button type="button" onClick={() => notes.markRead('all')}>Mark all read</button>}
          </div>
          {notes.error && !notes.items && <p className="desk-empty">Notifications could not be loaded: {notes.error}</p>}
          {notes.items && items.length === 0 && <p className="desk-empty">Nothing needs attention. New work and platform problems appear here.</p>}
          {items.map(n => (
            <Link key={n.id} to={n.link || ROUTES.ADMIN_NOTIFICATIONS} className={`bell-it ${n.read ? '' : 'nt-unread'}`}
                  onClick={() => { setOpen(false); if (!n.read) notes.markRead([n.id]); }}>
              <span className={`mk mk-${n.severity === 'urgent' ? 'new' : n.severity === 'action' ? 'ok' : 'nu'}`}>{SEVERITY[n.severity]}</span>
              <span className="bd">
                <span className="tt">{n.title}</span>
                {(n.for_you || n.body) && <span className="mt">{[n.for_you ? 'For you' : null, n.body].filter(Boolean).join(' · ')}</span>}
              </span>
              <span className="ag">{ago(n.last_seen_at)}</span>
            </Link>
          ))}
          <Link to={ROUTES.ADMIN_NOTIFICATIONS} className="bell-all" onClick={() => setOpen(false)}>
            {(notes.items || []).length > items.length ? `All ${notes.items.length} open notifications` : 'All notifications and settings'} →
          </Link>
        </div>
      )}
    </div>
  );
}
