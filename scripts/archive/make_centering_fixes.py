import os

# --- CoverageBar.jsx ---
with open("src/components/CoverageBar.jsx", "r") as f:
    cov_content = f.read()

# Add textAlign: 'center' to span
cov_content = cov_content.replace(
    "<span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, pointerEvents: 'none' }}>",
    "<span style={{ color: '#ffffff', fontSize: '11px', fontWeight: 700, pointerEvents: 'none', textAlign: 'center' }}>"
)

with open("src/components/CoverageBar.jsx", "w") as f:
    f.write(cov_content)

# --- CategoryBiasBar.jsx ---
with open("src/components/CategoryBiasBar.jsx", "r") as f:
    bias_content = f.read()

# Add textAlign: 'center' to span
bias_content = bias_content.replace(
    "<span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>",
    "<span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, textAlign: 'center', pointerEvents: 'none' }}>"
)

with open("src/components/CategoryBiasBar.jsx", "w") as f:
    f.write(bias_content)

# --- Category.jsx ---
with open("src/pages/Category.jsx", "r") as f:
    cat_content = f.read()

# Fix Column widths
cat_content = cat_content.replace(
    "<div style={{ width: '65%', flexShrink: 0, minWidth: 0 }}>",
    "<div style={{ width: 'calc(65% - 24px)', flexShrink: 0, minWidth: 0 }}>"
)
cat_content = cat_content.replace(
    "<div style={{ width: '35%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>",
    "<div style={{ width: 'calc(35% - 24px)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>"
)

with open("src/pages/Category.jsx", "w") as f:
    f.write(cat_content)

