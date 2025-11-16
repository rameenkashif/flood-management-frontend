const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  region: { type: String, required: true },
  severity: { type: String, required: true },
  rainfall: { type: Number },
  waterLevel: { type: Number },
  affectedPopulation: { type: Number },
  message: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  source: { type: String },
  active: { type: Boolean, default: true },
  endsAt: { type: Date, default: null },
}, { timestamps: true });

// optional TTL index if you later want auto-deletion based on endsAt
alertSchema.index({ endsAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Alert', alertSchema);
