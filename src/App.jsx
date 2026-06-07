import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Registry from "./pages/Registry";
import "./App.css";

function HomepagePlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Montserrat', fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>
      Homepage coming soon
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<HomepagePlaceholder />} />
        <Route path="/registry" element={<Registry />} />
      </Routes>
    </BrowserRouter>
  );
}
