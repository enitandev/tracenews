import re

for filename in ["src/pages/Home.jsx", "src/pages/Story.jsx"]:
    with open(filename, "r") as f:
        content = f.read()

    # 1. COVERAGE_TIER_COLORS
    old_colors = """const COVERAGE_TIER_COLORS = {
  'independent': '#C0392B',
  'deferential': '#E67E22',
  'captured': '#2980B9'
};"""
    new_colors = """const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B'
};"""
    content = content.replace(old_colors, new_colors)

    # 2. TIER_LABELS
    old_labels = """const TIER_LABELS = {
  'independent': 'Adversarial',
  'deferential': 'Institutional',
  'captured': 'Pro-Establishment',
  'unscored': 'Unscored'
};"""
    new_labels = """const TIER_LABELS = {
  'pro_establishment': 'Pro-Establishment',
  'institutional': 'Institutional',
  'adversarial': 'Adversarial',
  'unscored': 'Unscored'
};"""
    content = content.replace(old_labels, new_labels)

    # 3. arrays of tiers
    content = content.replace("['independent', 'deferential', 'captured']", "['adversarial', 'institutional', 'pro_establishment']")
    
    # 4. Fallback in getDominantTier logic
    content = content.replace("if (dominant === 'unscored') dominant = 'independent';", "if (dominant === 'unscored') dominant = 'adversarial';")

    # 5. Story.jsx specific
    if "Story.jsx" in filename:
        old_spans = """          <span style={{ color: COVERAGE_TIER_COLORS['independent'] }}>{TIER_LABELS['independent']}: {Math.round(((dist['independent']||0)/totalScored)*100)}%</span>
          <span style={{ color: COVERAGE_TIER_COLORS['deferential'] }}>{TIER_LABELS['deferential']}: {Math.round(((dist['deferential']||0)/totalScored)*100)}%</span>
          <span style={{ color: COVERAGE_TIER_COLORS['captured'] }}>{TIER_LABELS['captured']}: {Math.round(((dist['captured']||0)/totalScored)*100)}%</span>"""
        
        new_spans = """          <span style={{ color: COVERAGE_TIER_COLORS['adversarial'] }}>{TIER_LABELS['adversarial']}: {Math.round(((dist['adversarial']||0)/totalScored)*100)}%</span>
          <span style={{ color: COVERAGE_TIER_COLORS['institutional'] }}>{TIER_LABELS['institutional']}: {Math.round(((dist['institutional']||0)/totalScored)*100)}%</span>
          <span style={{ color: COVERAGE_TIER_COLORS['pro_establishment'] }}>{TIER_LABELS['pro_establishment']}: {Math.round(((dist['pro_establishment']||0)/totalScored)*100)}%</span>"""
        content = content.replace(old_spans, new_spans)

    with open(filename, "w") as f:
        f.write(content)

