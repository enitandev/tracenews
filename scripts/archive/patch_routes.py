import os

# --- Patch App.jsx ---
with open("src/App.jsx", "r") as f:
    app_content = f.read()

imports = """import Category from "./pages/Category";
import DailyBriefing from "./pages/DailyBriefing";
import DailyBriefingStory from "./pages/DailyBriefingStory";"""
app_content = app_content.replace('import Category from "./pages/Category";', imports)

routes = """            <Route path="/registry" element={<Registry />} />
            <Route path="/story/:slug" element={<Story />} />
            <Route path="/daily-briefing" element={<DailyBriefing />} />
            <Route path="/daily-briefing/:slug" element={<DailyBriefingStory />} />"""
app_content = app_content.replace('            <Route path="/registry" element={<Registry />} />\n            <Route path="/story/:slug" element={<Story />} />', routes)

with open("src/App.jsx", "w") as f:
    f.write(app_content)

# --- Patch Header.jsx ---
with open("src/components/Header.jsx", "r") as f:
    header_content = f.read()

nav_item = """              <a href="#" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Local</a>
              <Link to="/daily-briefing" style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>Daily Briefing</Link>"""
header_content = header_content.replace('              <a href="#" style={{ color: \'var(--text-primary)\', textDecoration: \'none\' }}>Local</a>', nav_item)

with open("src/components/Header.jsx", "w") as f:
    f.write(header_content)

