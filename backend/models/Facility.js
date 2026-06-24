import mongoose from 'mongoose';

const FacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Hospital', 'Clinic', 'Pharmacy', 'Government Health Center'],
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  services: [String], // e.g. ["24/7 Emergency", "Maternity", "Pharmacy", "Pediatrics"]
  ruralFriendly: {
    type: Boolean,
    default: true,
  },
});

// Create index for simple geo calculations or bounding box
FacilitySchema.index({ latitude: 1, longitude: 1 });

export default mongoose.models.Facility || mongoose.model('Facility', FacilitySchema);
