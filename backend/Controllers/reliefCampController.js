const ReliefCamp = require('../models/ReliefCamp');

// Get all relief camps
const getAllCamps = async (req, res) => {
  try {
    const camps = await ReliefCamp.find().sort({ createdAt: -1 });
    res.json(camps);
  } catch (err) {
    console.error('Error fetching relief camps:', err);
    res.status(500).json({ message: 'Failed to fetch relief camps' });
  }
};

// Add a new relief camp
const addCamp = async (req, res) => {
  try {
    const payload = req.body;

    // Ensure coordinates shape
    if (!payload.coordinates || typeof payload.coordinates.lat !== 'number' || typeof payload.coordinates.lng !== 'number') {
      return res.status(400).json({ message: 'Invalid or missing coordinates (lat, lng required as numbers)' });
    }

    const camp = new ReliefCamp({
      name: payload.name,
      region: payload.region,
      location: payload.location,
      contact: payload.contact,
      totalCapacity: Number(payload.totalCapacity) || 0,
      currentCapacity: Number(payload.currentCapacity) || 0,
      coordinates: payload.coordinates,
      facilities: Array.isArray(payload.facilities) ? payload.facilities : [],
    });

    const saved = await camp.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error adding relief camp:', err);
    res.status(500).json({ message: 'Failed to add relief camp' });
  }
};

module.exports = {
  getAllCamps,
  addCamp,
};
