const express = require("express");
const router = express.Router();
const Volunteer = require("../models/Volunteer");
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const path = require('path');
const PAK_CITIES = require(path.join(__dirname, '../data/pakistan_cities.json'));

// ---------------------------------------------
// Register a new volunteer (authenticated) - use user identity
// ---------------------------------------------
router.post("/", protect, async (req, res) => {
  try {
    const location = req.body.location;
    if (!location || !PAK_CITIES.includes(location)) return res.status(400).json({ error: 'Invalid location; must be a Pakistani city' });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required to register as volunteer' });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Prevent admin from registering as volunteer
    if (user.role === 'admin') return res.status(403).json({ error: 'Admin users cannot register as volunteers' });

    // Build volunteer record from body but override name/phone from user record
    const volunteerPayload = {
      ...req.body,
      name: user.name,
      phone: user.phone || user.email || '',
    };

    const volunteer = new Volunteer(volunteerPayload);
    await volunteer.save();
    res.status(201).json({ message: "Volunteer registered", volunteer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------
// Get all volunteers
// ---------------------------------------------
router.get("/", async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------
// Admin: change volunteer status
// ---------------------------------------------
router.patch('/:id/status', protect, async (req, res) => {
  try {
    // only admin can change status
    if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required' });

    const id = req.params.id;
    const { status } = req.body;
    if (!status || (status !== 'Available' && status !== 'Deployed')) {
      return res.status(400).json({ error: 'Invalid status. Allowed: Available, Deployed' });
    }

    const volunteer = await Volunteer.findByIdAndUpdate(id, { status }, { new: true });
    if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
    res.json(volunteer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
