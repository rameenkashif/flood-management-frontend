const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    estimatedValue: { type: Number, required: true },
    targetRegion: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    status: {
      type: String,
      enum: ["In Transit", "Delivered"],
      default: "In Transit",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
