with open("src/pages/Category.jsx", "r") as f:
    content = f.read()

# 1. Fix categoryName construction
content = content.replace(
    "const categoryName = topicSlug.charAt(0).toUpperCase() + topicSlug.slice(1).toLowerCase();",
    "const categoryName = topicSlug ? topicSlug.charAt(0).toUpperCase() + topicSlug.slice(1).toLowerCase() : '';"
)

# 2. Fix categoryName.charAt(0)
content = content.replace(
    "{categoryName.charAt(0)}",
    "{categoryName ? categoryName.charAt(0) : ''}"
)

# 3. Fix outlet.name.charAt(0)
content = content.replace(
    "{outlet.name.charAt(0)}",
    "{outlet.name ? outlet.name.charAt(0) : '?'}"
)

# 4. Fix CATEGORIES.filter(c => c !== categoryName).map
content = content.replace(
    "CATEGORIES.filter(c => c !== categoryName).map(topicCat => {",
    "CATEGORIES.filter(c => c && c !== categoryName).map(topicCat => {"
)

with open("src/pages/Category.jsx", "w") as f:
    f.write(content)

