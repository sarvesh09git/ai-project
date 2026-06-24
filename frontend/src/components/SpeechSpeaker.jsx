import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SpeechSpeaker({ text, language = 'en', className = '' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState(null);

  // Localization mappings for speech synthesis languages
  const langMap = {
    en: 'en-US',
    hi: 'hi-IN',
    mr: 'mr-IN'
  };

  useEffect(() => {
    if (window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    
    // Stop speaking if text changes or component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text]);

  const speakText = () => {
    if (!synth) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    // Clean text of markdown syntax like asterisks or hashtags before reading
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove markdown links, keeping text
      .replace(/📍|📞|🚗|🩺|🚨/g, ''); // remove emojis

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langMap[language] || 'en-US';
    
    // Attempt to locate a natural sounding local voice
    const voices = synth.getVoices();
    const matchingVoice = voices.find(voice => 
      voice.lang.includes(langMap[language]) || 
      voice.lang.startsWith(language)
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis failure:", e);
      setIsPlaying(false);
    };

    setIsPlaying(true);
    synth.speak(utterance);
  };

  return (
    <button
      onClick={speakText}
      className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
        isPlaying
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
      } ${className}`}
      title={isPlaying ? "Stop reading" : "Read guidance aloud"}
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-4 w-4 text-amber-700" />
          <span className="text-xs font-semibold">Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 text-emerald-700" />
          <span className="text-xs font-semibold">Listen</span>
        </>
      )}
    </button>
  );
}
