import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Home from "./pages/Home";
import Registry from "./pages/Registry";
import Story from "./pages/Story";
import Layout from "./components/Layout";
import Category from "./pages/Category";
import DailyBriefingStory from "./pages/DailyBriefingStory";
import Methodology from "./pages/Methodology";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
import OutletProfile from './pages/OutletProfile'
import Corrections from './pages/Corrections'
import About from './pages/About'
import PoliticianProfile from './pages/PoliticianProfile'

function HomepagePlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Montserrat', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>

      Homepage coming soon
    </div>
  );
}

function DailyBriefingRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    fetch('https://uvicorn-appmain-production-79c6.up.railway.app/daily-briefing')
      .then(r => r.json())
      .then(d => {
        if (d.stories && d.stories[0]) {
          navigate(
            `/daily-briefing/${d.stories[0].cluster_slug}`,
            { replace: true }
          )
        } else {
          // No briefing available
          navigate('/', { replace: true })
        }
      })
      .catch(() => navigate('/'))
  }, [])
  return (
    <div style={{ 
      padding: '60px', 
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-body)'
    }}>
      Loading Daily Briefing...
    </div>
  )
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
            <Route path="/daily-briefing" element={<DailyBriefingRedirect />} />
            <Route path="/daily-briefing/:slug" element={<DailyBriefingStory />} />
            {/* New static routes */}
            <Route path="/outlets" element={<HomepagePlaceholder />} />
            <Route path="/outlets/:slug" element={<OutletProfile />} />
            <Route path="/politicians/:slug" element={<PoliticianProfile />} />
            <Route path="/topics" element={<HomepagePlaceholder />} />
            <Route path="/topics/:topicSlug" element={<Category />} />
            <Route path="/methodology" element={<Methodology />} />
            <Route path="/corrections" element={<Corrections />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
