import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

export default function VoiceButton({ onResult, language = 'en', className = '' }) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Localization mappings for native speech recognition locales
  const localeMap = {
    en: 'en-US',
    hi: 'hi-IN',
    mr: 'mr-IN'
  };

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recObj = new SpeechRecognition();
      recObj.continuous = false;
      recObj.interimResults = false;
      
      recObj.onstart = () => {
        setIsListening(true);
      };
      
      recObj.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult && transcript) {
          onResult(transcript);
        }
        setIsListening(false);
      };
      
      recObj.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
      
      recObj.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recObj);
    }
  }, [language, onResult]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.lang = localeMap[language] || 'en-US';
      try {
        recognition.start();
      } catch (err) {
        console.warn("Speech recognition already running:", err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`relative p-3 rounded-full flex items-center justify-center transition-all cursor-pointer ${
        isListening
          ? 'bg-red-600 text-white animate-pulse-sos voice-wave'
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      } ${className}`}
      title={isListening ? "Listening... click to stop" : "Speak to write (English / हिन्दी / मराठी)"}
    >
      {isListening ? (
        <>
          <MicOff className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  );
}
