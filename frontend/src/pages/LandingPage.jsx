import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, Languages, MapPin, ClipboardList, Clock, ArrowRight, Cpu, Network, CheckCircle, Eye, Sun, Moon, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


export default function LandingPage() {
  const { language, largeFontMode, toggleLargeFontMode, darkMode, toggleDarkMode } = useAuth();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const content = {
    en: {
      heroTitle: "Empowering Rural Communities with AI-Driven Healthcare",
      heroSub: "SwasthyaAI is your local health navigator. Speak or type in your language to get instant guidance, find the nearest government centers, manage reminders, and trigger SOS support.",
      getStarted: "Get AI Consultation",
      emergencySos: "Emergency Support (SOS)",
      problemsHeader: "The Rural Healthcare Challenge",
      problemsSub: "Why traditional medical access fails remote and agricultural villages",
      featuresHeader: "Our Multi-Agent Health Intelligence",
      featuresSub: "6 specialized AI agents working together to protect your family"
    },
    hi: {
      heroTitle: "एआई-संचालित स्वास्थ्य सेवा से ग्रामीण समुदायों का सशक्तिकरण",
      heroSub: "स्वास्थ्यAI आपका स्थानीय स्वास्थ्य मार्गदर्शक है। तुरंत मार्गदर्शन प्राप्त करने, निकटतम सरकारी केंद्र खोजने, अनुस्मारक प्रबंधित करने और आपातकालीन सहायता के लिए अपनी भाषा में बोलें या लिखें।",
      getStarted: "एआई परामर्श प्राप्त करें",
      emergencySos: "आपातकालीन सहायता (SOS)",
      problemsHeader: "ग्रामीण स्वास्थ्य सेवा की चुनौतियाँ",
      problemsSub: "दूरदराज के और कृषि प्रधान गांवों में पारंपरिक चिकित्सा पहुंच क्यों विफल हो जाती है",
      featuresHeader: "हमारी बहु-एजेंट स्वास्थ्य बुद्धिमत्ता",
      featuresSub: "आपके परिवार की सुरक्षा के लिए मिलकर काम करने वाले 6 विशेष एआई एजेंट"
    },
    mr: {
      heroTitle: "एआय-संचालित आरोग्य सेवेद्वारे ग्रामीण भागांचे सक्षमीकरण",
      heroSub: "स्वास्थ्यAI आपला स्थानिक आरोग्य मार्गदर्शक आहे. झटपट मार्गदर्शन मिळवण्यासाठी, जवळचे सरकारी केंद्र शोधण्यासाठी, रिमाइंडर व्यवस्थापित करण्यासाठी आणि तात्काळ मदतीसाठी आपल्या भाषेत बोला किंवा लिहा.",
      getStarted: "एआय सल्ला मिळवा",
      emergencySos: "तातडीची मदत (SOS)",
      problemsHeader: "ग्रामीण आरोग्य सेवेसमोरील आव्हाने",
      problemsSub: "दुर्गम आणि शेतीप्रधान गावांमध्ये पारंपारिक वैद्यकीय सेवा पोहोचण्यात का अडचण येते",
      featuresHeader: "आमची बहु-एजंट आरोग्य बुद्धिमत्ता",
      featuresSub: "आपल्या कुटुंबाच्या संरक्षणासाठी एकत्र काम करणारे 6 विशेष एआय एजंट"
    }
  }[language] || content.en;

  const problemCards = [
    {
      icon: Clock,
      title: language === 'hi' ? "मार्गदर्शन की कमी" : language === 'mr' ? "मार्गदर्शनाचा अभाव" : "Lack of Healthcare Guidance",
      desc: language === 'hi' ? "गांवों में प्राथमिक जांच की अनुपस्थिति के कारण छोटी बीमारियां भी गंभीर रूप ले लेती हैं।" : language === 'mr' ? "प्राथमिक तपासणीच्या अभावामुळे गावांमध्ये साधे आजारही गंभीर रूप धारण करतात." : "Absence of basic triage leads to simple conditions deteriorating before professional contact."
    },
    {
      icon: MapPin,
      title: language === 'hi' ? "अस्पतालों की दूरी" : language === 'mr' ? "रुग्णालयांचे अंतर" : "Finding Medical Facilities",
      desc: language === 'hi' ? "सटीक जानकारी के बिना ग्रामीण मरीज घंटों दूर बड़े शहरों में भटकते हैं।" : language === 'mr' ? "अनेकदा ग्रामीण रुग्ण उपचारासाठी योग्य केंद्राची माहिती नसल्यामुळे लांबच्या शहरात जातात।" : "Without accurate details, rural patients often travel hours to distant cities unnecessarily."
    },
    {
      icon: Languages,
      title: language === 'hi' ? "भाषा की बाधा" : language === 'mr' ? "भाषेची अडचण" : "Language Barriers",
      desc: language === 'hi' ? "शहरी डॉक्टरों के साथ संवाद करने में ग्रामीण मरीजों को अपनी स्थानीय बोली में कठिनाई होती है।" : language === 'mr' ? "शहरी डॉक्टरांशी संवाद साधताना ग्रामीण रुग्णांना त्यांच्या स्थानिक बोलीभाषेत अडचण येते." : "Dialect differences make communicating with urban doctors difficult for rural patients."
    },
    {
      icon: ClipboardList,
      title: language === 'hi' ? "दवाइयों के रिमाइंडर" : language === 'mr' ? "स्मरणपत्रांचा अभाव" : "Medication Adherence",
      desc: language === 'hi' ? "ग्रामीण क्षेत्रों में स्वास्थ्य साक्षरता कम होने से दवाओं और उपचार का समय छूट जाता है।" : language === 'mr' ? "ग्रामीण भागात आरोग्य साक्षरता कमी असल्याने औषधे आणि उपचाराची वेळ चुकते." : "Lack of structured reminders leads to missed vaccine schedules and skipped chronic disease medications."
    }
  ];

  const agentWorkflow = [
    {
      title: language === 'hi' ? "1. रोगी की पूछताछ" : language === 'mr' ? "1. रुग्णाची विचारणा" : "1. User Query Ingestion",
      agent: "Triage Agent",
      desc: language === 'hi' ? "रोगी की भाषा और स्वास्थ्य चिंताओं को समझता है।" : language === 'mr' ? "रुग्णाची भाषा आणि आरोग्य विषयक चिंता समजून घेतो." : "Identifies the user's primary concern, language preference, and tone."
    },
    {
      title: language === 'hi' ? "2. लक्षण विश्लेषण" : language === 'mr' ? "2. लक्षण विश्लेषण" : "2. Symptom Analysis",
      agent: "Symptom Checker Agent",
      desc: language === 'hi' ? "संभावित स्वास्थ्य स्थितियों का आकलन करने के लिए प्रश्नों का विश्लेषण करता है।" : language === 'mr' ? "आरोग्य स्थितीचे मूल्यांकन करण्यासाठी लक्षणांचे विश्लेषण करतो." : "Evaluates clinical severity based on symptom check lists."
    },
    {
      title: language === 'hi' ? "3. स्वास्थ्य केंद्र खोज" : language === 'mr' ? "3. आरोग्य केंद्र शोध" : "3. Facility Location",
      agent: "Discovery Agent",
      desc: language === 'hi' ? "दूरी और सेवाओं के आधार पर निकटतम सरकारी अस्पतालों को ढूंढता है।" : language === 'mr' ? "जवळचे सरकारी दवाखाने आणि औषधालये शोधतो." : "Queries local databases to find nearby friendly facilities."
    },
    {
      title: language === 'hi' ? "4. अनुस्मारक और ट्रैकिंग" : language === 'mr' ? "4. स्मरणपत्र व्यवस्थापन" : "4. Care Coordination",
      agent: "Reminder Agent",
      desc: language === 'hi' ? "फॉलो-अप और दवाइयों के समय पर रिमाइंडर सेट करता है।" : language === 'mr' ? "औषधोपचार आणि लसीकरणासाठी स्मरणपत्रे सेट करतो." : "Generates follow-up reminders and chronic illness logs."
    },
    {
      title: language === 'hi' ? "5. भाषा अनुवाद" : language === 'mr' ? "5. भाषा अनुवाद" : "5. Dialect Assistance",
      agent: "Language Agent",
      desc: language === 'hi' ? "सभी जानकारियों को स्थानीय भाषाओं (हिंदी/मराठी) में अनुवादित करता है।" : language === 'mr' ? "सर्व वैद्यकीय मार्गदर्शन स्थानिक भाषेत (मराठी/हिंदी) भाषांतरित करतो." : "Translates and reads out results via Speech Synthesis."
    }
  ];

  const heroBgStyle = {
    backgroundImage: darkMode
      ? "linear-gradient(to right, rgba(15, 23, 42, 0.85) 35%, rgba(15, 23, 42, 0.5) 70%, rgba(15, 23, 42, 0.15) 100%), url('/hero-bg.jpg')"
      : "linear-gradient(to right, rgba(255, 255, 255, 0.85) 35%, rgba(255, 255, 255, 0.5) 70%, rgba(255, 255, 255, 0.15) 100%), url('/hero-bg.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <section 
        className="relative overflow-hidden pt-16 pb-20 border-b border-slate-100"
        style={heroBgStyle}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-4">
                <Cpu className="h-3 w-3" />
                Agents For Good Track
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                {content.heroTitle}
              </h1>
              <p className="mt-4 text-base text-slate-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl leading-relaxed">
                {content.heroSub}
              </p>

              <div className="mt-8 sm:max-w-lg sm:mx-auto lg:mx-0 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/chat"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-all text-base cursor-pointer"
                >
                  <span>{content.getStarted}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/emergency"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-md transition-all text-base animate-pulse-sos cursor-pointer"
                >
                  <ShieldAlert className="h-5 w-5" />
                  <span>{content.emergencySos}</span>
                </Link>
              </div>
            </div>

            {/* Visual AI Graphic */}
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-md bg-emerald-900/5 p-8 rounded-3xl border border-emerald-900/10 flex flex-col items-center">

                {/* Simulated Floating Micro-Agent nodes */}
                <div className="absolute top-4 left-6 bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-bold">Health Assessment</span>
                </div>
                <div className="absolute bottom-6 right-2 bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-600" />
                  <span className="text-xs font-bold">Discovery Agent</span>
                </div>
                <div className="absolute top-1/2 -left-6 bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center gap-2">
                  <Languages className="h-5 w-5 text-orange-600" />
                  <span className="text-xs font-bold">Marathi & Hindi</span>
                </div>

                {/* Central brain node */}
                <div className="w-40 h-40 bg-emerald-600 rounded-full flex flex-col items-center justify-center text-white shadow-xl animate-pulse z-10 border-4 border-white">
                  <Network className="h-12 w-12 mb-1" />
                  <span className="font-extrabold text-sm tracking-wide">Orchestrator</span>
                  <span className="text-[10px] text-emerald-100">Swasthya Brain</span>
                </div>

                {/* Glow orbits */}
                <div className="absolute w-64 h-64 border border-dashed border-emerald-500/30 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute w-80 h-80 border border-dashed border-emerald-500/20 rounded-full animate-[spin_35s_linear_infinite]" />

                <div className="mt-8 text-center">
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    Active Multi-Agent Loop
                  </span>
                  <p className="text-xs text-slate-500 mt-2 font-medium">
                    Reads queries, calls database tools, formats speech output.
                  </p>
                </div>

                {/* Quick Accessibility Controls */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={toggleLargeFontMode}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm ${largeFontMode
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      }`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>
                      {language === 'hi'
                        ? "लिखावट बड़ी करें (बुजुर्गों के लिए)"
                        : language === 'mr'
                          ? "अक्षर मोठे करा (वृद्धांसाठी)"
                          : "Make Text Bigger (Elderly Care)"}
                    </span>
                  </button>

                  <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/90 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm"
                  >
                    {darkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-slate-700" />}
                    <span>
                      {darkMode
                        ? (language === 'hi' ? "लाइट मोड" : language === 'mr' ? "लाईट मोड" : "Light Mode")
                        : (language === 'hi' ? "डार्क मोड" : language === 'mr' ? "डार्क मोड" : "Dark Mode")}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      const msg = {
                        en: "SwasthyaAI helps you get healthcare information. Click 'Get AI Consultation' to chat with the health assistant, or 'Emergency Support' if you need urgent local services.",
                        hi: "स्वास्थ्यएआई आपको स्वास्थ्य संबंधी जानकारी प्राप्त करने में मदद करता है। स्वास्थ्य सहायक से चैट करने के लिए 'एआई परामर्श प्राप्त करें' पर क्लिक करें, या यदि आपको तत्काल स्थानीय सेवाओं की आवश्यकता है तो 'आपातकालीन सहायता' पर क्लिक करें।",
                        mr: "स्वास्थ्यएआय तुम्हाला आरोग्य सेवा माहिती मिळविण्यात मदत करते. आरोग्य सहाय्यकाशी चॅट करण्यासाठी 'एआय सल्ला मिळवा' वर क्लिक करा किंवा तातडीच्या स्थानिक सेवा हव्या असल्यास 'तातडीची मदत' वर क्लिक करा."
                      }[language] || msg.en;

                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(msg);
                        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
                        window.speechSynthesis.speak(utterance);
                      } else {
                        alert(msg);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/90 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-sm"
                  >
                    <HelpCircle className="h-4 w-4 text-sky-655 text-sky-600" />
                    <span>
                      {language === 'hi' ? "यह ऐप कैसे काम करता है?" : language === 'mr' ? "हे ॲप कसे वापरावे?" : "How to use this app?"}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Problem Statements Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {content.problemsHeader}
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium">
              {content.problemsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemCards.map((prob, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="bg-emerald-50 text-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                    <prob.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{prob.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{prob.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Interactive Agent Workflow Graphic */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {content.featuresHeader}
            </h2>
            <p className="mt-4 text-lg text-slate-500 font-medium">
              {content.featuresSub}
            </p>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

            {/* Steps Left List */}
            <div className="lg:col-span-5 space-y-3">
              {agentWorkflow.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex gap-3.5 items-start
                    ${activeWorkflowStep === idx
                      ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                >
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0
                    ${activeWorkflowStep === idx ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{step.agent}</h4>
                    <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">{step.role}</span>
                    <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Simulated Live Action Right Box */}
            <div className="lg:col-span-7 mt-8 lg:mt-0 bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-[10px] text-slate-400 font-mono pl-2">SwasthyaAI agent-orchestrator.js</span>
                </div>
                <span className="bg-emerald-900/50 text-emerald-400 font-mono text-[10px] px-2 py-0.5 rounded-full border border-emerald-900">
                  STEP {activeWorkflowStep + 1} RUNNING
                </span>
              </div>

              {/* Console log outputs */}
              <div className="font-mono text-xs space-y-4 min-h-[220px] text-slate-300">
                {activeWorkflowStep === 0 && (
                  <>
                    <p className="text-emerald-400">&gt; orchestrator.initSession(userId: "u_987", text: "I have high fever and need a doctor near Wagholi")</p>
                    <p className="text-slate-400">Loading user memory configuration...</p>
                    <p className="text-slate-200">🔍 Memory Match: User has active allergy: Penicillin. Chronic diabetes.</p>
                    <p className="text-yellow-400">💡 Routing Decision: Symptoms detected ("fever"). Facility search requested ("doctor").</p>
                    <p className="text-slate-400">Invoking Parallel Sub-Agents: [HealthAssessmentAgent, HealthcareDiscoveryAgent]</p>
                  </>
                )}
                {activeWorkflowStep === 1 && (
                  <>
                    <p className="text-emerald-400">&gt; healthAssessmentAgent.assessSymptoms(symptoms: "high fever", history: {`{`} allergies: ["Penicillin"] {`}`})</p>
                    <p className="text-slate-400">Scanning indicators...</p>
                    <p className="text-slate-200">⚠️ Risk identified: Fever can indicate active infection.</p>
                    <p className="text-green-400">✅ Urgency Class: "Doctor consultation recommended"</p>
                    <p className="text-slate-300">Home Care advice compiled. Reminder appended: Consult healthcare worker if temp exceeds 101°F.</p>
                  </>
                )}
                {activeWorkflowStep === 2 && (
                  <>
                    <p className="text-emerald-400">&gt; healthcareDiscoveryAgent.findNearbyFacilities(lat: 18.59, lng: 74.01, filter: "Hospital")</p>
                    <p className="text-slate-400">Executing database lookup query...</p>
                    <p className="text-slate-200">📍 Bounding Box GPS query succeeded: found Wagholi Sub-Center (1.2 km away).</p>
                    <p className="text-cyan-400">✅ Return items: ["Saraswati Multi-Specialty Hospital (1.2km)", "Lonikand Rural PHC (3.4km)"]</p>
                    <p className="text-slate-400">Distance matrix generated.</p>
                  </>
                )}
                {activeWorkflowStep === 3 && (
                  <>
                    <p className="text-emerald-400">&gt; medicalExplanationAgent.explainTerm(term: "glucose test", apiKey: true)</p>
                    <p className="text-slate-400">Simplifying medical literature definitions...</p>
                    <p className="text-slate-200">Definition: "Blood Sugar Test. Checks the level of sugar (glucose) in your blood to screen for diabetes."</p>
                    <p className="text-yellow-500">✅ Plain language translation constructed: "रक्तातील साखरेची चाचणी..."</p>
                  </>
                )}
                {activeWorkflowStep === 4 && (
                  <>
                    <p className="text-emerald-400">&gt; languageAssistanceAgent.translate(content, target: "mr")</p>
                    <p className="text-slate-400">Translating final guidance packet to Marathi...</p>
                    <p className="text-green-400">🔊 Formatting Web Speech synthesis script for Marathi reader (mr-IN).</p>
                    <p className="text-slate-200">Compilation complete. Sending response payload packet to React frontend client.</p>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-2 text-white">
            <Activity className="h-6 w-6 text-emerald-500" />
            <span className="text-lg font-bold">SwasthyaAI</span>
          </div>
          <p className="text-sm">
            SwasthyaAI - Rural Health Navigator. Dedicated to improving healthcare outcomes in remote regions using AI Agent Coordination.
          </p>
          <div className="text-[11px] text-slate-600">
            * Disclaimer: SwasthyaAI is an artificial intelligence triage and lookup assistant. It provides general guidance and is NOT a clinical diagnosis. In case of serious emergency, immediately call local helplines (108).
          </div>
        </div>
      </footer>

    </div>
  );
}
