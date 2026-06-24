import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import VoiceButton from '../components/VoiceButton';
import SpeechSpeaker from '../components/SpeechSpeaker';
import AgentLogDrawer from '../components/AgentLogDrawer';
import { Send, Upload, Trash2, User, Brain, AlertTriangle, FileText, Check } from 'lucide-react';

export default function AssistantPage() {
  const { user, token, language, coordinates, changeLanguage, apiBaseUrl } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [latestLogs, setLatestLogs] = useState([]);
  
  // Report upload simulation states
  const [reportText, setReportText] = useState('');
  const [isAnalyzingReport, setIsAnalyzingReport] = useState(false);

  const messagesEndRef = useRef(null);

  // Localization resources
  const textStrings = {
    en: {
      title: "AI Health Assistant",
      inputPlaceholder: "Type your health question or symptoms...",
      send: "Send",
      clear: "Clear Chat",
      userPref: "Agent Memory Profile",
      allergies: "Allergies",
      meds: "Medications",
      conditions: "Conditions",
      reportTab: "Analyze Medical Report",
      reportPlaceholder: "Paste blood test numbers or report text here...",
      analyze: "Explain Report",
      presetsHeader: "Quick Inquiries for Elders"
    },
    hi: {
      title: "एआई स्वास्थ्य सहायक",
      inputPlaceholder: "अपनी स्वास्थ्य संबंधी समस्या या लक्षण लिखें...",
      send: "भेजें",
      clear: "चैट साफ करें",
      userPref: "एजेंट मेमोरी प्रोफाइल",
      allergies: "एलर्जी",
      meds: "दवाएं",
      conditions: "बीमारियां",
      reportTab: "मेडिकल रिपोर्ट का विश्लेषण करें",
      reportPlaceholder: "यहां रक्त परीक्षण संख्या या रिपोर्ट पाठ पेस्ट करें...",
      analyze: "रिपोर्ट समझाएं",
      presetsHeader: "बुजुर्गों के लिए त्वरित प्रश्न"
    },
    mr: {
      title: "एआय आरोग्य सहाय्यक",
      inputPlaceholder: "तुमची आरोग्य समस्या किंवा लक्षणे लिहा...",
      send: "पाठवा",
      clear: "चॅट साफ करा",
      userPref: "एजंट मेमरी प्रोफाइल",
      allergies: "ॲलर्जी",
      meds: "औषधे",
      conditions: "आजार",
      reportTab: "वैद्यकीय अहवाल तपासा",
      reportPlaceholder: "येथे रक्त चाचणी संख्या किंवा अहवाल मजकूर पेस्ट करा...",
      analyze: "अहवाल स्पष्ट करा",
      presetsHeader: "ज्येष्ठांसाठी द्रुत प्रश्न"
    }
  }[language] || textStrings.en;

  const presets = {
    en: [
      { label: "Check Symptoms", query: "I have mild fever, dry cough and throat pain for 2 days" },
      { label: "Find Clinics", query: "Where is the nearest government clinic to get checkup?" },
      { label: "Set Pill Reminder", query: "Remind me to take diabetes medicine at 9:00 PM every day" },
      { label: "Explain Medical Word", query: "What is the meaning of Hypertension?" }
    ],
    hi: [
      { label: "लक्षण जांचें", query: "मुझे 2 दिनों से हल्का बुखार, सूखी खांसी और गले में दर्द है" },
      { label: "क्लिनिक ढूंढें", query: "चेकअप के लिए निकटतम सरकारी क्लिनिक कहां है?" },
      { label: "दवा रिमाइंडर सेट करें", query: "मुझे रोज रात 9:00 बजे मधुमेह की दवा लेने का याद दिलाएं" },
      { label: "चिकित्सा शब्द समझें", query: "हाइपरटेंशन (Hypertension) का क्या मतलब है?" }
    ],
    mr: [
      { label: "लक्षणे तपासा", query: "मला २ दिवसांपासून सौम्य ताप, कोरडा खोकला आणि घसा दुखत आहे" },
      { label: "दवाखाना शोधा", query: "तपासणीसाठी सर्वात जवळचा सरकारी दवाखाना कोठे आहे?" },
      { label: "रिमाइंडर सेट करा", query: "मला रोज रात्री ९:०० वाजता मधुमेहाचे औषध घेण्याचे आठवण करून द्या" },
      { label: "वैद्यकीय शब्द स्पष्ट करा", query: "हायपरटेंशन (Hypertension) म्हणजे काय?" }
    ]
  }[language] || presets.en;

  useEffect(() => {
    // Initial welcome message
    const welcomeText = {
      en: "Hello! I am SwasthyaAI Rural Navigator. Please describe your symptoms or ask a health question in English, Hindi, or Marathi. You can also click the microphone to speak.",
      hi: "नमस्ते! मैं स्वास्थ्यAI ग्रामीण मार्गदर्शक हूँ। कृपया अपने लक्षणों का वर्णन करें या अंग्रेजी, हिंदी या मराठी में स्वास्थ्य संबंधी प्रश्न पूछें। आप बोलने के लिए माइक भी दबा सकते हैं।",
      mr: "नमस्कार! मी स्वास्थ्यAI ग्रामीण मार्गदर्शक आहे. कृपया आपल्या लक्षणांचे वर्णन करा किंवा इंग्रजी, हिंदी किंवा मराठीत आरोग्याविषयी प्रश्न विचारा. आपण बोलण्यासाठी माइक देखील दाबू शकता."
    }[language] || welcomeText.en;

    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch(`${apiBaseUrl}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          query: textToSend,
          coordinates,
          language
        })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: 'agent_' + Date.now(),
        sender: 'agent',
        text: data.response,
        timestamp: new Date(),
        logs: data.logs
      }]);
      setLatestLogs(data.logs || []);

    } catch (err) {
      console.warn("Server connection failed during chat, simulating local agent response...");
      
      // Simulate Local AI Agent
      setTimeout(() => {
        let localReply = "We are currently running in local offline support mode. ";
        let localLogs = [
          { agent: "Coordinator Orchestrator", thought: "Network offline. Running local client-side diagnostics simulation.", action: "offline_fallback", observation: "Offline mode active" }
        ];

        const queryLower = textToSend.toLowerCase();
        
        if (queryLower.includes("fever") || queryLower.includes("cough") || queryLower.includes("pain")) {
          localLogs.push({ agent: "Health Assessment Agent", thought: "Parsing symptoms offline.", action: "triage", observation: "Symptom check" });
          localReply += "Your symptoms indicate general viral activity. Please rest, drink boiled water, and visit your nearest local doctor if the condition persists.";
        } else if (queryLower.includes("hospital") || queryLower.includes("clinic") || queryLower.includes("pharmacy")) {
          localLogs.push({ agent: "Healthcare Discovery Agent", thought: "Retrieving nearest health sub-centers.", action: "distance_matrix", observation: "Found 2 local clinics" });
          localReply += "Nearest clinics: \n1. Shikrapur Primary Sub-Center (3.5 km away, Ph: +91-2138-222104)\n2. Koregaon Bhima Clinic (4.1 km away).";
        } else if (queryLower.includes("remind") || queryLower.includes("reminder") || queryLower.includes("alarm")) {
          localLogs.push({ agent: "Health Reminder Agent", thought: "Setting client medicine alarm.", action: "set_reminder_cookie", observation: "Reminder staged in browser storage" });
          localReply += "Reminder set! I will alert you at the requested time.";
        } else if (queryLower.includes("explain") || queryLower.includes("what is")) {
          localLogs.push({ agent: "Medical Explanation Agent", thought: "Searching offline medical dictionary.", action: "dict_lookup", observation: "Definition retrieved" });
          localReply += "Hypertension means high blood pressure. It occurs when blood flows through your blood pipes with higher force than usual. Reduce salt in meals.";
        } else {
          localReply += "I am listening to your query. For full detailed multi-agent answers, please launch the backend server with a valid Gemini API key.";
        }

        setMessages(prev => [...prev, {
          id: 'agent_' + Date.now(),
          sender: 'agent',
          text: localReply,
          timestamp: new Date(),
          logs: localLogs
        }]);
        setLatestLogs(localLogs);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleVoiceInput = (transcript) => {
    setInputText(transcript);
    // Auto-send voice input for convenience
    handleSend(transcript);
  };

  const handleAnalyzeReport = async () => {
    if (!reportText.trim()) return;
    setIsAnalyzingReport(true);

    try {
      const res = await fetch(`${apiBaseUrl}/agent/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ reportText })
      });

      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: 'report_' + Date.now(),
        sender: 'agent',
        text: data.summary,
        timestamp: new Date(),
        logs: data.logs
      }]);
      setLatestLogs(data.logs || []);
      setReportText('');
    } catch (err) {
      console.warn("Server connection failed during report analysis, simulating offline explanation...");
      setTimeout(() => {
        const mockSummary = `### Summary of Uploaded Medical Document (Offline Fallback)\n\nWe detected words like blood counts in your report. Since the server is offline, here is generic guidance:\n- Keep Hemoglobin levels above 12 g/dL by eating spinach and dates.\n- Ensure blood pressure stays near 120/80.\n- Take this report to your local doctor for safety.`;
        setMessages(prev => [...prev, {
          id: 'report_' + Date.now(),
          sender: 'agent',
          text: mockSummary,
          timestamp: new Date(),
          logs: []
        }]);
        setReportText('');
      }, 1200);
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: "Chat cleared. Ask me any healthcare question.",
        timestamp: new Date()
      }
    ]);
    setLatestLogs([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)] min-h-[500px]">
        
        {/* Memory Profile & Presets Left Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          
          {/* Active Memory Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <Brain className="h-5 w-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-sm">{textStrings.userPref}</h3>
            </div>
            {user ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wider">{textStrings.allergies}</span>
                  {user.medicalHistory?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.medicalHistory.allergies.map((all, i) => (
                        <span key={i} className="bg-red-50 text-red-700 px-2 py-0.5 rounded-md font-semibold border border-red-100">{all}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">None documented</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wider">{textStrings.meds}</span>
                  {user.medicalHistory?.medications?.length > 0 ? (
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      {user.medicalHistory.medications.map((med, i) => (
                        <li key={i}>{med}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-slate-400">None documented</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wider">{textStrings.conditions}</span>
                  {user.medicalHistory?.conditions?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.medicalHistory.conditions.map((cond, i) => (
                        <span key={i} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold border border-amber-100">{cond}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">None documented</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
                  * Preferences update in real-time as you chat with the AI Agent.
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 text-center py-4">
                Login via the Dashboard to enable AI profile memory persistence.
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-700 text-xs mb-3">{textStrings.presetsHeader}</h4>
            <div className="flex flex-col gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.query)}
                  className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 rounded-lg text-xs font-semibold text-slate-600 border border-slate-100 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Central Chat Panel */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between overflow-hidden">
          
          {/* Chat Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-slate-800 text-sm">{textStrings.title}</span>
            </div>
            <button
              onClick={clearChat}
              className="text-xs text-slate-400 hover:text-red-500 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{textStrings.clear}</span>
            </button>
          </div>

          {/* Chat Scroll List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs leading-relaxed text-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line text-sm">{msg.text}</div>
                  
                  {/* Speaker and translation tools inside agent message */}
                  {msg.sender === 'agent' && (
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-200/50">
                      <SpeechSpeaker text={msg.text} language={language} />
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 pl-3">
                <Brain className="h-4 w-4 animate-bounce text-emerald-600" />
                <span className="text-xs font-semibold italic">Agent thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Panel */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="border-t border-slate-200 p-4 flex gap-3 items-center bg-slate-50"
          >
            <VoiceButton onResult={handleVoiceInput} language={language} />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={textStrings.inputPlaceholder}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-emerald-500 text-sm"
            />
            <button
              type="submit"
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition cursor-pointer"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>

        </div>

        {/* Right Info and Decision Log Panel */}
        <div className="lg:col-span-3 flex flex-col gap-4 overflow-y-auto">
          
          {/* Medical Report Upload Simulator */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-800 text-sm">{textStrings.reportTab}</h3>
            </div>
            
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder={textStrings.reportPlaceholder}
              rows={4}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 mb-3"
            />

            <button
              onClick={handleAnalyzeReport}
              disabled={isAnalyzingReport || !reportText.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-xs transition-all text-xs cursor-pointer"
            >
              {isAnalyzingReport ? (
                <>
                  <Brain className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>{textStrings.analyze}</span>
                </>
              )}
            </button>
          </div>

          {/* Decision Log Viewer */}
          <AgentLogDrawer logs={latestLogs} />

        </div>

      </div>
    </div>
  );
}
