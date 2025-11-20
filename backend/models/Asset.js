const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., Home/Property, Vehicle, Business
  name: { type: String, required: true }, // Asset Name
  description: { type: String },
  value: { type: Number, required: true }, // Estimated Value (PKR)
  location: { type: String }, // Location of the asset
  photo: { type: String } // base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
