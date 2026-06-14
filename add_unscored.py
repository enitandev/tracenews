import re

for filename in ["src/pages/Home.jsx", "src/pages/Story.jsx"]:
    with open(filename, "r") as f:
        content = f.read()

    old_colors = """const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B'
};"""
    new_colors = """const COVERAGE_TIER_COLORS = {
  'pro_establishment': '#2980B9',
  'institutional': '#E67E22',
  'adversarial': '#C0392B',
  'unscored': '#999999'
};"""
    
    content = content.replace(old_colors, new_colors)
    with open(filename, "w") as f:
        f.write(content)

