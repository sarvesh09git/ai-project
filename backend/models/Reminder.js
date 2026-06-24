import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['medicine', 'appointment', 'vaccination'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  time: {
    type: String, // e.g. "08:00 AM", "09:30 PM"
    required: true,
  },
  date: {
    type: String, // e.g. "2026-06-25", or daily (if empty)
    default: '',
  },
  dosage: {
    type: String, // e.g. "1 pill", "5ml"
    default: '',
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
