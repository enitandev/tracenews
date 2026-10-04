import { useCallback, useEffect, useRef, useState } from 'react';
import { deskFetch } from './api';

/**
 * The signed-in editor's open notifications (tracenews-api
 * app/routers/notifications.py), kept fresh while the Desk is open: every
 * POLL_MS while the tab is visible, at once when the tab comes back, and after
 * any action. Shared through DeskContext so the bell, the rail and the inbox
 * agree.
 *
 * Browser alerts are a per-browser choice (stored in this browser only): when
 * on, a notification that newly appears or escalates while the Desk is open
 * shows a system alert. Nothing fires for what was already there on load.
 */
const POLL_MS = 60000;
const BROWSER_KEY = 'desk.browser-alerts';

function stored(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function store(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* private window: the choice lasts this visit */ }
}

export function browserAlertsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export default function useNotifications(enabled) {
  const [state, setState] = useState({ items: null, counts: null, error: null });
  const [browserAlerts, setBrowserAlertsState] = useState(() => stored(BROWSER_KEY) === 'on'
    && browserAlertsSupported() && window.Notification.permission === 'granted');
  const seen = useRef(null);   // id -> severity already shown, null until the first load

  const announce = useCallback(items => {
    const before = seen.current;
    seen.current = new Map(items.map(i => [i.id, `${i.severity}:${i.escalated_at || ''}`]));
    if (!before || !browserAlerts || document.visibilityState === 'visible') return;
    const fresh = items.filter(i => !i.read && i.severity !== 'info'
      && before.get(i.id) !== `${i.severity}:${i.escalated_at || ''}`);
    for (const i of fresh.slice(0, 3)) {
      try {
        const alert = new window.Notification(i.title, { body: i.body || '', tag: i.id });
        alert.onclick = () => { window.focus(); if (i.link) window.location.assign(i.link); };
      } catch (err) {
        console.error('Browser alert failed:', err);
      }
    }
  }, [browserAlerts]);

  const load = useCallback(async () => {
    try {
      const data = await deskFetch('/api/admin/notifications');
      announce(data.items);
      setState({ items: data.items, counts: data.counts, error: null });
      return data;
    } catch (err) {
      setState(s => ({ ...s, error: err.message }));
      return null;
    }
  }, [announce]);

  useEffect(() => {
    if (!enabled) return undefined;
    Promise.resolve().then(load);
    const timer = setInterval(() => { if (document.visibilityState === 'visible') load(); }, POLL_MS);
    const onShow = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onShow);
    window.addEventListener('focus', onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onShow);
      window.removeEventListener('focus', onShow);
    };
  }, [enabled, load]);

  const markRead = useCallback(async ids => {
    const all = ids === 'all';
    if (!all && !ids.length) return;
    // Show it read at once; the server copy follows.
    setState(s => {
      if (!s.items) return s;
      const items = s.items.map(i => (all || ids.includes(i.id) ? { ...i, read: true } : i));
      const unread = items.filter(i => !i.read);
      return { ...s, items, counts: { ...s.counts, unread: unread.length,
        urgent: unread.filter(i => i.severity === 'urgent').length, for_you: unread.filter(i => i.for_you).length } };
    });
    try {
      await deskFetch('/api/admin/notifications/read', { method: 'POST', body: all ? { all: true } : { ids } });
    } catch (err) {
      console.error('Marking notifications read failed:', err);
    }
    await load();
  }, [load]);

  const setBrowserAlerts = useCallback(async on => {
    if (on && browserAlertsSupported() && window.Notification.permission !== 'granted') {
      const result = await window.Notification.requestPermission();
      if (result !== 'granted') {
        store(BROWSER_KEY, 'off');
        setBrowserAlertsState(false);
        return 'This browser has blocked alerts for tracenews.ng. Allow them in the site settings, then try again.';
      }
    }
    store(BROWSER_KEY, on ? 'on' : 'off');
    setBrowserAlertsState(on);
    return null;
  }, []);

  return { ...state, reload: load, markRead, browserAlerts, setBrowserAlerts };
}
