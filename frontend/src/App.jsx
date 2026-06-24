import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ElderlyControls from './components/ElderlyControls';

// Pages
import LandingPage from './pages/LandingPage';
import AssistantPage from './pages/AssistantPage';
import SymptomPage from './pages/SymptomPage';
import FinderPage from './pages/FinderPage';
import DashboardPage from './pages/DashboardPage';
import EmergencyPage from './pages/EmergencyPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 pb-24">
        {/* Navigation Bar */}
        <Navbar />
        
        {/* Route Pages Container */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<AssistantPage />} />
            <Route path="/symptoms" element={<SymptomPage />} />
            <Route path="/finder" element={<FinderPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Floating Accessibility Support Widget */}
        <ElderlyControls />
      </div>
    </Router>
  );
}

export default App;
