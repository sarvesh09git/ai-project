import express from 'express';
import jwt from 'jsonwebtoken';
import { ReminderAgent } from '../agents/ReminderAgent.js';
import Reminder from '../models/Reminder.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'swasthya_ai_secret';

// Fallback in-memory store for reminders
const reminderMemoryDb = [];

// Authentication middleware helper
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Authorization token required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token is invalid or expired' });
  }
};

// @route   GET api/reminders
// @desc    Get all active reminders for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { reminders, logs } = await ReminderAgent.getUserReminders(req.userId);
    
    // If DB failed or returned empty, check memory store
    if (reminders.length === 0) {
      const memReminders = reminderMemoryDb.filter(r => r.userId === req.userId && r.active);
      return res.json({ reminders: memReminders, logs });
    }

    res.json({ reminders, logs });
  } catch (error) {
    console.error("Error retrieving reminders:", error);
    const memReminders = reminderMemoryDb.filter(r => r.userId === req.userId && r.active);
    res.json({ reminders: memReminders, logs: [] });
  }
});

// @route   POST api/reminders
// @desc    Create a new reminder
router.post('/', authenticateToken, async (req, res) => {
  const { type, title, time, date, dosage } = req.body;

  try {
    const { reminder, logs } = await ReminderAgent.createReminder(req.userId, {
      type,
      title,
      time,
      date,
      dosage
    });

    if (reminder.isMock) {
      reminderMemoryDb.push(reminder);
    }

    res.status(201).json({ reminder, logs });
  } catch (error) {
    console.error("Error creating reminder:", error);
    
    // Save to memory database as ultimate fallback
    const mockId = 'rem_' + Math.random().toString(36).substr(2, 9);
    const mockReminder = {
      _id: mockId,
      userId: req.userId,
      type,
      title,
      time,
      date: date || '',
      dosage: dosage || '',
      active: true,
      createdAt: new Date()
    };
    
    reminderMemoryDb.push(mockReminder);
    res.status(201).json({ reminder: mockReminder, logs: [] });
  }
});

// @route   PUT api/reminders/:id/deactivate
// @desc    Mark reminder as inactive (completed/deleted)
router.put('/:id/deactivate', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    try {
      const reminder = await Reminder.findById(id);
      if (reminder) {
        // Double check ownership
        if (reminder.userId.toString() !== req.userId) {
          return res.status(401).json({ message: 'User not authorized.' });
        }
        reminder.active = false;
        await reminder.save();
        return res.json({ success: true, reminder });
      }
    } catch (dbErr) {
      // run memory fallback
    }

    const idx = reminderMemoryDb.findIndex(r => r._id === id && r.userId === req.userId);
    if (idx !== -1) {
      reminderMemoryDb[idx].active = false;
      return res.json({ success: true, reminder: reminderMemoryDb[idx] });
    }

    res.status(404).json({ message: 'Reminder not found.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deactivating reminder.' });
  }
});

export default router;
