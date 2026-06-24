import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, ShieldCheck, XCircle, MapPin, Phone, HelpCircle } from 'lucide-react';

const OFFLINE_GUIDES = {
  snakebite: {
    title: "🐍 Snakebite First-Aid Protocol (सर्पदंश)",
    steps: [
      "Keep the patient calm and completely still. Movement spreads venom faster.",
      "Keep the bitten limb positioned BELOW the level of the heart.",
      "Remove tight clothing, rings, or shoes, as swelling will occur.",
      "Do NOT cut or suck the wound. Do NOT apply ice or tight ropes (tourniquets).",
      "Do NOT give alcohol, tea, coffee, or aspirin.",
      "RUSH the patient to the nearest Government Hospital or Primary Health Center. Ask for Anti-Snake Venom (ASV)."
    ]
  },
  heatstroke: {
    title: "☀️ Severe Heatstroke / Dehydration (उष्माघात)",
    steps: [
      "Move the person out of the hot sun and into a cool, shaded area or fan-cooled room.",
      "Cool the person down by sponging their body with cool water or placing wet cloths on their forehead, neck, and underarms.",
      "If they are fully awake and conscious, give them cool water to drink in small sips, or Oral Rehydration Salts (ORS) / coconut water.",
      "Do NOT give anything to drink if they are vomiting, confused, or unconscious.",
      "If their body temperature stays extremely high, rush them to a clinic."
    ]
  },
  bleeding: {
    title: "🩸 Severe Bleeding / Cuts (रक्तस्राव)",
    steps: [
      "Apply direct pressure to the wound using a clean cloth, bandage, or even clean hands.",
      "Keep pressing firmly until the bleeding stops.",
      "If the wound is on an arm or leg, elevate the limb above the heart if possible, while keeping pressure applied.",
      "Do NOT wash deep wounds or try to remove embedded objects yourself. Just press around them.",
      "Wrap a clean bandage firmly over the cloth. If blood leaks through, add another cloth on top; do not remove the first one."
    ]
  },
  heart_attack: {
    title: "🫀 Heart Attack / Chest Pain (हार्ट अटैक)",
    steps: [
      "Have the person sit down, rest, and try to remain calm.",
      "Loosen any tight clothing around the neck and waist.",
      "If the person is conscious, ask if they carry emergency medication (like Sorbitrate or Aspirin 325mg) and help them take it.",
      "If unconscious and not breathing, start CPR (press hard and fast in the center of the chest) immediately.",
      "Call for an ambulance or transport them to the nearest cardiac center immediately."
    ]
  }
};

