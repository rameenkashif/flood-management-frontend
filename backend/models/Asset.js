const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // house, vehicle, jewelry
  description: { type: String },
  value: { type: Number, required: true },
  status: { type: String, enum: ['safe', 'lost', 'damaged'], default: 'safe' },
  compensationClaimed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
