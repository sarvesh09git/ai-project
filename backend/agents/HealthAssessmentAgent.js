import { callGemini } from './geminiHelper.js';

// Predefined medical red-flags for immediate local emergency detection
const RED_FLAGS = [
  "chest pain", "breathing difficulty", "shortness of breath", "severe bleeding", 
  "unconscious", "stroke", "paralysis", "snake bite", "poison", "heart attack",
  "choking", "severe head injury", "high fever with stiff neck"
];

const DOCTOR_SIGNS = [
  "fever", "cough", "abdominal pain", "vomiting", "diarrhea", "dizziness", 
  "ear pain", "joint pain", "rash", "burning urination", "sugar", "diabetes", 
  "blood pressure", "hypertension", "swelling"
];

export const HealthAssessmentAgent = {
  name: "Health Assessment Agent",

  async assessSymptoms(symptomsText, medicalHistory = {}, apiKey) {
    const logs = [];
    logs.push({
      agent: this.name,
      thought: `Analyzing patient symptoms: "${symptomsText}". Checking historical context: ${JSON.stringify(medicalHistory)}`,
      action: "symptom_analysis",
      observation: "Scanning text for emergency red-flags and doctor indicators."
    });

    // Check for emergencies first
    const containsRedFlag = RED_FLAGS.some(flag => 
      symptomsText.toLowerCase().includes(flag)
    );

    if (containsRedFlag) {
      logs.push({
        agent: this.name,
        thought: "Emergency red flag detected in user input! Escalating to Emergency Support Agent.",
        action: "escalate_to_emergency",
        observation: "Urgency set to Emergency."
      });
      return {
        urgency: "Emergency",
        guidance: "CRITICAL ALERT: Life-threatening or high-risk symptom detected. Please seek medical assistance immediately or press the SOS button to alert contacts and share GPS coordinates. Avoid strenuous movement. If snakebite, keep the bitten limb immobilized below heart level.",
        followUpQuestions: [],
        logs
      };
    }

    if (apiKey) {
      try {
        const systemPrompt = `You are the Health Assessment Agent of SwasthyaAI, a rural healthcare navigator. 
        Analyze the patient's symptoms. Decide their urgency level strictly as one of:
        - "Emergency" (for chest pain, breathing issues, severe trauma, snake bites, unconsciousness)
        - "Doctor consultation recommended" (for persistent fevers, infections, chronic conditions, moderate pain)
        - "General health guidance" (for mild cold, simple fatigue, basic hygiene, general nutrition queries)

        Patient medical context (allergies, conditions): ${JSON.stringify(medicalHistory)}. Consider allergies when making suggestions.
        
        Strict Guidelines:
        1. DO NOT diagnose specific diseases (e.g. do not say "You have malaria"). Instead, list potential symptoms to discuss with a doctor.
        2. Keep language simple, empathetic, and clear for rural users.
        3. Recommend professional medical help whenever in doubt.
        4. Suggest 2-3 follow-up questions to ask the patient to narrow down the condition.
        
        Format your response as a strict JSON object with this structure:
        {
          "urgency": "Emergency | Doctor consultation recommended | General health guidance",
          "guidance": "Clear explanation of what to do, home wellness advice, what precautions to take, reminding them to see a doctor if needed. Keep it under 150 words.",
          "followUpQuestions": ["question 1", "question 2"]
        }`;

        const prompt = `Patient Symptoms: "${symptomsText}"`;
        const response = await callGemini(prompt, apiKey, systemPrompt);
        
        // Strip code block formatting if any
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith("```json")) {
          cleanResponse = cleanResponse.substring(7);
        }
        if (cleanResponse.startsWith("```")) {
          cleanResponse = cleanResponse.substring(3);
        }
        if (cleanResponse.endsWith("```")) {
          cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3);
        }
        
        const result = JSON.parse(cleanResponse.trim());
        logs.push({
          agent: this.name,
          thought: `Gemini successfully assessed symptoms. Decided level: ${result.urgency}.`,
          action: "gemini_reasoning",
          observation: "Obtained structured clinical urgency and guidance."
        });

        return {
          urgency: result.urgency,
          guidance: result.guidance,
          followUpQuestions: result.followUpQuestions || [],
          logs
        };
      } catch (err) {
        console.error("Gemini Health Assessment failed, falling back to rule-based:", err);
        logs.push({
          agent: this.name,
          thought: "Gemini assessment failed. Falling back to local rules.",
          action: "rule_fallback",
          observation: "Running rule-based classifier."
        });
      }
    }

    // Fallback Rule-Based Agent Reasoning
    let urgency = "General health guidance";
    let guidance = "You are describing mild symptoms. Rest well and drink plenty of clean, boiled water. Keep a close watch on your temperature and symptoms. If they persist for more than 24-48 hours, consult a healthcare worker at your local sub-center.";
    let followUpQuestions = [
      "How many days have you been experiencing these symptoms?",
      "Do you have any other symptoms like body pain or loss of appetite?"
    ];

    const containsDoctorSign = DOCTOR_SIGNS.some(sign => 
      symptomsText.toLowerCase().includes(sign)
    );

    if (containsDoctorSign) {
      urgency = "Doctor consultation recommended";
      guidance = "Your symptoms indicate moderate health concerns (e.g. possible infection or fever). We highly recommend visiting the nearest Primary Health Center (PHC) or consulting a local doctor. Keep resting, stay hydrated, and do not self-medicate with unprescribed antibiotics.";
      followUpQuestions = [
        "Is your body temperature higher than 100°F (37.8°C)?",
        "Have you taken any medication (like Paracetamol) in the last 12 hours?",
        "Are you experiencing any shivering or body aches?"
      ];
    }

    // Add user preference/allergy memory check to guidance
    if (medicalHistory.allergies && medicalHistory.allergies.length > 0) {
      guidance += ` (Note: Please remember you have documented allergies to: ${medicalHistory.allergies.join(", ")}. Avoid any self-care items containing these.)`;
    }

    logs.push({
      agent: this.name,
      thought: `Rule-based evaluation complete. Classification: ${urgency}`,
      action: "complete_assessment",
      observation: `Set urgency to ${urgency} with ${followUpQuestions.length} follow-up questions.`
    });

    return {
      urgency,
      guidance,
      followUpQuestions,
      logs
    };
  }
};
