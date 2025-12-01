const express = require("express");
const Donation = require("../models/Donation");
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
const path = require('path');
const PAK_CITIES = require(path.join(__dirname, '../data/pakistan_cities.json'));

// GET donations - admin can see all, regular users see only their own
router.get("/", protect, async (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      const donations = await Donation.find().populate('userId', 'name email phone');
      return res.json(donations);
    }

    // regular users: show only their donations
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });
    const donations = await Donation.find({ userId });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a donation (authenticated) - use authenticated user info for name/contact
router.post("/", protect, async (req, res) => {
  try {
    const region = req.body.targetRegion;
    if (!region || !PAK_CITIES.includes(region)) return res.status(400).json({ message: 'Invalid targetRegion; must be a Pakistani city' });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Authentication required to create a donation' });

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    // Prevent admin from creating donations
    if (user.role === 'admin') return res.status(403).json({ message: 'Admin users cannot create donations' });

    // build donation from request but override name/contact from user record
    const donationPayload = {
      ...req.body,
      name: user.name,
      contact: user.phone || user.email || '',
      userId: userId,
    };

    const donation = new Donation(donationPayload);
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE donation status
router.put("/:id", async (req, res) => {
  try {
    const updated = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a donation
router.delete("/:id", async (req, res) => {
  try {
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: "Donation deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
