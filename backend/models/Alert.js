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

// Note: do NOT create a TTL index here if you want to keep previous (inactive) alerts.
// If you later want automatic deletion, create a TTL index manually with a suitable expiry (e.g. 30 days).

module.exports = mongoose.model('Alert', alertSchema);
