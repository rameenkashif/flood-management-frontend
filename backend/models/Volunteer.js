const mongoose = require("mongoose");

const VolunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  location: String,
  skill: { type: String, required: true },
  status: { type: String, default: "Available" },
});

module.exports = mongoose.model("Volunteer", VolunteerSchema);
