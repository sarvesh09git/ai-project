import { callGemini } from './geminiHelper.js';

// Pre-seeded translation dictionary for accurate medical/guidance fallbacks
const translations = {
  hi: {
    "Emergency": "आपातकालीन स्थिति (Emergency)",
    "Doctor consultation recommended": "डॉक्टर से परामर्श की सलाह दी जाती है",
    "General health guidance": "सामान्य स्वास्थ्य मार्गदर्शन",
    "Home Care": "घरेलू उपचार मार्गदर्शन",
    "Welcome to SwasthyaAI! How can I help you today?": "स्वास्थ्यAI में आपका स्वागत है! आज मैं आपकी क्या मदद कर सकता हूँ?",
    "Please consult a doctor.": "कृपया डॉक्टर से सलाह लें।",
    "This is an emergency. Please visit the nearest hospital immediately or press the SOS button.": "यह एक आपातकालीन स्थिति है। कृपया तुरंत नजदीकी अस्पताल जाएं या एसओएस (SOS) बटन दबाएं।",
    "Here is the nearest facility:": "यहाँ नजदीकी स्वास्थ्य केंद्र है:",
    "Found nearby facilities:": "नजदीकी स्वास्थ्य केंद्र मिले:",
    "Medication reminder set successfully!": "दवा का अनुस्मारक (Reminder) सफलतापूर्वक सेट हो गया!",
    "No facilities found nearby.": "आसपास कोई स्वास्थ्य केंद्र नहीं मिला।",
    "Symptom Assessment Report": "लक्षण मूल्यांकन रिपोर्ट",
    "Urgency Level": "अत्यावश्यकता स्तर",
    "Follow-up Advice": "अनुवर्ती सलाह",
    "Action Required": "आवश्यक कार्रवाई"
  },
  mr: {
    "Emergency": "तातडीची वैद्यकीय मदत (Emergency)",
    "Doctor consultation recommended": "डॉक्टरांचा सल्ला घेण्याची शिफारस केली जाते",
    "General health guidance": "सामान्य आरोग्य मार्गदर्शन",
    "Home Care": "घरगुती काळजी मार्गदर्शन",
    "Welcome to SwasthyaAI! How can I help you today?": "स्वास्थ्यAI मध्ये आपले स्वागत आहे! आज मी तुम्हाला कशी मदत करू शकतो?",
    "Please consult a doctor.": "कृपया डॉक्टरांचा सल्ला घ्या.",
    "This is an emergency. Please visit the nearest hospital immediately or press the SOS button.": "ही एक आणीबाणीची परिस्थिती आहे. कृपया त्वरित जवळच्या रुग्णालयाला भेट द्या किंवा एसओएस (SOS) बटण दाबा.",
    "Here is the nearest facility:": "जवळचे आरोग्य केंद्र खालीलप्रमाणे आहे:",
    "Found nearby facilities:": "जवळपासची आरोग्य केंद्रे आढळली:",
    "Medication reminder set successfully!": "औषधाचे रिमाइंडर यशस्वीरित्या सेट केले आहे!",
    "No facilities found nearby.": "जवळपास कोणतेही आरोग्य केंद्र सापडले नाही.",
    "Symptom Assessment Report": "लक्षण मूल्यांकन अहवाल",
    "Urgency Level": "तात्काळ पातळी",
    "Follow-up Advice": "पुढील सल्ला",
    "Action Required": "आवश्यक कृती"
  }
};

export const LanguageAssistanceAgent = {
  name: "Language Assistance Agent",
  
  async translate(text, targetLang, apiKey) {
    if (!targetLang || targetLang === 'en') {
      return text;
    }

    // Attempt to use Gemini API if available
    if (apiKey) {
      try {
        const prompt = `Translate the following medical/healthcare text into ${
          targetLang === 'hi' ? 'Hindi' : 'Marathi'
        }. Keep medical terms like 'SOS', 'ECG', 'ICU', 'Paracetamol' in English letters or transliterated in brackets where appropriate so rural users understand. 
        Return ONLY the translated text, nothing else.
        Text to translate: "${text}"`;
        
        const response = await callGemini(prompt, apiKey);
        if (response && response.trim()) {
          return response.trim();
        }
      } catch (error) {
        console.error("Gemini translation failed, using dictionary fallback:", error);
      }
    }

    // Dictionary fallback
    const langDict = translations[targetLang];
    if (langDict && langDict[text]) {
      return langDict[text];
    }

    // Dynamic partial dictionary replacement for simple sentences in fallback mode
    let translatedText = text;
    const dict = translations[targetLang];
    if (dict) {
      for (const [englishWord, localWord] of Object.entries(dict)) {
        translatedText = translatedText.replace(new RegExp(englishWord, 'gi'), localWord);
      }
    }

    return translatedText;
  },

  // Helper to format spoken text phonetically for better screen reader output in Hindi/Marathi
  getSpeechScript(text, lang) {
    // For standard Web Speech API, returns text to speak
    return text;
  }
};