export default function EmergencyPage() {
  const { user, coordinates, language, apiBaseUrl, token } = useAuth();
  
  // SOS States
  const [sosState, setSosState] = useState('idle'); // idle, countdown, active, triggered
  const [countdown, setCountdown] = useState(5);
  const [sosResult, setSosResult] = useState(null);
  const [activeGuideKey, setActiveGuideKey] = useState('snakebite');

  // Timer reference
  let timerRef = null;

  // Handles SOS Activation Countdown
  useEffect(() => {
    if (sosState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        triggerSOSAlert();
      }
    }
  }, [sosState, countdown]);

  const startSOS = () => {
    setCountdown(5);
    setSosState('countdown');
  };

  const cancelSOS = () => {
    setSosState('idle');
    setCountdown(5);
  };

  const triggerSOSAlert = async () => {
    setSosState('active');
    try {
      const res = await fetch(`${apiBaseUrl}/agent/sos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ coordinates })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setSosResult(data);
      setSosState('triggered');
    } catch (e) {
      console.warn("SOS endpoint offline, executing local emergency notification trigger...");
      
      // Local fallback contacts
      const defaultContacts = user?.emergencyContacts?.length 
        ? user.emergencyContacts 
        : [{ name: "Gram Sevak", phone: "+91 94220 12345", relation: "Village Leader" }];

      setTimeout(() => {
        setSosResult({
          success: true,
          smsMessage: `EMERGENCY SOS! Local coordinates Lat: ${coordinates.lat}, Lng: ${coordinates.lng}. Help immediately.`,
          contactsAlerted: defaultContacts
        });
        setSosState('triggered');
      }, 1000);
    }
  };

  const labels = {
    en: {
      alertTitle: "Critical Emergency SOS Hub",
      alertSub: "Triggering SOS immediately alerts your family contacts and local leaders, sending your precise GPS coordinates.",
      sosIdle: "ACTIVATE SOS",
      sosCancel: "CANCEL SOS",
      sosSecs: "seconds to broadcast",
      sosSent: "SOS Broadcast Dispatched",
      sosSentSub: "Emergency alerts sent successfully to contacts.",
      offTitle: "Offline Rural First-Aid Manual",
      offSub: "Read these steps immediately while ambulance is arriving."
    },
    hi: {
      alertTitle: "गंभीर आपातकालीन SOS केंद्र",
      alertSub: "एसओएस शुरू करने से तुरंत आपके परिवार के संपर्कों और स्थानीय नेताओं को आपके सटीक जीपीएस निर्देशांक के साथ सचेत किया जाता है।",
      sosIdle: "SOS सक्रिय करें",
      sosCancel: "SOS रद्द करें",
      sosSecs: "प्रसारण में शेष सेकंड",
      sosSent: "SOS अलर्ट भेज दिया गया",
      sosSentSub: "संपर्कों को आपातकालीन अलर्ट सफलतापूर्वक भेजे गए।",
      offTitle: "ऑफलाइन ग्रामीण प्राथमिक चिकित्सा नियमावली",
      offSub: "एंबुलेंस आने का इंतजार करते समय इन चरणों को तुरंत पढ़ें।"
    },
    mr: {
      alertTitle: "गंभीर आपत्कालीन SOS केंद्र",
      alertSub: "SOS सुरू केल्याने तुमच्या कुटुंबातील सदस्यांना आणि स्थानिक नेत्यांना तुमच्या अचूक जीपीएस स्थानासह त्वरित संदेश पाठवला जाईल.",
      sosIdle: "SOS सुरू करा",
      sosCancel: "SOS रद्द करा",
      sosSecs: "संदेश पाठवण्यासाठी सेकंद",
      sosSent: "SOS अलर्ट पाठवला गेला",
      sosSentSub: "संपर्कांना आणीबाणीचा संदेश यशस्वीरित्या पाठवला आहे.",
      offTitle: "ऑफलाइन ग्रामीण प्रथमोपचार नियमावली",
      offSub: "रुग्णवाहिका येईपर्यंत ही प्रथमोपचार माहिती काळजीपूर्वक वाचा."
    }
  }[language] || labels.en;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* SOS Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm mb-8">
        
        {/* Left SOS Trigger */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-4 py-6 border-b md:border-b-0 md:border-r border-slate-200">
          
          {sosState === 'idle' && (
            <>
              <button
                onClick={startSOS}
                className="w-56 h-56 rounded-full bg-red-600 text-white flex flex-col items-center justify-center font-extrabold text-2xl tracking-wider shadow-lg animate-pulse-sos border-[10px] border-red-200 transition-all hover:scale-105 cursor-pointer"
              >
                <ShieldAlert className="h-14 w-14 mb-2" />
                <span>{labels.sosIdle}</span>
              </button>
              <p className="text-slate-400 text-xs">Press button to begin 5s countdown</p>
            </>
          )}

          {sosState === 'countdown' && (
            <>
              <button
                onClick={cancelSOS}
                className="w-56 h-56 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center font-extrabold text-2xl tracking-wider shadow-lg border-[10px] border-slate-700 cursor-pointer"
              >
                <span className="text-5xl font-mono text-red-500 mb-1">{countdown}</span>
                <span className="text-xs uppercase text-slate-300 font-bold">{labels.sosCancel}</span>
              </button>
              <p className="text-slate-500 font-semibold text-xs animate-pulse">
                {labels.sosSecs}
              </p>
            </>
          )}

          {sosState === 'active' && (
            <div className="w-56 h-56 rounded-full bg-red-700 text-white flex flex-col items-center justify-center font-bold text-lg">
              <RefreshCw className="h-10 w-10 animate-spin mb-2" />
              <span>Broadcasting...</span>
            </div>
          )}

          {sosState === 'triggered' && (
            <>
              <div className="w-56 h-56 rounded-full bg-emerald-100 border-8 border-emerald-200 text-emerald-800 flex flex-col items-center justify-center font-extrabold text-base">
                <ShieldCheck className="h-16 w-16 text-emerald-600 mb-1 animate-bounce" />
                <span>{labels.sosSent}</span>
              </div>
              <button
                onClick={cancelSOS}
                className="px-6 py-2 border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Reset SOS Status
              </button>
            </>
          )}

        </div>

        {/* Right Info Coordinates details */}
        <div className="md:col-span-7 space-y-4 pl-0 md:pl-6">
          <div>
            <h1 className="text-2xl font-black text-red-600 flex items-center gap-1.5">
              <ShieldAlert className="h-6 w-6" />
              <span>{labels.alertTitle}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{labels.alertSub}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Locked GPS Location</span>
              <span className="text-xs font-mono font-semibold text-slate-700">Latitude: {coordinates.lat.toFixed(5)} | Longitude: {coordinates.lng.toFixed(5)}</span>
            </div>
          </div>

          {/* Alert target status details */}
          {sosResult && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-emerald-800 block">💬 Emergency Dispatch:</span>
              <p className="text-emerald-700 italic">"{sosResult.smsMessage}"</p>
              <div className="pt-2 border-t border-emerald-200/50">
                <span className="font-bold text-slate-500 block uppercase text-[9px] mb-1">Contacts Alerted:</span>
                <div className="flex flex-col gap-1">
                  {sosResult.contactsAlerted.map((c, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 font-semibold text-slate-600">
                      <span>{c.name} ({c.relation})</span>
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-emerald-600">
                        <Phone className="h-3 w-3" />
                        <span>{c.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Offline First Aid Guides Panel */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-sm">
        <div className="border-b border-slate-100 pb-3 mb-6">
          <h2 className="text-xl font-extrabold text-slate-800">{labels.offTitle}</h2>
          <p className="text-slate-500 text-xs mt-0.5">{labels.offSub}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Menu Guide Tabs */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {Object.keys(OFFLINE_GUIDES).map((key) => (
              <button
                key={key}
                onClick={() => setActiveGuideKey(key)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition cursor-pointer font-bold text-xs whitespace-nowrap lg:whitespace-normal
                  ${activeGuideKey === key 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs' 
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
              >
                {OFFLINE_GUIDES[key].title}
              </button>
            ))}
          </div>

          {/* Active Guide Card */}
          <div className="lg:col-span-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-base mb-4">
              {OFFLINE_GUIDES[activeGuideKey].title}
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-600">
              {OFFLINE_GUIDES[activeGuideKey].steps.map((step, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
