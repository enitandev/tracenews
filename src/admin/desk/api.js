import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export const API_BASE = import.meta.env.VITE_API_URL || 'https://uvicorn-appmain-production-79c6.up.railway.app';

/**
 * Call a staff endpoint with the signed-in session. Throws an Error whose
 * message is the API's own explanation (its "detail"), so screens can show
 * why something failed instead of a generic message.
 */
export async function deskFetch(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Your session has ended. Sign in again.');
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${session.access_token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = typeof json.detail === 'string' ? json.detail
      : Array.isArray(json.detail) ? json.detail.map(d => d.msg).join('; ') : `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return json;
}

/**
 * Load a staff endpoint. `data` keeps the last good result while a reload
 * runs, so a refresh never blanks the screen; `error` is the latest failure.
 * A null path loads nothing.
 */
export function useDeskData(path) {
  const [state, setState] = useState({ loading: !!path, data: null, error: null, path });
  const load = useCallback(async () => {
    if (!path) return null;   // nothing to load yet (e.g. a tab not open)
    setState(s => ({ ...s, loading: true }));
    try {
      const data = await deskFetch(path);
      setState({ loading: false, data, error: null, path });
      return data;
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }));
      return null;
    }
  }, [path]);
  useEffect(() => { Promise.resolve().then(load); }, [load]);
  const fresh = state.path === path;
  return { data: fresh ? state.data : null, loading: state.loading || !fresh, error: fresh ? state.error : null, reload: load };
}

export function ago(iso) {
  if (!iso) return '';
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export function stamp(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/** Numbers under ten as words, as in running text ("two", "no"); larger ones as digits. */
export function word(n, capital = false) {
  const w = n < WORDS.length ? WORDS[n] : String(n);
  return capital ? w.charAt(0).toUpperCase() + w.slice(1) : w;
}

export function plural(n, one, many) {
  return `${word(n, true)} ${n === 1 ? one : many}`;
}

/** How a correction's subject reads to an editor. */
export const SUBJECT = { cluster_summary: 'Story summary', outlet: 'Outlet', politician: 'Politician page', page: 'Page', briefing: 'Daily Briefing' };
