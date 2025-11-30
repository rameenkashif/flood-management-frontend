const express = require("express");
const Donation = require("../models/Donation");
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
const path = require('path');
const PAK_CITIES = require(path.join(__dirname, '../data/pakistan_cities.json'));

// GET all donations
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find();
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

    // build donation from request but override name/contact from user record
    const donationPayload = {
      ...req.body,
      name: user.name,
      contact: user.phone || user.email || '',
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
