const FIRST_AID_GUIDELINES = {
  snakebite: {
    title: "Snakebite Emergency First-Aid",
    steps: [
      "Keep the patient calm and completely still. Movement spreads venom faster.",
      "Keep the bitten limb positioned BELOW the level of the heart.",
      "Remove tight clothing, rings, or shoes, as swelling will occur.",
      "Do NOT cut or suck the wound. Do NOT apply ice or tight ropes (tourniquets).",
      "Do NOT give alcohol, tea, coffee, or aspirin.",
      "RUSH the patient to the nearest Government Hospital or Primary Health Center. Ask for Anti-Snake Venom (ASV)."
    ]
  },
  heart_attack: {
    title: "Heart Attack / Severe Chest Pain First-Aid",
    steps: [
      "Have the person sit down, rest, and try to remain calm.",
      "Loosen any tight clothing around the neck and waist.",
      "If the person is conscious, ask if they carry emergency medication (like Sorbitrate or Aspirin 325mg) and help them take it.",
      "If unconscious and not breathing, start CPR (press hard and fast in the center of the chest) immediately.",
      "Call for an ambulance or transport them to the nearest cardiac center immediately."
    ]
  },
  bleeding: {
    title: "Severe Bleeding First-Aid",
    steps: [
      "Apply direct pressure to the wound using a clean cloth, bandage, or even clean hands.",
      "Keep pressing firmly until the bleeding stops.",
      "If the wound is on an arm or leg, elevate the limb above the heart if possible, while keeping pressure applied.",
      "Do NOT wash deep wounds or try to remove embedded objects yourself. Just press around them.",
      "Wrap a clean bandage firmly over the cloth. If blood leaks through, add another cloth on top; do not remove the first one."
    ]
  },
  heatstroke: {
    title: "Severe Heatstroke / Dehydration First-Aid",
    steps: [
      "Move the person out of the hot sun and into a cool, shaded area or fan-cooled room.",
      "Cool the person down by sponging their body with cool water or placing wet cloths on their forehead, neck, and underarms.",
      "If they are fully awake and conscious, give them cool water to drink in small sips, or Oral Rehydration Salts (ORS) / coconut water.",
      "Do NOT give anything to drink if they are vomiting, confused, or unconscious.",
      "If their body temperature stays extremely high, rush them to a clinic."
    ]
  },
  choking: {
    title: "Choking (Blocked Airway) First-Aid",
    steps: [
      "Stand behind the person, wrap your arms around their waist, and lean them forward.",
      "Give up to 5 sharp blows between their shoulder blades using the heel of your hand.",
      "If blocked, perform Heimlich maneuver: Place a fist just above their belly button, grasp with your other hand, and pull sharply inward and upward.",
      "Repeat until the object comes out. If they lose consciousness, lay them flat and start chest compressions."
    ]
  },
  general: {
    title: "General Emergency First-Aid Guidelines",
    steps: [
      "Call the local emergency helpline immediately (e.g. 108 in India for government ambulance).",
      "Do not panic. Reassure the patient.",
      "Keep them warm and comfortable. Do not move them if spinal injury is suspected.",
      "Clear the area to allow fresh air flow."
    ]
  }
};

export const EmergencySupportAgent = {
  name: "Emergency Support Agent",

  detectEmergencyType(query) {
    const text = query.toLowerCase();
    if (text.includes("snake") || text.includes("bite") || text.includes("poison")) return "snakebite";
    if (text.includes("chest pain") || text.includes("heart") || text.includes("attack") || text.includes("breath")) return "heart_attack";
    if (text.includes("bleed") || text.includes("blood") || text.includes("cut") || text.includes("wound")) return "bleeding";
    if (text.includes("heat") || text.includes("stroke") || text.includes("dehydrat") || text.includes("sun")) return "heatstroke";
    if (text.includes("chok") || text.includes("throat") || text.includes("swallow")) return "choking";
    return "general";
  },

  async triggerSOSAlert(userId, userCoords, contactsList) {
    const logs = [];
    const lat = userCoords?.lat || "Unknown Latitude";
    const lng = userCoords?.lng || "Unknown Longitude";

    logs.push({
      agent: this.name,
      thought: `SOS Alert Activated for user ${userId}. Retrieving location coordinates (Lat: ${lat}, Lng: ${lng}).`,
      action: "locate_user",
      observation: `Coordinates resolved: ${lat}, ${lng}`
    });

    logs.push({
      agent: this.name,
      thought: `Broadcasting emergency details to ${contactsList.length} registered contacts: ${JSON.stringify(contactsList)}`,
      action: "sms_broadcast_sim",
      observation: "Simulated emergency text notifications dispatched successfully."
    });

    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const smsMessage = `EMERGENCY ALERT from SwasthyaAI! Your contact is in critical medical distress. Current location: ${googleMapsLink}. Please help immediately.`;

    return {
      success: true,
      smsMessage,
      googleMapsLink,
      contactsAlerted: contactsList,
      logs
    };
  },

  async getEmergencyInstructions(query) {
    const logs = [];
    const type = this.detectEmergencyType(query);
    
    logs.push({
      agent: this.name,
      thought: `Emergency query parsed. Classified emergency type: ${type.toUpperCase()}`,
      action: "load_first_aid_guidelines",
      observation: `Retrieved ${FIRST_AID_GUIDELINES[type].steps.length} first-aid safety steps.`
    });

    return {
      urgency: "Emergency",
      emergencyType: type,
      title: FIRST_AID_GUIDELINES[type].title,
      steps: FIRST_AID_GUIDELINES[type].steps,
      logs
    };
  }
};
