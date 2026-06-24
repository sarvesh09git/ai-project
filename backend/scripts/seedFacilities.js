import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Facility from '../models/Facility.js';

dotenv.config();

const facilitiesData = [
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
  },
  {
    name: "Saraswati Multi-Specialty Rural Hospital",
    type: "Hospital",
    latitude: 18.5990,
    longitude: 74.0150,
    address: "Pune-Nagar Road, Wagholi East, Maharashtra 412207",
    phone: "+91 20 6754 1100",
    services: ["24/7 Trauma Care", "Pediatrics", "Ambulance Link", "Intensive Care Unit (ICU)"],
    ruralFriendly: false,
  },
  {
    name: "Jan Aushadhi Kendra (Affordable Generic Meds)",
    type: "Pharmacy",
    latitude: 18.6255,
    longitude: 74.3750,
    address: "Opposite Bus Stand, Shirur Town, Maharashtra 412210",
    phone: "+91 90112 34455",
    services: ["Affordable Generic Medications", "Senior Citizen Discounts"],
    ruralFriendly: true,
  }
];

export async function seedDB() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/swasthya_ai";
    console.log("Seeding facilities data...");
    
    // Connect to database if mongoose not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    
    await Facility.deleteMany({});
    console.log("Deleted existing facilities.");
    
    const created = await Facility.insertMany(facilitiesData);
    console.log(`Seeded ${created.length} healthcare facilities successfully.`);
  } catch (error) {
    console.error("Error seeding facilities database:", error);
  }
}

// Support running directly
if (process.argv[1] && process.argv[1].endsWith('seedFacilities.js')) {
  seedDB().then(() => {
    console.log("Done seeding. Exiting.");
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
