const mongoose = require('mongoose');

const ReliefCampSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  location: { type: String },
  contact: { type: String },
  totalCapacity: { type: Number, default: 0 },
  currentCapacity: { type: Number, default: 0 },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  facilities: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('ReliefCamp', ReliefCampSchema);
