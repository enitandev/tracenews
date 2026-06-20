import os

# --- FIX 1 & 2: CoverageBar.jsx ---
with open("src/components/CoverageBar.jsx", "r") as f:
    cov_content = f.read()

# Fix Tooltips
cov_content = cov_content.replace(
    "background: 'var(--text-primary)',\n                    color: 'var(--bg-primary)',",
    "background: 'var(--text-primary)',\n                    color: 'var(--bg-surface)',\n                    border: '1px solid var(--border)',"
)
cov_content = cov_content.replace(
    "borderColor: 'var(--text-primary) transparent transparent transparent'",
    "borderColor: 'var(--text-primary) transparent transparent transparent'"
) # Already var(--text-primary)

# Fix Hero text display
cov_old_map = """            const percentage = (count / total) * 100;
            const labelText = `${TIER_LABELS[tier]} ${Math.round(percentage)}%`;
            const isLast = index === displayedTiers.length - 1;"""

cov_new_map = """            const percentage = (count / total) * 100;
            const labelText = `${TIER_LABELS[tier]} ${Math.round(percentage)}%`;
            const isLast = index === displayedTiers.length - 1;
            const showAbbrev = percentage >= 15;
            const TIER_ABBREVS = { 'pro_establishment': 'P-E', 'institutional': 'I', 'adversarial': 'A' };"""

cov_content = cov_content.replace(cov_old_map, cov_new_map)

cov_old_segment = """                {hoveredTier === tier && ("""

cov_new_segment = """                {showAbbrev && (
                  <span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, pointerEvents: 'none' }}>
                    {TIER_ABBREVS[tier]} {Math.round(percentage)}%
                  </span>
                )}
                {hoveredTier === tier && ("""

cov_content = cov_content.replace(cov_old_segment, cov_new_segment)

with open("src/components/CoverageBar.jsx", "w") as f:
    f.write(cov_content)

# --- FIX 2 & 3: CategoryBiasBar.jsx ---
with open("src/components/CategoryBiasBar.jsx", "r") as f:
    bias_content = f.read()

bias_content = bias_content.replace(
    "background: 'var(--text-primary)',\n            color: 'var(--bg-primary)',",
    "background: 'var(--text-primary)',\n            color: 'var(--bg-surface)',\n            border: '1px solid var(--border)',"
)
bias_content = bias_content.replace(
    "const showAbbrev = percentage >= 12;",
    "const showAbbrev = percentage >= 15;"
)

with open("src/components/CategoryBiasBar.jsx", "w") as f:
    f.write(bias_content)

# --- FIX 4 & 5: Category.jsx ---
with open("src/pages/Category.jsx", "r") as f:
    cat_content = f.read()

# Fix Covered Most By tier names
cat_old_tier = "const tierLabel = outlet.tier === 'pro_establishment' ? 'Pro-Est.' : outlet.tier === 'institutional' ? 'Inst.' : outlet.tier === 'adversarial' ? 'Adversarial' : 'Unscored';"
cat_new_tier = "const tierLabel = outlet.tier === 'pro_establishment' ? 'Pro-Establishment' : outlet.tier === 'institutional' ? 'Institutional' : outlet.tier === 'adversarial' ? 'Adversarial' : 'Unscored';"
cat_content = cat_content.replace(cat_old_tier, cat_new_tier)

# Fix Column widths
cat_content = cat_content.replace(
    "<div style={{ flex: '1 1 0%', minWidth: 0 }}>",
    "<div style={{ width: '65%', flexShrink: 0, minWidth: 0 }}>"
)
cat_content = cat_content.replace(
    "<div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>",
    "<div style={{ width: '35%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>"
)

with open("src/pages/Category.jsx", "w") as f:
    f.write(cat_content)

