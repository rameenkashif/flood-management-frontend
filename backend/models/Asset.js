const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Asset type shown in the UI (e.g. 'Home/Property', 'Vehicle', 'Jewelry', 'Other')
  type: { type: String, required: true },
  // Human readable asset name/title from the form
  name: { type: String, required: true },
  // Longer description
  description: { type: String },
  // Primary monetary value coming from the frontend form (field named `value`)
  // The frontend currently sends `value` (Estimated Value (PKR) input). Keep as required.
  value: { type: Number, required: true },
  // Legacy/alternate field: estimatedValue (optional). Either `value` or `estimatedValue` may be present.
  estimatedValue: { type: Number },
  // Currency for the estimated value (project uses PKR by default)
  currency: { type: String, default: 'PKR' },
  // Location string (city/area) selected from the frontend list
  location: { type: String },
  // Photo data: the frontend currently stores resized image as a data URL in `photo`.
  // We accept both `photo` (data URL) and `photoUrl` (hosted URL) for compatibility.
  photo: { type: String },
  photoUrl: { type: String },
  // Backwards-compatible field: keep existing `value` if other code relies on it
  value: { type: Number },
  status: { type: String, enum: ['safe', 'lost', 'damaged'], default: 'safe' },
  compensationClaimed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
