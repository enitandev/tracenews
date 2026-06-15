import re

with open("src/pages/Home.jsx", "r") as f:
    content = f.read()

# Remove local constants
consts_to_remove = ["REGION_COLORS", "SEVERITY_COLORS", "COVERAGE_TIER_COLORS", "TIER_LABELS"]
for c in consts_to_remove:
    # Match const NAME = { ... };
    pattern = r"const " + c + r" = \{[^\}]+\};\n+"
    content = re.sub(pattern, "", content)

# Remove local component definitions
components_to_remove = ["MonitoringAlertCard", "HeroStoryCard", "StandardStoryItem", "CompactStoryItem"]
for c in components_to_remove:
    # Match function NAME({ cluster }) { ... } until the next function or component
    # We will just do a somewhat naive extraction:
    # find function NAME
    # and remove up to `\n}` before the next `function `
    pass # Wait, doing this via regex is risky.

