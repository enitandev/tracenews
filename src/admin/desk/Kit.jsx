import { useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * The Desk's building blocks, following docs/design-references/tracenews-the-desk.html:
 * a dateline and one sentence before any number, rule-separated unequal
 * figures (the one that needs you is amber), lists ruled not boxed, and a
 * standing column for the live pulse. Every screen uses these, so loading,
 * empty and error states look and behave the same everywhere.
 */

export function Page({ dateline, lede, byline, actions, children, standing }) {
  return (
    <>
      <div className="desk-col">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--s4)' }}>
          <p className="dateline">{dateline}</p>
          {actions && <div style={{ display: 'flex', gap: 'var(--s2)' }}>{actions}</div>}
        </div>
        {lede && <h1 className="lede">{lede}</h1>}
        {byline && <div className="byline">{byline}</div>}
        {children}
      </div>
      {standing && <aside className="stand">{standing}</aside>}
    </>
  );
}

export function Figures({ items }) {
  return (
    <div className="figs">
      {items.map(f => (
        <div className="fig" key={f.label}>
          <div className="l">{f.label}</div>
          <div className={`v ${f.attention ? 'att' : ''} ${f.small ? 'sm' : ''}`}>{f.value ?? '–'}</div>
          {f.note && <div className="s">{f.note}</div>}
        </div>
      ))}
    </div>
  );
}

export function Section({ title, link, count, children }) {
  return (
    <div className="ds">
      <div className="ds-h">
        <span className="t">{title}{count != null ? ` · ${count}` : ''}</span>
        <div className="ln" />
        {link && <Link to={link.to} className="lk">{link.label} →</Link>}
      </div>
      {children}
    </div>
  );
}

const TONE = { new: 'mk-new', dark: 'mk-dk', neutral: 'mk-nu', ok: 'mk-ok' };

/** One ruled row: a mark, a title, a line of detail, an age; optionally expands in place. */
export function Row({ mark, tone = 'neutral', title, meta, age, open, onToggle, to, children, className = '' }) {
  const head = (
    <>
      {mark && <span className={`mk ${TONE[tone] || TONE.neutral}`}>{mark}</span>}
      <div className="bd">
        <div className="tt">{title}</div>
        {meta && <div className="mt">{meta}</div>}
      </div>
      {age && <div className="ag">{age}</div>}
    </>
  );
  return (
    <div className={`row-wrap ${open ? 'open' : ''} ${className}`}>
      {to ? <Link to={to} className="it it-link">{head}</Link>
        : onToggle ? <button type="button" className="it it-btn" onClick={onToggle} aria-expanded={!!open}>{head}</button>
          : <div className="it">{head}</div>}
      {open && children && <div className="row-body">{children}</div>}
    </div>
  );
}

export function Loading({ rows = 4, label }) {
  return (
    <div aria-busy="true" className="desk-loading">
      {label && <p className="t-meta">{label}</p>}
      {Array.from({ length: rows }, (_, i) => <div key={i} className="desk-skel" style={{ width: `${92 - i * 9}%` }} />)}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="desk-empty">{children}</p>;
}

export function Failure({ message, onRetry }) {
  return (
    <div className="desk-fail" role="alert">
      <p className="t-label">This could not be loaded</p>
      <p className="t-meta">{message}</p>
      {onRetry && <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

/**
 * The usual body of a Desk list: loading on first load, the error with a
 * retry, an empty line, or the content. A reload keeps showing the last good
 * content (no flash back to skeletons).
 */
export function Stateful({ state, empty, isEmpty, children, rows }) {
  if (state.error && !state.data) return <Failure message={state.error} onRetry={state.reload} />;
  if (!state.data) return <Loading rows={rows} />;
  return (
    <>
      {state.error && <Failure message={state.error} onRetry={state.reload} />}
      {isEmpty ? <Empty>{empty}</Empty> : children}
    </>
  );
}

/** A short confirmation that disappears on its own, in place of browser alerts. */
export function Notice({ notice, onDone }) {
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [notice, onDone]);
  if (!notice) return null;
  return <div className={`desk-notice ${notice.error ? 'err' : ''}`} role="status">{notice.text}</div>;
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="desk-tabs" role="tablist">
      {tabs.map(t => (
        <button key={t.value} type="button" role="tab" aria-selected={value === t.value}
                className={value === t.value ? 'on' : ''} onClick={() => onChange(t.value)}>
          {t.label}{t.count != null && <span className="n">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
