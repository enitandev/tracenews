import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Home from "./pages/Home";
import Registry from "./pages/Registry";
import Story from "./pages/Story";
import Layout from "./components/Layout";
import MinimalLayout from "./components/MinimalLayout";
import AdminShell from "./admin/AdminShell";
import Category from "./pages/Category";
import DailyBriefingStory from "./pages/DailyBriefingStory";
import Methodology from "./pages/Methodology";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";
import OutletProfile from './pages/OutletProfile'
import Corrections from './pages/Corrections';
import About from './pages/About';
import TestVerdict from './pages/TestVerdict';
import PoliticianProfile from './pages/PoliticianProfile'
import AdminCorrections from './admin/AdminCorrections';
import MonitoringSpiritAdmin from './admin/MonitoringSpiritAdmin';
import AdminPoliticians from './admin/AdminPoliticians';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Reset from './pages/Reset';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';

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
        <Routes>
          {/* Auth routes with Minimal Layout */}
          <Route path="/login" element={<MinimalLayout><Login /></MinimalLayout>} />
          <Route path="/signup" element={<MinimalLayout><Signup /></MinimalLayout>} />
          <Route path="/reset" element={<MinimalLayout><Reset /></MinimalLayout>} />
          <Route path="/verify" element={<MinimalLayout><Verify /></MinimalLayout>} />

          {/* Routes with standard Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/test-verdict" element={<TestVerdict />} />
                <Route path="/home" element={<HomepagePlaceholder />} />
                <Route path="/registry" element={<Registry />} />
                <Route path="/story/:slug" element={<Story />} />
                <Route path="/daily-briefing" element={<DailyBriefingRedirect />} />
                <Route path="/daily-briefing/:slug" element={<DailyBriefingStory />} />
                <Route path="/outlets" element={<HomepagePlaceholder />} />
                <Route path="/outlets/:slug" element={<OutletProfile />} />
                <Route path="/politicians/:slug" element={<PoliticianProfile />} />
                <Route path="/topics" element={<HomepagePlaceholder />} />
                <Route path="/topics/:topicSlug" element={<Category />} />
                <Route path="/methodology" element={<Methodology />} />
                <Route path="/corrections" element={<Corrections />} />
                <Route path="/about" element={<About />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
              </Routes>
            </Layout>
          } />

          {/* Admin routes with AdminShell layout */}
          <Route path="/admin/*" element={
            <AdminShell>
              <Routes>
                <Route path="corrections" element={<AdminCorrections />} />
                <Route path="monitoring-spirit" element={<MonitoringSpiritAdmin />} />
                <Route path="politicians" element={<AdminPoliticians />} />
              </Routes>
            </AdminShell>
          } />
          
          {/* Dashboard route (standalone layout) */}
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
