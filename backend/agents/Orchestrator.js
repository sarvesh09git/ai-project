import { HealthAssessmentAgent } from './HealthAssessmentAgent.js';
import { HealthcareDiscoveryAgent } from './HealthcareDiscoveryAgent.js';
import { MedicalExplanationAgent } from './MedicalExplanationAgent.js';
import { EmergencySupportAgent } from './EmergencySupportAgent.js';
import { ReminderAgent } from './ReminderAgent.js';
import { LanguageAssistanceAgent } from './LanguageAssistanceAgent.js';
import { callGemini } from './geminiHelper.js';
import User from '../models/User.js';

export async function runOrchestrator(userId, query, currentCoordinates = {}, userLanguage = 'en', apiKey = null) {
  const masterLogs = [];
  const lowercaseQuery = query.toLowerCase();
  
  masterLogs.push({
    agent: "Coordinator Orchestrator",
    thought: `Received query: "${query}" from User ID: ${userId || 'Guest'}. Language: ${userLanguage}. Coordinates: ${JSON.stringify(currentCoordinates)}`,
    action: "initiate_session",
    observation: "Starting routing and preference extraction."
  });

  // 1. Memory and Preference Extraction (Allergies, Medications, Language preferences)
  let updatedPreferences = null;
  let userProfile = null;

  if (userId) {
    try {
      userProfile = await User.findById(userId);
    } catch (e) {
      console.warn("Guest session or database error loading user profile, using mock context.");
    }
  }

  // Define fallback profile if not found
  if (!userProfile) {
    userProfile = {
      primaryLanguage: userLanguage || 'en',
      medicalHistory: { allergies: [], medications: [], conditions: [] },
      emergencyContacts: []
    };
  }

  // Preference Extraction Flow
  if (apiKey) {
    try {
      const extractPrompt = `You are a memory processor for a healthcare app. 
      Read the user query: "${query}"
      If the user is stating a personal health preference, allergy, or medication, extract it.
      For example: "I am allergic to aspirin" -> Allergy: aspirin. "I start taking Metformin today" -> Medication: Metformin. "Speak in Hindi" -> Language: hi.
      Return a JSON object containing ONLY the newly detected elements, or empty arrays/null if none found:
      {
        "allergies": ["extracted allergy"],
        "medications": ["extracted medication"],
        "conditions": ["extracted condition"],
        "language": "en | hi | mr"
      }
      Do not explain or write markdown content, return raw JSON.`;

      const extraction = await callGemini(extractPrompt, apiKey);
      
      let cleanExtract = extraction.trim();
      if (cleanExtract.startsWith("```json")) cleanExtract = cleanExtract.substring(7);
      if (cleanExtract.startsWith("```")) cleanExtract = cleanExtract.substring(3);
      if (cleanExtract.endsWith("```")) cleanExtract = cleanExtract.substring(0, cleanExtract.length - 3);

      const parsed = JSON.parse(cleanExtract.trim());
      if (parsed.allergies?.length || parsed.medications?.length || parsed.conditions?.length || parsed.language) {
        updatedPreferences = parsed;
        masterLogs.push({
          agent: "Coordinator Orchestrator",
          thought: `Extracted user profile memory updates via Gemini: ${JSON.stringify(parsed)}`,
          action: "update_memory_cache",
          observation: "Preferences staged for database sync."
        });
      }
    } catch (err) {
      console.error("Gemini memory extraction failed:", err);
    }
  } else {
    // Regex Memory Fallback extraction
    const allergies = [];
    const medications = [];
    const conditions = [];
    let language = null;

    if (lowercaseQuery.includes("allergic to")) {
      const match = query.match(/allergic to\s+([a-zA-Z\s,]+)/i);
      if (match && match[1]) {
        allergies.push(match[1].trim());
      }
    }
    if (lowercaseQuery.includes("take") || lowercaseQuery.includes("taking")) {
      const match = query.match(/(?:take|taking)\s+([a-zA-Z\s,]+)/i);
      if (match && match[1]) {
        medications.push(match[1].trim());
      }
    }
    if (lowercaseQuery.includes("diabetic") || lowercaseQuery.includes("diabetes")) {
      conditions.push("Diabetes");
    }
    if (lowercaseQuery.includes("hypertensive") || lowercaseQuery.includes("high bp")) {
      conditions.push("Hypertension");
    }
    if (lowercaseQuery.includes("hindi") || lowercaseQuery.includes("हिन्दी")) {
      language = 'hi';
    } else if (lowercaseQuery.includes("marathi") || lowercaseQuery.includes("मराठी")) {
      language = 'mr';
    }

    if (allergies.length || medications.length || conditions.length || language) {
      updatedPreferences = { allergies, medications, conditions, language };
      masterLogs.push({
        agent: "Coordinator Orchestrator",
        thought: `Extracted user preferences via local pattern-matching: ${JSON.stringify(updatedPreferences)}`,
        action: "update_memory_cache",
        observation: "Pattern matched successfully."
      });
    }
  }

  // Save memory updates to database if logged in
  if (updatedPreferences && userId) {
    try {
      const updateFields = {};
      if (updatedPreferences.allergies?.length) {
        updateFields['medicalHistory.allergies'] = [
          ...new Set([...(userProfile.medicalHistory?.allergies || []), ...updatedPreferences.allergies])
        ];
      }
      if (updatedPreferences.medications?.length) {
        updateFields['medicalHistory.medications'] = [
          ...new Set([...(userProfile.medicalHistory?.medications || []), ...updatedPreferences.medications])
        ];
      }
      if (updatedPreferences.conditions?.length) {
        updateFields['medicalHistory.conditions'] = [
          ...new Set([...(userProfile.medicalHistory?.conditions || []), ...updatedPreferences.conditions])
        ];
      }
      if (updatedPreferences.language) {
        updateFields.primaryLanguage = updatedPreferences.language;
        userLanguage = updatedPreferences.language;
      }

      const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
      if (updatedUser) {
        userProfile = updatedUser;
        masterLogs.push({
          agent: "Coordinator Orchestrator",
          thought: "User memory synced and persisted successfully to MongoDB.",
          action: "database_write",
          observation: "User medical profile updated."
        });
      }
    } catch (e) {
      console.error("Failed to sync user memory preferences:", e);
    }
  }

  // 2. Routing Decision Block
  let finalAgentResponse = "";
  let routingReason = "";
  let activeAgent = "";

  // A. Emergency Check
  const emergencyKeywords = ["emergency", "sos", "accident", "chest pain", "snake bite", "poison", "bleeding", "unconscious", "choking"];
  const isEmergency = emergencyKeywords.some(kw => lowercaseQuery.includes(kw));

  if (isEmergency) {
    activeAgent = EmergencySupportAgent.name;
    routingReason = "Query indicates a high-urgency emergency or trauma situation. Redirecting to Emergency Support Agent.";
    masterLogs.push({
      agent: "Coordinator Orchestrator",
      thought: routingReason,
      action: "route_query",
      observation: `Escalating query to: ${activeAgent}`
    });

    const emergencyResult = await EmergencySupportAgent.getEmergencyInstructions(query);
    masterLogs.push(...emergencyResult.logs);

    finalAgentResponse = `### 🚨 EMERGENCY FIRST-AID ACTIONS REQUIRED\n\n**${emergencyResult.title}**\n\n${emergencyResult.steps.map(step => `1. ${step}`).join("\n")}\n\n*Press the RED SOS button to broadcast your GPS coordinates to your emergency contacts.*`;
  }
  // B. Reminder Check
  else if (lowercaseQuery.includes("remind") || lowercaseQuery.includes("reminder") || lowercaseQuery.includes("alarm") || lowercaseQuery.includes("medicine schedule")) {
    activeAgent = ReminderAgent.name;
    routingReason = "Query relates to medicine alarms, vaccination alerts or appointment schedules. Redirecting to Health Reminder Agent.";
    masterLogs.push({
      agent: "Coordinator Orchestrator",
      thought: routingReason,
      action: "route_query",
      observation: `Routing to: ${activeAgent}`
    });

    // If query contains details like "Remind me to take Paracetamol at 9:00 PM"
    let title = "Medicine Dose";
    let time = "08:00 AM";
    let type = "medicine";

    const timeMatch = query.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm))/);
    if (timeMatch) time = timeMatch[1].toUpperCase();

    // Extract medicine name
    const medWords = ["take", "remind me to", "remind"];
    let tempTitle = query;
    medWords.forEach(w => {
      tempTitle = tempTitle.toLowerCase().replace(w, "").trim();
    });
    if (tempTitle.length > 5 && tempTitle.length < 50) {
      title = tempTitle.charAt(0).toUpperCase() + tempTitle.slice(1);
    }

    if (lowercaseQuery.includes("doctor") || lowercaseQuery.includes("appointment") || lowercaseQuery.includes("hospital")) {
      type = "appointment";
    } else if (lowercaseQuery.includes("vaccin") || lowercaseQuery.includes("polio")) {
      type = "vaccination";
    }

    const reminderResult = await ReminderAgent.createReminder(userId || "guest_user", {
      type,
      title,
      time,
      dosage: type === 'medicine' ? '1 dose' : ''
    });
    masterLogs.push(...reminderResult.logs);

    finalAgentResponse = `I have successfully scheduled a health reminder for you:\n- **Task**: ${reminderResult.reminder.title}\n- **Category**: ${reminderResult.reminder.type}\n- **Scheduled Time**: ${reminderResult.reminder.time}\n\nYou will receive a notification alert in your dashboard.`;
  }
  // C. Healthcare Facility Discovery Check
  else if (lowercaseQuery.includes("hospital") || lowercaseQuery.includes("clinic") || lowercaseQuery.includes("pharmacy") || lowercaseQuery.includes("chemist") || lowercaseQuery.includes("doctor near") || lowercaseQuery.includes("medical store")) {
    activeAgent = HealthcareDiscoveryAgent.name;
    routingReason = "Query is checking for physical healthcare facility locations. Routing to Healthcare Discovery Agent.";
    masterLogs.push({
      agent: "Coordinator Orchestrator",
      thought: routingReason,
      action: "route_query",
      observation: `Routing to: ${activeAgent}`
    });

    let searchType = null;
    if (lowercaseQuery.includes("hospital")) searchType = "Hospital";
    else if (lowercaseQuery.includes("clinic")) searchType = "Clinic";
    else if (lowercaseQuery.includes("pharmacy") || lowercaseQuery.includes("chemist")) searchType = "Pharmacy";
    else if (lowercaseQuery.includes("center") || lowercaseQuery.includes("government")) searchType = "Government Health Center";

    const discoveryResult = await HealthcareDiscoveryAgent.findNearbyFacilities(
      currentCoordinates?.lat,
      currentCoordinates?.lng,
      searchType
    );
    masterLogs.push(...discoveryResult.logs);

    if (discoveryResult.facilities.length > 0) {
      const facilityLines = discoveryResult.facilities.map((fac, idx) => 
        `${idx + 1}. **${fac.name}** (${fac.type})\n   📍 Address: ${fac.address}\n   📞 Phone: [${fac.phone}](tel:${fac.phone.replace(/\s+/g, '')}) | 🚗 Distance: **${fac.distance} km**\n   🩺 Services: ${fac.services.join(", ")}`
      ).join("\n\n");
      finalAgentResponse = `Here are the nearest healthcare facilities found based on your location:\n\n${facilityLines}`;
    } else {
      finalAgentResponse = "We could not find any matching healthcare centers in our immediate rural database. Please try widening your search or check your internet connection.";
    }
  }
  // D. Medical Explanation Check
  else if (lowercaseQuery.includes("explain") || lowercaseQuery.includes("what is") || lowercaseQuery.includes("report") || lowercaseQuery.includes("summarize") || lowercaseQuery.includes("meaning of") || lowercaseQuery.includes("definition")) {
    activeAgent = MedicalExplanationAgent.name;
    routingReason = "Query relates to a medical term, test result abbreviation, or medical document summary. Routing to Medical Explanation Agent.";
    masterLogs.push({
      agent: "Coordinator Orchestrator",
      thought: routingReason,
      action: "route_query",
      observation: `Routing to: ${activeAgent}`
    });

    let term = query.replace(/explain|what is|meaning of|definition/gi, "").trim();
    if (!term) term = "hypertension";

    const explanationResult = await MedicalExplanationAgent.explainTerm(term, apiKey);
    masterLogs.push(...explanationResult.logs);

    finalAgentResponse = `Here is a simplified explanation for **${explanationResult.term}**:\n\n${explanationResult.explanation}`;
  }
  // E. Default: Health Assessment / Symptom analysis
  else {
    activeAgent = HealthAssessmentAgent.name;
    routingReason = "General medical question or symptoms described. Routing to Health Assessment Agent.";
    masterLogs.push({
      agent: "Coordinator Orchestrator",
      thought: routingReason,
      action: "route_query",
      observation: `Routing to: ${activeAgent}`
    });

    const assessmentResult = await HealthAssessmentAgent.assessSymptoms(
      query,
      userProfile?.medicalHistory || {},
      apiKey
    );
    masterLogs.push(...assessmentResult.logs);

    finalAgentResponse = `### Symptom Assessment Guidance\n\n**Urgency level**: ${assessmentResult.urgency}\n\n${assessmentResult.guidance}\n\n*This is an informational guidance sheet, not a doctor's diagnosis.*`;
    
    if (assessmentResult.followUpQuestions.length > 0) {
      finalAgentResponse += `\n\n**To help me understand better, could you answer:**\n` + 
        assessmentResult.followUpQuestions.map(q => `- ${q}`).join("\n");
    }
  }

  // 3. Multilingual Translation Phase
  if (userLanguage && userLanguage !== 'en') {
    masterLogs.push({
      agent: "Coordinator Orchestrator",
      thought: `Activating Language Assistance Agent to translate final response into [Language: ${userLanguage}].`,
      action: "translate_final_response",
      observation: `Requesting translation to: ${userLanguage}`
    });

    try {
      const translatedResponse = await LanguageAssistanceAgent.translate(finalAgentResponse, userLanguage, apiKey);
      masterLogs.push({
        agent: LanguageAssistanceAgent.name,
        thought: `Translation complete. Output rendered in ${userLanguage === 'hi' ? 'Hindi' : 'Marathi'}.`,
        action: "translation_finish",
        observation: "Payload translation finalized."
      });
      finalAgentResponse = translatedResponse;
    } catch (err) {
      console.error("Translation agent failed:", err);
    }
  }

  masterLogs.push({
    agent: "Coordinator Orchestrator",
    thought: "Response routing cycle complete. Dispatching results to frontend client.",
    action: "session_dispatch",
    observation: "Sending payload."
  });

  return {
    response: finalAgentResponse,
    logs: masterLogs,
    activeAgent,
    language: userLanguage,
    userProfile
  };
}
