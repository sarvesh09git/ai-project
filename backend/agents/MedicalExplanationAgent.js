import { callGemini } from './geminiHelper.js';

// Predefined dictionary of medical terms for plain-English/local fallback translation
const MEDICAL_GLOSSARY = {
  "hypertension": "High blood pressure. It means your heart is working harder than normal to pump blood through your body. Can lead to headaches or dizziness.",
  "hypotension": "Low blood pressure. It means the pressure of blood flowing in your body is lower than normal, which can cause you to feel dizzy or weak.",
  "diabetes": "High sugar in the blood. Occurs when your body doesn't produce or use insulin correctly. Requires monitoring diet and avoiding sweet foods.",
  "ecg": "Electrocardiogram (ECG). A simple test that records the electrical activity and rhythm of your heart to make sure it is beating properly.",
  "cbc": "Complete Blood Count (CBC). A common blood test that counts your red cells (for energy), white cells (to fight infection), and platelets (to stop bleeding).",
  "lipid profile": "Cholesterol test. Measures the amount of fat in your blood. High cholesterol can block your blood pipes (blood vessels) over time.",
  "hemoglobin": "Hb. The substance in your red blood cells that carries oxygen to your whole body. Low Hb causes fatigue, weakness, and is called anemia.",
  "creatinine": "A waste product in your blood. If it is high, it tells us that your kidneys might not be cleaning your blood as well as they should.",
  "mri": "Magnetic Resonance Imaging. A big scanner that takes highly detailed pictures of your internal organs and bones using magnets instead of X-rays.",
  "anaemia": "Low blood count. Means you have fewer red blood cells, which causes fatigue. Eating iron-rich foods like green leafy vegetables can help."
};

export const MedicalExplanationAgent = {
  name: "Medical Explanation Agent",

  async explainTerm(term, apiKey) {
    const logs = [];
    logs.push({
      agent: this.name,
      thought: `User requested explanation of term: "${term}".`,
      action: "glossary_lookup",
      observation: "Searching local medical vocabulary."
    });

    const termLower = term.toLowerCase().trim();

    if (apiKey) {
      try {
        const systemPrompt = `You are the Medical Explanation Agent of SwasthyaAI. 
        Explain the medical term in extremely simple, patient-friendly language. 
        Avoid technical jargon. If you must use a medical word, explain it immediately with an analogy.
        Keep it brief (1-2 sentences). 
        Make it clear and helpful for a rural user with limited literacy.`;
        const explanation = await callGemini(`Explain: "${term}"`, apiKey, systemPrompt);
        
        logs.push({
          agent: this.name,
          thought: "Gemini successfully simplified the medical term.",
          action: "gemini_simplification",
          observation: "Explanation retrieved."
        });

        return {
          term,
          explanation: explanation.trim(),
          logs
        };
      } catch (err) {
        console.error("Gemini explanation failed, using local dictionary:", err);
      }
    }

    // Fallback dictionary search
    let explanation = "We could not find this specific term in our offline database. However, please consult a health worker. Always remember to ask your doctor to explain any word you do not understand.";
    for (const [key, value] of Object.entries(MEDICAL_GLOSSARY)) {
      if (termLower.includes(key) || key.includes(termLower)) {
        explanation = value;
        logs.push({
          agent: this.name,
          thought: `Found match for term "${term}" in medical glossary database.`,
          action: "dictionary_match",
          observation: `Retrieved definition for: ${key}`
        });
        break;
      }
    }

    if (explanation === MEDICAL_GLOSSARY[termLower] === undefined) {
      logs.push({
        agent: this.name,
        thought: `No dictionary match for term "${term}". Returning standard safety warning.`,
        action: "no_match_warning",
        observation: "Safety warning returned."
      });
    }

    return {
      term,
      explanation,
      logs
    };
  },

  async summarizeReport(reportText, apiKey) {
    const logs = [];
    logs.push({
      agent: this.name,
      thought: "Analyzing uploaded medical report contents.",
      action: "report_parsing",
      observation: `Report text length: ${reportText.length} characters.`
    });

    if (apiKey) {
      try {
        const systemPrompt = `You are the Medical Explanation Agent of SwasthyaAI. 
        Summarize the uploaded medical report in simple, layperson language.
        Guidelines:
        1. Focus on the main numbers (e.g. blood pressure, hemoglobin, blood sugar, kidney levels).
        2. Clearly state if any number is marked as 'High', 'Low', or 'Abnormal'.
        3. Explain what those numbers mean in daily life terms (e.g., if Hemoglobin is low, say "Your energy cells are low, you might feel tired").
        4. Provide general lifestyle or dietary guidelines (e.g., drink more water, reduce sugar).
        5. DO NOT give a medical diagnosis. Urge them to show this report to their doctor.
        6. Limit summary to 150 words. Use bullet points for readability.`;
        
        const summary = await callGemini(reportText, apiKey, systemPrompt);
        
        logs.push({
          agent: this.name,
          thought: "Gemini successfully generated a layperson summary of the medical report.",
          action: "gemini_summarize",
          observation: "Summary compiled."
        });

        return {
          summary: summary.trim(),
          logs
        };
      } catch (err) {
        console.error("Gemini report summary failed, falling back to rule-based:", err);
      }
    }

    // Fallback Rule-Based Parser
    logs.push({
      agent: this.name,
      thought: "Using fallback text keyword parser for report analysis.",
      action: "keyword_extraction",
      observation: "Searching for clinical markers (Hb, Blood Pressure, Sugar)."
    });

    const reportLower = reportText.toLowerCase();
    let findings = [];

    // Parse simple indicators
    if (reportLower.includes("glucose") || reportLower.includes("sugar") || reportLower.includes("hba1c")) {
      findings.push("• **Blood Sugar Level**: Mentioned in the report. If values are above 100 mg/dL (fasting) or 140 mg/dL (after food), consult your doctor about managing diabetes. Avoid sugary foods, sweets, and high-carb grains.");
    }
    if (reportLower.includes("hemoglobin") || reportLower.includes(" hb ") || reportLower.includes("hb:")) {
      findings.push("• **Hemoglobin (Hb)**: Measures oxygen transport in your blood. If it is below 12 g/dL, you may have Anemia. Eating green spinach, beetroots, and dates can help improve your iron levels.");
    }
    if (reportLower.includes("pressure") || reportLower.includes(" bp ") || reportLower.includes("systolic")) {
      findings.push("• **Blood Pressure (BP)**: Mentioned in the report. Standard range is around 120/80. If it is higher than 140/90, please check with a healthcare provider. Reduce salt in your daily meals.");
    }
    if (reportLower.includes("cholesterol") || reportLower.includes("lipid") || reportLower.includes("ldl")) {
      findings.push("• **Cholesterol (Lipid)**: High fats in the blood. If values are elevated, try to avoid fried foods, refined oils, and butter, and engage in daily physical walking.");
    }

    if (findings.length === 0) {
      findings.push("• **General Analysis**: The report contains general medical terms. We did not detect any high-risk abnormalities, but we highly recommend sharing these results with your local primary healthcare worker for proper verification.");
    }

    const summary = `### Summary of Uploaded Medical Document\n\nBased on our offline analysis, here is what we noticed in your report:\n\n${findings.join("\n\n")}\n\n**Important Warning**: This summary is generated by AI to help you understand terms. It is NOT a professional diagnosis. Please show your report to a qualified doctor or nurse.`;

    logs.push({
      agent: this.name,
      thought: "Fallback report summary complete.",
      action: "compile_fallback_summary",
      observation: `Compiled summary with ${findings.length} findings.`
    });

    return {
      summary,
      logs
    };
  }
};
