import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, PhoneCall, Languages, ShieldAlert, Eye, LogOut, Menu, X, User, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout, language, changeLanguage, largeFontMode, toggleLargeFontMode, darkMode, toggleDarkMode } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Localization labels for navbar
  const allLabels = {
    en: {
      assistant: "AI Assistant",
      symptoms: "Symptom Check",
      finder: "Health Finder",
      dashboard: "Dashboard",
      emergency: "Emergency SOS",
      login: "Login / Register",
      logout: "Log Out"
    },
    hi: {
      assistant: "एआई सहायक",
      symptoms: "लक्षण जांच",
      finder: "स्वास्थ्य खोजें",
      dashboard: "डैशबोर्ड",
      emergency: "आपातकालीन SOS",
      login: "लॉगिन / पंजीकरण",
      logout: "लॉग आउट"
    },
    mr: {
      assistant: "एआय सहाय्यक",
      symptoms: "लक्षण तपासणी",
      finder: "आरोग्य केंद्र",
      dashboard: "डॅशबोर्ड",
      emergency: "आणीबाणी SOS",
      login: "लॉगिन / नोंदणी",
      logout: "लॉग आउट"
    }
  };

  const labels = allLabels[language] || allLabels.en;

  const isActive = (path) => location.pathname === path;

  const navClass = (path) => `
    flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm
    ${isActive(path) 
      ? 'bg-white/15 text-white font-semibold border-b-2 border-white' 
      : 'text-emerald-100 hover:text-white hover:bg-white/10'
    }
  `;

  return (
    <nav className="sticky top-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-b border-emerald-800/40 z-50 shadow-sm text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-white p-2 rounded-xl text-emerald-700 group-hover:bg-slate-100 transition">
              <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Swasthya<span className="text-emerald-300 font-extrabold">AI</span></span>
              <span className="block text-[10px] text-emerald-200/80 font-medium">Rural Health Navigator</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/chat" className={navClass('/chat')}>{labels.assistant}</Link>
            <Link to="/symptoms" className={navClass('/symptoms')}>{labels.symptoms}</Link>
            <Link to="/finder" className={navClass('/finder')}>{labels.finder}</Link>
            <Link to="/dashboard" className={navClass('/dashboard')}>{labels.dashboard}</Link>
          </div>

          {/* Action Tools & Languages */}
          <div className="hidden lg:flex items-center gap-4">
            
            {/* Accessibility Toggle */}
            <button 
              onClick={toggleLargeFontMode}
              className={`p-2 rounded-lg border text-white transition hover:bg-white/10 flex items-center gap-1.5 cursor-pointer
                ${largeFontMode ? 'bg-amber-600/30 text-amber-200 border-amber-500' : 'border-white/20'}`}
              title="Toggle Large Fonts & Buttons for Elderly Users"
            >
              <Eye className="h-4 w-4" />
              <span className="text-xs font-semibold">अ / A</span>
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-white/20 text-white transition hover:bg-white/10 flex items-center justify-center cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-white" />}
            </button>

            {/* Language Selector */}
            <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/15">
              <button 
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded cursor-pointer transition ${language === 'en' ? 'bg-white/15 text-white shadow-xs' : 'text-emerald-100/70 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('hi')}
                className={`px-2 py-1 text-xs font-bold rounded cursor-pointer transition ${language === 'hi' ? 'bg-white/15 text-white shadow-xs' : 'text-emerald-100/70 hover:text-white'}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => changeLanguage('mr')}
                className={`px-2 py-1 text-xs font-bold rounded cursor-pointer transition ${language === 'mr' ? 'bg-white/15 text-white shadow-xs' : 'text-emerald-100/70 hover:text-white'}`}
              >
                मराठी
              </button>
            </div>

            {/* Emergency SOS Button */}
            <Link 
              to="/emergency"
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-sm transition-all text-sm animate-pulse-sos cursor-pointer"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>{labels.emergency}</span>
            </Link>

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-white/20">
                <Link to="/dashboard" className="flex items-center gap-1 text-white hover:text-emerald-300 font-medium text-sm">
                  <User className="h-4 w-4 text-emerald-300" />
                  <span>{user.name.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-emerald-200/60 hover:text-red-400 transition cursor-pointer"
                  title={labels.logout}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/dashboard" 
                className="text-sm font-semibold text-white pl-2 border-l border-white/20 flex items-center gap-1 hover:text-emerald-300"
              >
                <User className="h-4 w-4" />
                <span>{labels.login}</span>
              </Link>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg border border-white/20 text-white cursor-pointer hover:bg-white/10"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-white" />}
            </button>
            <button
              onClick={toggleLargeFontMode}
              className={`p-1.5 rounded-lg border text-white cursor-pointer hover:bg-white/10 ${largeFontMode ? 'bg-amber-600/30 text-amber-200 border-amber-500' : 'border-white/20'}`}
            >
              <Eye className="h-4 w-4" />
            </button>
            <Link to="/emergency" className="p-1.5 bg-red-600 text-white rounded-lg animate-pulse-sos">
              <ShieldAlert className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-emerald-100 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#092d1f] border-b border-emerald-850 px-4 pt-2 pb-4 space-y-2">
          <Link 
            to="/chat" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md font-medium text-emerald-100 hover:bg-white/10 ${isActive('/chat') ? 'text-white bg-white/15' : ''}`}
          >
            {labels.assistant}
          </Link>
          <Link 
            to="/symptoms" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md font-medium text-emerald-100 hover:bg-white/10 ${isActive('/symptoms') ? 'text-white bg-white/15' : ''}`}
          >
            {labels.symptoms}
          </Link>
          <Link 
            to="/finder" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md font-medium text-emerald-100 hover:bg-white/10 ${isActive('/finder') ? 'text-white bg-white/15' : ''}`}
          >
            {labels.finder}
          </Link>
          <Link 
            to="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-md font-medium text-emerald-100 hover:bg-white/10 ${isActive('/dashboard') ? 'text-white bg-white/15' : ''}`}
          >
            {labels.dashboard}
          </Link>
          <div className="pt-2 border-t border-emerald-800/40 flex justify-between items-center">
            <span className="text-xs font-semibold text-emerald-200/60">Language:</span>
            <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
              <button 
                onClick={() => { changeLanguage('en'); setMobileMenuOpen(false); }}
                className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${language === 'en' ? 'bg-white/15 text-white shadow-xs' : 'text-emerald-200/70 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => { changeLanguage('hi'); setMobileMenuOpen(false); }}
                className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${language === 'hi' ? 'bg-white/15 text-white shadow-xs' : 'text-emerald-200/70 hover:text-white'}`}
              >
                हिन्दी
              </button>
              <button 
                onClick={() => { changeLanguage('mr'); setMobileMenuOpen(false); }}
                className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${language === 'mr' ? 'bg-white/15 text-white shadow-xs' : 'text-emerald-200/70 hover:text-white'}`}
              >
                मराठी
              </button>
            </div>
          </div>
          {user ? (
            <div className="pt-2 border-t border-emerald-800/40 flex items-center justify-between">
              <span className="text-sm font-semibold text-emerald-100">Logged in as {user.name}</span>
              <button 
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-red-400 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span>{labels.logout}</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-[#0b3c29] text-white px-4 py-2 rounded-lg font-bold"
            >
              {labels.login}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
