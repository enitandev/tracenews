with open('src/pages/Methodology.jsx', 'r') as f:
    c = f.read()

anchor_block = """            <a key={id}
              href={`#${id}`}
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.target.style.color = '#E67E22'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >"""

new_anchor_block = """            <a key={id}
              href={`#${id}`}
              style={{
                color: 'var(--text-secondary, #888)',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.target.style.color = '#E67E22'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary, #888)'}
            >"""

c = c.replace(anchor_block, new_anchor_block)

with open('src/pages/Methodology.jsx', 'w') as f:
    f.write(c)
