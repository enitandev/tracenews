import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Registry from "./pages/Registry";
import Story from "./pages/Story";
import Layout from "./components/Layout";
import Category from "./pages/Category";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

function HomepagePlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Montserrat', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
      Homepage coming soon
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<HomepagePlaceholder />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/story/:slug" element={<Story />} />
            {/* New static routes */}
            <Route path="/outlets" element={<HomepagePlaceholder />} />
            <Route path="/outlets/:outletSlug" element={<HomepagePlaceholder />} />
            <Route path="/topics" element={<HomepagePlaceholder />} />
            <Route path="/topics/:topicSlug" element={<Category />} />
            <Route path="/methodology" element={<HomepagePlaceholder />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
