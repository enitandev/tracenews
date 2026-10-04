/** Splits counsel's Markdown into blocks: h1, h2, ul, table, p. */
export function parseBlocks(md) {
  const lines = md.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    if (line.startsWith('# ')) { blocks.push({ type: 'h1', text: line.slice(2) }); i += 1; continue; }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3) }); i += 1; continue; }
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!cells.every(c => /^-+$/.test(c))) rows.push(cells);
        i += 1;
      }
      blocks.push({ type: 'table', head: rows[0], rows: rows.slice(1) });
      continue;
    }
    if (line.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) { items.push(lines[i].slice(2)); i += 1; }
      blocks.push({ type: 'ul', items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||- )/.test(lines[i])) { para.push(lines[i]); i += 1; }
    blocks.push({ type: 'p', lines: para });
  }
  return blocks;
}
