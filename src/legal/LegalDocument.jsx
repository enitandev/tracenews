import React from 'react';
import { Helmet } from 'react-helmet-async';
import { parseBlocks } from './parseBlocks';

/**
 * Renders counsel's legal text (src/legal/*.md) as published. The text is
 * never edited here: a new version is a new .md file with a higher version
 * number. Supports the Markdown the documents use: # and ## headings,
 * paragraphs, "- " lists, pipe tables and **bold**. Email addresses become
 * mailto links.
 */
const EMAIL = /([\w.+-]+@tracenews\.ng)/g;

function inline(text, keyBase) {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, i) => {
    const bold = part.startsWith('**') && part.endsWith('**');
    const body = bold ? part.slice(2, -2) : part;
    const pieces = body.split(EMAIL).map((p, j) =>
      /^[\w.+-]+@tracenews\.ng$/.test(p)
        ? <a key={`${keyBase}-${i}-${j}`} href={`mailto:${p}`} style={{ color: 'inherit' }}>{p}</a>
        : p);
    return bold ? [<strong key={`${keyBase}-${i}`}>{pieces}</strong>] : pieces;
  });
}

const cell = { border: '1px solid var(--border)', padding: '8px 10px', verticalAlign: 'top', textAlign: 'left' };

export default function LegalDocument({ source, title, description, path }) {
  const blocks = parseBlocks(source);
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px', fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
      <Helmet>
        <title>{`${title} | TraceNews`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`https://tracenews.ng${path}`} />
      </Helmet>
      {blocks.map((b, k) => {
        if (b.type === 'h1') return <h1 key={k} style={{ fontFamily: 'Spectral, Georgia, serif', fontSize: '34px', fontWeight: 600, margin: '0 0 12px' }}>{b.text}</h1>;
        if (b.type === 'h2') return <h2 key={k} style={{ fontSize: '19px', fontWeight: 700, margin: '36px 0 12px' }}>{b.text}</h2>;
        if (b.type === 'ul') {
          return (
            <ul key={k} style={{ paddingLeft: '20px', margin: '0 0 16px', lineHeight: 1.7, fontSize: '15px', color: 'var(--text-secondary)' }}>
              {b.items.map((it, j) => <li key={j} style={{ marginBottom: '6px' }}>{inline(it, `${k}-${j}`)}</li>)}
            </ul>
          );
        }
        if (b.type === 'table') {
          return (
            <div key={k} style={{ overflowX: 'auto', margin: '0 0 20px' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '13.5px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
                <thead><tr>{b.head.map((h, j) => <th key={j} style={{ ...cell, background: 'var(--bg-hover)', color: 'var(--text-primary)' }}>{inline(h, `${k}-h${j}`)}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, m) => <td key={m} style={cell}>{inline(c, `${k}-${j}-${m}`)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }
        return (
          <p key={k} style={{ fontSize: '15px', lineHeight: 1.7, margin: '0 0 16px', color: 'var(--text-secondary)' }}>
            {b.lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{inline(l, `${k}-${j}`)}</React.Fragment>)}
          </p>
        );
      })}
    </div>
  );
}
