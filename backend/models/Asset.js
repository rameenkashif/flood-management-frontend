const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g., Home/Property, Vehicle, Business
  name: { type: String, required: true }, // Asset Name
  description: { type: String },
<<<<<<< HEAD
  value: { type: Number, required: true }, // Estimated Value (PKR)
  location: { type: String }, // Location of the asset
  photo: { type: String } // base64 or URL
=======
  location: { type: String },
  value: { type: Number, required: true },
  status: { type: String, enum: ['safe', 'lost', 'damaged'], default: 'safe' },
  compensationClaimed: { type: Boolean, default: false }
>>>>>>> 05e78a24e2cac081fd83e44857535dc95066cc9b
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
