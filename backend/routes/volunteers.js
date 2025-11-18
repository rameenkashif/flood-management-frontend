const express = require("express");
const router = express.Router();
const Volunteer = require("../models/Volunteer");

// ---------------------------------------------
// Register a new volunteer
// ---------------------------------------------
router.post("/", async (req, res) => {
  try {
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
