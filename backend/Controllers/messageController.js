const Message = require('../models/Message');

// GET /api/messages
// optional query: recipientId to fetch messages for a specific user, otherwise return all (broadcast + direct)
exports.listMessages = async (req, res) => {
  try {
    const { recipientId, limit = 200 } = req.query;
    const filter = {};
    if (recipientId) filter.$or = [ { recipientId }, { recipientId: null } ]; // direct to user or broadcasts
    // newest first
    const msgs = await Message.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(msgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages
// body: { recipientId (optional), message }
// requires auth middleware to populate req.user
exports.createMessage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const { recipientId = null, message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ message: 'Message cannot be empty' });
    const m = await Message.create({ senderId: req.user.id, senderName: req.user.name || 'Anonymous', recipientId: recipientId || null, message });
    res.status(201).json(m);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
