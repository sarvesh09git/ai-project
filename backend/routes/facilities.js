import express from 'express';
import { HealthcareDiscoveryAgent } from '../agents/HealthcareDiscoveryAgent.js';
import { seedDB } from '../scripts/seedFacilities.js';
import Facility from '../models/Facility.js';

const router = express.Router();

// @route   GET api/facilities/nearby
// @desc    Find nearby clinics, hospitals, pharmacies
router.get('/nearby', async (req, res) => {
  const { lat, lng, type } = req.query;

  try {
    const { facilities, userCoordinates, logs } = await HealthcareDiscoveryAgent.findNearbyFacilities(lat, lng, type);
    res.json({ facilities, userCoordinates, logs });
  } catch (error) {
    console.error("Error retrieving facilities:", error);
    res.status(500).json({ message: "Failed to search nearby facilities", error: error.message });
  }
});

// @route   POST api/facilities/seed
// @desc    Seed facilities in database
router.post('/seed', async (req, res) => {
  try {
    await seedDB();
    res.json({ success: true, message: "Healthcare facilities seeded successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to seed facilities data", error: error.message });
  }
});

// @route   GET api/facilities/all
// @desc    Get all facilities loaded in the system
router.get('/all', async (req, res) => {
  try {
    let facilities = await Facility.find({});
    if (!facilities || facilities.length === 0) {
      // Return discovery fallback directly
      const result = await HealthcareDiscoveryAgent.findNearbyFacilities(null, null, null);
      facilities = result.facilities;
    }
    res.json(facilities);
  } catch (error) {
    const result = await HealthcareDiscoveryAgent.findNearbyFacilities(null, null, null);
    res.json(result.facilities);
  }
});

export default router;
