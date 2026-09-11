import re

with open('src/pages/Methodology.jsx', 'r') as f:
    content = f.read()

# CORRECTION 1: Fix grids
# Monitoring spirit is under section 04, Special Cases under 05
# They currently have: "gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'"
# We only want to change the 2nd and 3rd occurrence of it, or just use regex.

# We will just replace ALL occurrences of 'repeat(3, 1fr)', gap: '16px' with a placeholder,
# then restore the first one, and change the rest to 'repeat(2, 1fr)', gap: '24px'.
parts = content.split("gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'")
if len(parts) == 4:
    # First split is before the Signal cards grid
    content = parts[0] + "gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'" + \
              parts[1] + "gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px'" + \
              parts[2] + "gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px'" + \
              parts[3]

# CORRECTION 2: Revert card containers and update example blocks

# Card container pattern:
# <div style={{ border: '0.5px solid var(--border)', borderTop: '3px solid #0F6E56', borderRadius: '8px', padding: '24px', background: 'rgba(15,110,86,0.06)' }}>
def fix_card(content, s_num, card_border, card_bg, ex_color, ex_bg, text_color):
    # Revert outer container
    container_pattern = r'<div style=\{\{\s*border: \'0\.5px solid var\(--border\)\', borderTop: \'3px solid ' + card_border + r'\', borderRadius: \'8px\', padding: \'24px\', background: \'' + card_bg.replace('(', r'\(').replace(')', r'\)') + r'\' \}\}>'
    new_container = r'<div style={{ border: \'0.5px solid var(--border)\', borderRadius: \'8px\', padding: \'24px\', background: \'var(--bg-elevated, transparent)\' }}>'
    content = re.sub(container_pattern, new_container, content)

    # Example block is AFTER the h3 and p tags inside the card
    # Let's find the card's specific example block. We know they occur in order S1 to S6.
    # To be safe, we find the section containing the S# label and the example block.
    # A better way is to split the content by "S1", "S2" etc.
    # But an easy way is just to regex replace the example block that comes right after S_num.
    
    # We will search for S_num block and the NEXT example block.
    # Since we only have one example block per card, we can capture from S_num to the example block.
    
    pattern = (r'(<span style=\{\{.*?>' + s_num + r'</span>.*?)'
               r'(<div style=\{\{\s*borderLeft: \'2px solid )#E67E22(\',\s*padding: \'8px 12px\',\s*marginTop: \'\d+px\',\s*background: \')rgba\(230,126,34,0\.06\)(\',\s*borderRadius: \'0 4px 4px 0\' \}\}>\s*)'
               r'(<span style=\{\{.*?)color: \'#E67E22\'(.*?>example</span>)')
    
    repl = (r'\1'
            r'\2' + ex_color + r'\3' + ex_bg + r'\4'
            r'\5color: \'' + text_color + r'\'\6')
    
    content = re.sub(pattern, repl, content, flags=re.DOTALL)
    return content

content = fix_card(content, 'S1', '#0F6E56', 'rgba(15,110,86,0.06)', '#0F6E56', 'rgba(15,110,86,0.06)', '#0F6E56')
content = fix_card(content, 'S2', '#1D9E75', 'rgba(29,158,117,0.06)', '#1D9E75', 'rgba(29,158,117,0.06)', '#1D9E75')
content = fix_card(content, 'S3', '#5DCAA5', 'rgba(93,202,165,0.06)', '#5DCAA5', 'rgba(93,202,165,0.06)', '#5DCAA5')
content = fix_card(content, 'S4', '#9FE1CB', 'rgba(159,225,203,0.06)', '#9FE1CB', 'rgba(159,225,203,0.06)', '#9FE1CB')
content = fix_card(content, 'S5', '#C7EDE0', 'rgba(199,237,224,0.06)', '#C7EDE0', 'rgba(199,237,224,0.06)', '#C7EDE0')
content = fix_card(content, 'S6', '#E1F5EE', 'rgba(225,245,238,0.04)', '#E1F5EE', 'rgba(225,245,238,0.04)', '#9FE1CB')

with open('src/pages/Methodology.jsx', 'w') as f:
    f.write(content)
