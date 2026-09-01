import re

with open('src/pages/Methodology.jsx', 'r') as f:
    content = f.read()

# Fix 1 & 7
styles_eyebrow = """    eyebrow: {
      fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
      fontSize: '12px',
      letterSpacing: '.18em',
      textTransform: 'uppercase',
      color: '#E67E22',
      margin: '0 0 10px 0',
      paddingTop: '8px',
      display: 'block',
      opacity: 1
    },
    h2: {
      fontFamily: "'Spectral', Georgia, serif",
      fontSize: '28px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '4px 0 18px 0',
      lineHeight: 1.2
    },
    h2Visual: {
      fontFamily: "'Spectral', Georgia, serif",
      fontSize: '28px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: '4px 0 18px 0',
      lineHeight: 1.2
    },"""
content = re.sub(
    r'    eyebrow: \{.*?h2Visual: \{.*?lineHeight: 1\.2\n    \},',
    styles_eyebrow,
    content,
    flags=re.DOTALL
)

# Fix 2:
content = re.sub(
    r'\.tn-legend\{display:grid;grid-template-columns:repeat\(auto-fit,minmax\(160px,1fr\)\);gap:2px 18px;\}',
    '.tn-legend{display:grid;grid-template-columns:repeat(3,1fr);gap:2px 18px;}',
    content
)

# Fix 4:
content = content.replace(".tn-meth{max-width:740px;}", ".tn-meth{max-width:100%;}")
content = content.replace("max-width:740px", "max-width:100%")

# Fix 5:
old_notable = r'var TN_NOTABLE=\{.*?\};'
new_notable = """var TN_NOTABLE={
    "NTA":1,
    "Punch Nigeria":1,
    "The Cable":1,
    "FIJ Nigeria":1,
    "Sahara Reporters":1
  };"""
content = re.sub(old_notable, new_notable, content, flags=re.DOTALL)

old_label = r"lab\.style\.bottom='46px';"
new_label = """var labelHeights = {
        "NTA": '46px',
        "Punch Nigeria": '62px',
        "The Cable": '46px',
        "FIJ Nigeria": '62px',
        "Sahara Reporters": '46px'
      };
      lab.style.bottom = labelHeights[name] || '46px';"""
content = re.sub(old_label, new_label, content)

# Fix 3: Cards
content = content.replace(
    "gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px'",
    "gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'"
)

def replace_card(s_num, border_color, bg_color, label_color):
    global content
    pattern = r'<div style=\{\{\s*border: \'0\.5px solid var\(--border\)\',\s*borderRadius: \'8px\',\s*padding: \'24px\',\s*background: \'var\(--bg-base\)\'\s*\}\}>\s*<div>\s*<span style=\{\{\s*fontFamily: "\'IBM Plex Mono\', ui-monospace, monospace",\s*fontSize: \'12px\',\s*fontWeight: 500,\s*color: \'var\(--text-primary\)\'\s*\}\}>' + s_num + r'</span>'
    repl = f'<div style={{{{ border: \'0.5px solid var(--border)\', borderTop: \'3px solid {border_color}\', borderRadius: \'8px\', padding: \'24px\', background: \'{bg_color}\' }}}}>\n            <div>\n              <span style={{{{ fontFamily: "\'IBM Plex Mono\', ui-monospace, monospace", fontSize: \'12px\', fontWeight: 500, color: \'{label_color}\' }}}}>{s_num}</span>'
    content = re.sub(pattern, repl, content)

replace_card('S1', '#0F6E56', 'rgba(15,110,86,0.06)', '#0F6E56')
replace_card('S2', '#1D9E75', 'rgba(29,158,117,0.06)', '#0F6E56')
replace_card('S3', '#5DCAA5', 'rgba(93,202,165,0.06)', '#1D9E75')
replace_card('S4', '#9FE1CB', 'rgba(159,225,203,0.06)', '#1D9E75')
replace_card('S5', '#C7EDE0', 'rgba(199,237,224,0.06)', '#5DCAA5')
replace_card('S6', '#E1F5EE', 'rgba(225,245,238,0.04)', '#5DCAA5')

with open('src/pages/Methodology.jsx', 'w') as f:
    f.write(content)
