import os

# --- CoverageBar.jsx ---
with open("src/components/CoverageBar.jsx", "r") as f:
    cov_content = f.read()

cov_content = cov_content.replace(
    "const TIER_ABBREVS = { 'pro_establishment': 'P-E', 'institutional': 'I', 'adversarial': 'A' };",
    "const TIER_FULL_LABELS = { 'pro_establishment': 'Pro-Establishment', 'institutional': 'Institutional', 'adversarial': 'Adversarial' };"
)

cov_content = cov_content.replace(
    "{TIER_ABBREVS[tier]} {Math.round(percentage)}%",
    "{TIER_FULL_LABELS[tier]} {Math.round(percentage)}%"
)

with open("src/components/CoverageBar.jsx", "w") as f:
    f.write(cov_content)


# --- CategoryBiasBar.jsx ---
with open("src/components/CategoryBiasBar.jsx", "r") as f:
    bias_content = f.read()

bias_content = bias_content.replace(
    "{TIER_ABBREVS[tier]} {Math.round(percentage)}%",
    "{TIER_FULL_NAMES[tier]} {Math.round(percentage)}%"
)

with open("src/components/CategoryBiasBar.jsx", "w") as f:
    f.write(bias_content)

