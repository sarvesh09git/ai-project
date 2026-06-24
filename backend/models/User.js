import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  primaryLanguage: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en',
  },
  medicalHistory: {
    allergies: [String],
    medications: [String],
    conditions: [String],
  },
  emergencyContacts: [
    {
      name: String,
      phone: String,
      relation: String,
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
