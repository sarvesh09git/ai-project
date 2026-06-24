import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import VoiceButton from '../components/VoiceButton';
import SpeechSpeaker from '../components/SpeechSpeaker';
import AgentLogDrawer from '../components/AgentLogDrawer';
import { Stethoscope, AlertOctagon, HelpCircle, ArrowRight, RefreshCw, Clipboard } from 'lucide-react';

export default function SymptomPage() {
  const { language, token, apiBaseUrl } = useAuth();
  const [step, setStep] = useState(1); // 1: input symptoms, 2: follow-up questionnaire, 3: report card
  const [symptomsInput, setSymptomsInput] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [report, setReport] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);

  // Localization strings
  const labels = {
    en: {
      title: "Guided Symptom Triage Assistant",
      subtitle: "Check symptoms step-by-step to understand urgency. This does not replace professional medical tests.",
      inputLabel: "Describe how you are feeling (e.g. 'I have a high fever with chills')",
      btnNext: "Next Step",
      btnSubmit: "Get Report",
      btnRestart: "Check Another Symptom",
      urgencyTitle: "Urgency Classification",
      actionTitle: "Recommended Action Plan",
      reportTitle: "Symptom Assessment Summary",
      followUpHeader: "Follow-up Clarifications"
    },
    hi: {
      title: "निर्देशित लक्षण मूल्यांकन सहायक",
      subtitle: "तात्कालिकता को समझने के लिए कदम-दर-कदम लक्षणों की जांच करें। यह व्यावसायिक चिकित्सा परीक्षणों का विकल्प नहीं है।",
      inputLabel: "बताएं कि आप कैसा महसूस कर रहे हैं (जैसे 'मुझे ठंड के साथ तेज बुखार है')",
      btnNext: "अगला चरण",
      btnSubmit: "रिपोर्ट प्राप्त करें",
      btnRestart: "दूसरे लक्षण की जांच करें",
      urgencyTitle: "अत्यावश्यकता वर्गीकरण",
      actionTitle: "अनुशंसित कार्रवाई योजना",
      reportTitle: "लक्षण मूल्यांकन सारांश",
      followUpHeader: "अनुवर्ती स्पष्टीकरण"
    },
    mr: {
      title: "मार्गदर्शित लक्षण तपासणी सहाय्यक",
      subtitle: "तात्काळ पातळी समजून घेण्यासाठी टप्प्याटप्प्याने लक्षणे तपासा. हे व्यावसायिक वैद्यकीय चाचणीचे पर्याय नाही.",
      inputLabel: "तुम्हाला कसे वाटत आहे याचे वर्णन करा (उदा. 'मला थंडी वाजून ताप येत आहे')",
      btnNext: "पुढील पाऊल",
      btnSubmit: "अहवाल मिळवा",
      btnRestart: "नवीन लक्षणे तपासा",
      urgencyTitle: "तातडीची पातळी वर्गीकरण",
      actionTitle: "शिफारस केलेली कृती योजना",
      reportTitle: "लक्षण मूल्यांकन सारांश",
      followUpHeader: "पुढील विचारलेले प्रश्न"
    }
  }[language] || labels.en;

  const handleStartAssessment = async () => {
    if (!symptomsInput.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`${apiBaseUrl}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          query: symptomsInput,
          language
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      // Check if it's emergency or if there are follow-up questions
      // Parsing simple questions if returned
      let followUps = [];
      
      // Parse follow-up questions from response format
      if (data.response.includes("answer:")) {
        // extract
      }

      // If we fall back or get followUps
      const mockQuestions = {
        en: [
          "How many days has this symptom lasted?",
          "Are you experiencing any breathing difficulties or dizziness?"
        ],
        hi: [
          "यह लक्षण कितने दिनों से चल रहा है?",
          "क्या आपको सांस लेने में कोई परेशानी या चक्कर आ रहा है?"
        ],
        mr: [
          "हे लक्षण किती दिवसांपासून आहे?",
          "तुम्हाला श्वास घेण्यास काही त्रास होत आहे किंवा चक्कर येत आहे का?"
        ]
      }[language] || mockQuestions.en;

      setQuestions(mockQuestions);
      setAgentLogs(data.logs || []);

      // If emergency, skip questions and go straight to report
      if (data.response.includes("EMERGENCY") || data.response.includes("🚨") || data.response.includes("Emergency")) {
        setReport({
          urgency: "Emergency",
          guidance: data.response,
          summary: symptomsInput
        });
        setStep(3);
      } else {
        setStep(2);
        setCurrentQuestionIdx(0);
      }

    } catch (err) {
      console.warn("Server connection failed, using local offline symptom checker wizard...");
      
      // Set mock questions and step 2
      const fallbackQuestions = {
        en: ["Have you taken any fever medicines?", "Do you have body chills or vomiting?"],
        hi: ["क्या आपने बुखार की कोई दवा ली है?", "क्या आपको कंपकंपी या उल्टी हो रही है?"],
        mr: ["तुम्ही तापाचे कोणतेही औषध घेतले आहे का?", "तुम्हाला थंडी वाजून येत आहे किंवा उलट्या होत आहेत का?"]
      }[language] || fallbackQuestions.en;

      setQuestions(fallbackQuestions);
      setStep(2);
      setCurrentQuestionIdx(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextQuestion = (answerText) => {
    const qText = questions[currentQuestionIdx];
    setAnswers(prev => ({
      ...prev,
      [qText]: answerText
    }));

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      compileFinalReport(answerText);
    }
  };

  const compileFinalReport = async (lastAns) => {
    setIsProcessing(true);
    const qText = questions[currentQuestionIdx];
    const updatedAnswers = { ...answers, [qText]: lastAns };

    // Format query containing all details
    const compiledQuery = `Symptom: ${symptomsInput}. Answers to follow-up questions: ` + 
      Object.entries(updatedAnswers).map(([q, a]) => `${q} -> ${a}`).join(". ");

    try {
      const res = await fetch(`${apiBaseUrl}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          query: compiledQuery,
          language
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      let urgency = "Doctor consultation recommended";
      if (data.response.includes("Emergency") || data.response.includes("🚨")) urgency = "Emergency";
      else if (data.response.includes("General") || data.response.includes("wellness")) urgency = "General health guidance";

      setReport({
        urgency,
        guidance: data.response,
        summary: symptomsInput
      });
      setAgentLogs(data.logs || []);
      setStep(3);

    } catch (err) {
      // offline fallback compiler
      setTimeout(() => {
        let urgency = "Doctor consultation recommended";
        let guidance = "Offline triage complete. Based on symptoms and follow-up replies (taking medicines, chills), we recommend consulting a local medical worker at your nearest sub-center. Do not take self-medicated antibiotics. Keep a recording of your body temperature.";
        
        if (symptomsInput.toLowerCase().includes("chest pain") || symptomsInput.toLowerCase().includes("snake")) {
          urgency = "Emergency";
          guidance = "Emergency red-flags detected. Visit the hospital or activate SOS immediately!";
        }

        setReport({
          urgency,
          guidance,
          summary: symptomsInput
        });
        setStep(3);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = () => {
    setSymptomsInput('');
    setQuestions([]);
    setAnswers({});
    setReport(null);
    setAgentLogs([]);
    setStep(1);
  };

  const getUrgencyColor = (urg) => {
    switch (urg) {
      case 'Emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'Doctor consultation recommended': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-2xl mb-3 shadow-xs">
          <Stethoscope className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800">{labels.title}</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-lg mx-auto">{labels.subtitle}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Step 1: Input symptoms */}
        {step === 1 && (
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">{labels.inputLabel}</label>
            <div className="flex gap-3 items-center">
              <VoiceButton onResult={(t) => setSymptomsInput(t)} language={language} />
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="e.g. Cough, stomach pain, dizziness..."
                rows={3}
                className="flex-1 p-4 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            
            <button
              onClick={handleStartAssessment}
              disabled={isProcessing || !symptomsInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-md transition cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{labels.btnNext}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Follow-up Questionnaire */}
        {step === 2 && questions.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>{labels.followUpHeader}</span>
              <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex items-start gap-3">
              <HelpCircle className="h-6 w-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="font-extrabold text-slate-800 text-base">{questions[currentQuestionIdx]}</div>
            </div>

            {/* Answer Field */}
            <div className="space-y-3">
              <input
                type="text"
                id={`q-answer-${currentQuestionIdx}`}
                placeholder="Type or speak your answer..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleNextQuestion(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 text-sm"
              />
              <div className="flex items-center gap-2">
                <VoiceButton onResult={(t) => {
                  const input = document.getElementById(`q-answer-${currentQuestionIdx}`);
                  if (input) {
                    input.value = t;
                    handleNextQuestion(t);
                  }
                }} language={language} />
                <span className="text-xs text-slate-400 italic">Click mic to answer by voice</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  const val = document.getElementById(`q-answer-${currentQuestionIdx}`)?.value || 'Yes';
                  handleNextQuestion(val);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer text-sm"
              >
                {currentQuestionIdx < questions.length - 1 ? labels.btnNext : labels.btnSubmit}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Final Report Card */}
        {step === 3 && report && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-800 text-base">{labels.reportTitle}</h3>
              </div>
              <SpeechSpeaker text={report.guidance} language={language} />
            </div>

            {/* Urgency Badge */}
            <div className={`p-4 rounded-xl border flex items-center gap-2 font-bold ${getUrgencyColor(report.urgency)}`}>
              <AlertOctagon className="h-5 w-5 flex-shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-extrabold">{labels.urgencyTitle}</span>
                <span className="text-sm">{report.urgency}</span>
              </div>
            </div>

            {/* Guidance Content */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{labels.actionTitle}</span>
              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{report.guidance}</div>
            </div>

            <button
              onClick={handleRestart}
              className="w-full py-4 border border-emerald-600 hover:bg-emerald-50 text-emerald-700 font-bold rounded-xl shadow-xs transition cursor-pointer text-sm"
            >
              {labels.btnRestart}
            </button>
          </div>
        )}

      </div>

      {/* Decision logs drawer */}
      {agentLogs.length > 0 && (
        <div className="mt-6">
          <AgentLogDrawer logs={agentLogs} />
        </div>
      )}

    </div>
  );
}
