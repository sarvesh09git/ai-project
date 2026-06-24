import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, HelpCircle, Sun, Moon } from 'lucide-react';

export default function ElderlyControls() {
  const { largeFontMode, toggleLargeFontMode, darkMode, toggleDarkMode, language } = useAuth();

  const text = {
    en: {
      enableLarge: "Make Text Bigger (Elderly Care)",
      disableLarge: "Reset Text Size",
      help: "Voice Assistance Active",
      lightTheme: "Light Mode",
      darkTheme: "Dark Mode"
    },
    hi: {
      enableLarge: "अक्षर बड़े करें (बुजुर्गों के लिए)",
      disableLarge: "अक्षर सामान्य करें",
      help: "आवाज सहायता सक्रिय है",
      lightTheme: "लाइट मोड",
      darkTheme: "डार्क मोड"
    },
    mr: {
      enableLarge: "अक्षरे मोठी करा (ज्येष्ठांसाठी)",
      disableLarge: "अक्षरे सामान्य करा",
      help: "आवाज सहाय्य सुरू आहे",
      lightTheme: "लाइट मोड",
      darkTheme: "डार्क मोड"
    }
  }[language] || text.en;

  const handleHelpAlert = () => {
    const speakText = {
      en: "Voice guidance is enabled. You can click on any microphone button to speak, or click on the speaker buttons to listen to translations.",
      hi: "आवाज सहायता चालू है। आप बोलने के लिए माइक बटन पर क्लिक कर सकते हैं, और अनुवाद सुनने के लिए स्पीकर बटन दबाएं।",
      mr: "आवाज सहाय्य सुरू आहे. बोलण्यासाठी तुम्ही माईक बटणावर क्लिक करू शकता, आणि अनुवाद ऐकण्यासाठी स्पीकर बटण दाबू शकता."
    }[language] || speakText.en;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(speakText);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2 shadow-lg rounded-2xl bg-white/95 backdrop-blur-xs p-3 border border-slate-200">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
        👵 Elderly Help
      </div>

      {/* Large Fonts Toggle */}
      <button
        onClick={toggleLargeFontMode}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs border cursor-pointer ${
          largeFontMode
            ? 'bg-amber-100 text-amber-800 border-amber-300'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
        }`}
        title={largeFontMode ? text.disableLarge : text.enableLarge}
      >
        <Eye className="h-4 w-4" />
        <span>{largeFontMode ? text.disableLarge : text.enableLarge}</span>
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold transition text-xs border cursor-pointer ${
          darkMode
            ? 'bg-slate-700 hover:bg-slate-650 text-white border-transparent'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
        }`}
        title={darkMode ? text.lightTheme : text.darkTheme}
      >
        {darkMode ? <Sun className="h-4 w-4 text-amber-450" /> : <Moon className="h-4 w-4 text-slate-600" />}
        <span>{darkMode ? text.lightTheme : text.darkTheme}</span>
      </button>

      {/* Voice Guide Assistant trigger */}
      <button
        onClick={handleHelpAlert}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl font-bold transition text-xs cursor-pointer"
        title="Spoken user help guide"
      >
        <HelpCircle className="h-4 w-4 text-sky-600" />
        <span>How to use this app?</span>
      </button>
    </div>
  );
}
