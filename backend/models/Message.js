const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = broadcast
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
