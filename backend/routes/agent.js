import express from 'express';
import jwt from 'jsonwebtoken';
import { runOrchestrator } from '../agents/Orchestrator.js';
import { MedicalExplanationAgent } from '../agents/MedicalExplanationAgent.js';
import { EmergencySupportAgent } from '../agents/EmergencySupportAgent.js';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya_ai_secret';

// Optional token decoder (allows guest chats but tracks userId if logged in)
const decodeUserOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
    } catch (err) {
      console.warn("Invalid token in guest request, treating as anonymous guest.");
    }
  }
  next();
};

// @route   POST api/agent/query
// @desc    Process user chat message through multi-agent orchestrator
router.post('/query', decodeUserOptional, async (req, res) => {
  const { query, coordinates, language } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || null;

  if (!query) {
    return res.status(400).json({ message: "Please provide a query." });
  }

  try {
    const result = await runOrchestrator(
      req.userId || null,
      query,
      coordinates || {},
      language || 'en',
      apiKey
    );

    res.json(result);
  } catch (error) {
    console.error("Orchestrator execution error:", error);
    res.status(500).json({ 
      message: "An error occurred while processing the agents workflow.", 
      error: error.message 
    });
  }
});

// @route   POST api/agent/report
// @desc    Process uploaded medical report summary
router.post('/report', decodeUserOptional, async (req, res) => {
  const { reportText } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || null;

  if (!reportText) {
    return res.status(400).json({ message: "Please upload or paste medical report contents." });
  }

  try {
    const { summary, logs } = await MedicalExplanationAgent.summarizeReport(reportText, apiKey);
    res.json({ summary, logs });
  } catch (error) {
    console.error("Report processing error:", error);
    res.status(500).json({ message: "Failed to summarize medical report.", error: error.message });
  }
});

// @route   POST api/agent/sos
// @desc    Trigger emergency SOS notifications and retrieve steps
router.post('/sos', decodeUserOptional, async (req, res) => {
  const { coordinates } = req.body;
  
  try {
    let contactsList = [];
    if (req.userId) {
      try {
        const user = await User.findById(req.userId);
        if (user && user.emergencyContacts) {
          contactsList = user.emergencyContacts;
        }
      } catch (dbErr) {
        console.warn("Could not query DB for emergency contacts, using defaults.");
      }
    }

    // Default emergency contacts if user has none configured or is guest
    if (contactsList.length === 0) {
      contactsList = [
        { name: "Gram Sevak / Village Head", phone: "+91 94220 12345", relation: "Local Leader" },
        { name: "Rural Ambulance Service", phone: "108", relation: "Helpline" }
      ];
    }

    const sosResult = await EmergencySupportAgent.triggerSOSAlert(
      req.userId || "guest_user",
      coordinates,
      contactsList
    );

    res.json(sosResult);
  } catch (error) {
    console.error("SOS Trigger failure:", error);
    res.status(500).json({ message: "Emergency SOS broadcast execution failed.", error: error.message });
  }
});

export default router;
