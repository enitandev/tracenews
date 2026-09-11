import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import OutletProfile from './pages/OutletProfile'\n"
# Find last import
last_import_pos = content.rfind("import ")
end_of_last_import = content.find("\n", last_import_pos) + 1
content = content[:end_of_last_import] + import_stmt + content[end_of_last_import:]

# Replace route
content = content.replace(
    '<Route path="/outlets/:outletSlug" element={<HomepagePlaceholder />} />',
    '<Route path="/outlets/:slug" element={<OutletProfile />} />'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)
