import Facility from '../models/Facility.js';

// Haversine formula to compute distance in km between two sets of GPS coordinates
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// In-memory fallback dataset in case MongoDB is empty/not running
const FALLBACK_FACILITIES = [
  {
    name: "Shirur Primary Health Center (Govt)",
    type: "Government Health Center",
    latitude: 18.6298,
    longitude: 74.3792,
    address: "Nagar-Pune Road, Shirur Rural, Maharashtra 412210",
    phone: "+91 2138 222104",
    services: ["Maternity Care", "Immunization", "General OPD", "Free Diagnostics"],
    ruralFriendly: true,
  },
  {
    name: "Koregaon Bhima Community Clinic",
    type: "Clinic",
    latitude: 18.6414,
    longitude: 74.0815,
    address: "Gram Panchayat Road, Koregaon Bhima, Pune 412216",
    phone: "+91 98451 23098",
    services: ["General Physician", "Vaccinations", "First Aid Services"],
    ruralFriendly: true,
  },
  {
    name: "Rural Sub-District Hospital, Shikrapur",
    type: "Hospital",
    latitude: 18.6811,
    longitude: 74.1165,
    address: "Ch चौक, Shikrapur, Pune District, Maharashtra 412208",
    phone: "+91 2137 286200",
    services: ["24/7 Emergency Support", "In-patient Wards", "Pharmacy", "Laboratory Services", "X-Ray"],
    ruralFriendly: true,
  },
  {
    name: "Gramin Swasthya Medical & Pharmacy",
    type: "Pharmacy",
    latitude: 18.6830,
    longitude: 74.1190,
    address: "Market Yard Road, Shikrapur, Maharashtra 412208",
    phone: "+91 88776 65544",
    services: ["Essential Generic Medicines", "First-Aid Supplies", "Vaccine Storage"],
    ruralFriendly: true,
  },
  {
    name: "Lonikand Primary Health Sub-Center",
    type: "Government Health Center",
    latitude: 18.6115,
    longitude: 73.9922,
    address: "Near Water Tank, Lonikand, Pune 412216",
    phone: "+91 20 2701 9901",
    services: ["Mother & Child Wellness", "Tuberculosis Care", "Malaria Screening"],
    ruralFriendly: true,
  }
];

export const HealthcareDiscoveryAgent = {
  name: "Healthcare Discovery Agent",

  async findNearbyFacilities(userLat, userLng, filterType = null) {
    const logs = [];
    // Default location (e.g., Koregaon Bhima / Shikrapur area in Pune rural) if user coords are invalid/empty
    const lat = parseFloat(userLat) || 18.6414;
    const lng = parseFloat(userLng) || 74.0815;

    logs.push({
      agent: this.name,
      thought: `Locating facilities near coordinates (Lat: ${lat}, Lng: ${lng}). Filters: [Type: ${filterType || 'All'}].`,
      action: "database_query",
      observation: "Searching facilities collection in the database."
    });

    let facilities = [];
    try {
      // Attempt to load from MongoDB
      facilities = await Facility.find({});
      if (!facilities || facilities.length === 0) {
        // Fallback to memory
        facilities = FALLBACK_FACILITIES;
        logs.push({
          agent: this.name,
          thought: "Database collection empty, loading pre-seeded rural medical facility registry.",
          action: "load_in_memory_registry",
          observation: `Loaded ${FALLBACK_FACILITIES.length} base health locations.`
        });
      } else {
        logs.push({
          agent: this.name,
          thought: "Successfully loaded facilities from MongoDB.",
          action: "load_db_registry",
          observation: `Loaded ${facilities.length} items.`
        });
      }
    } catch (err) {
      console.error("DB query failed in discovery agent, using memory registry:", err);
      facilities = FALLBACK_FACILITIES;
      logs.push({
        agent: this.name,
        thought: "MongoDB connection inactive. Utilizing emergency memory-mapped health registry fallback.",
        action: "load_fallback_registry",
        observation: `Loaded ${FALLBACK_FACILITIES.length} items.`
      });
    }

    // Map distances and sort
    let nearList = facilities.map(f => {
      const doc = f.toObject ? f.toObject() : f;
      const distance = getDistanceFromLatLonInKm(lat, lng, doc.latitude, doc.longitude);
      return { ...doc, distance };
    });

    // Apply type filter if specified
    if (filterType) {
      const typeLower = filterType.toLowerCase();
      nearList = nearList.filter(f => {
        // Map common filter queries
        if (typeLower.includes("hospital")) return f.type === "Hospital";
        if (typeLower.includes("clinic")) return f.type === "Clinic";
        if (typeLower.includes("pharmacy") || typeLower.includes("medical store")) return f.type === "Pharmacy";
        if (typeLower.includes("center") || typeLower.includes("government")) return f.type === "Government Health Center";
        return f.type.toLowerCase().includes(typeLower);
      });
    }

    // Sort by distance ascending
    nearList.sort((a, b) => a.distance - b.distance);

    // Limit to top 5
    const topFacilities = nearList.slice(0, 5);

    logs.push({
      agent: this.name,
      thought: `Sorting and compiling distance tables. Found ${topFacilities.length} matching facilities.`,
      action: "distance_sort",
      observation: `Closest: ${topFacilities[0] ? topFacilities[0].name : "None"} (${topFacilities[0] ? topFacilities[0].distance : 0} km away)`
    });

    return {
      facilities: topFacilities,
      userCoordinates: { lat, lng },
      logs
    };
  }
};
