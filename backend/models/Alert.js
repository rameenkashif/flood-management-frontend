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
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
