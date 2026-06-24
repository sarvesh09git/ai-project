import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import reminderRoutes from './routes/reminders.js';
import facilityRoutes from './routes/facilities.js';
import agentRoutes from './routes/agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Allow all origins for evaluation simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/agent', agentRoutes);

// Base Check Route
app.get('/', (req, res) => {
  res.json({ 
    message: "SwasthyaAI Rural Health Navigator API is active.",
    database: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Running on In-Memory Fallback Mode",
    gemini: process.env.GEMINI_API_KEY ? "Gemini LLM Agent Active" : "Local Rule-Based NLP Active"
  });
});

// Database Connection with fail-safe in-memory fallback
const dbUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/swasthya_ai';

console.log("Connecting to MongoDB at:", dbUrl);
mongoose.connect(dbUrl)
  .then(() => {
    console.log("✅ MongoDB database connection established successfully.");
  })
  .catch((err) => {
    console.warn("⚠️  MongoDB connection failed!");
    console.warn(err.message);
    console.warn("⚠️  SwasthyaAI Server will automatically fall back to JSON/Memory stores.");
    console.warn("⚠️  No actions needed. All routes remain active for local evaluation.");
  });

// Start Server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SwasthyaAI Server is running on port ${PORT}`);
    console.log(`👉 API Health Endpoint: http://localhost:${PORT}/`);
  });
}

export default app;
