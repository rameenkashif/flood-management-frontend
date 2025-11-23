const express = require("express");
const router = express.Router();
const Volunteer = require("../models/Volunteer");
const path = require('path');
const PAK_CITIES = require(path.join(__dirname, '../data/pakistan_cities.json'));

// ---------------------------------------------
// Register a new volunteer
// ---------------------------------------------
router.post("/", async (req, res) => {
  try {
    const location = req.body.location;
    if (!location || !PAK_CITIES.includes(location)) return res.status(400).json({ error: 'Invalid location; must be a Pakistani city' });

    const volunteer = new Volunteer(req.body);
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

module.exports = router;
