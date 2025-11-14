const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  agreementText: { type: String, required: true },
  signedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Agreement', agreementSchema);
