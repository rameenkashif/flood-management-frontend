require('dotenv').config();          // Load .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
const floodRoutes = require('./routes/floodRoutes');
const floodController = require('./Controllers/floodController');

const app = express();
const volunteerRoutes = require("./routes/volunteers");


// Middleware
app.use(cors());                     // Enable cross-origin requests
app.use(express.json());             // Parse JSON request bodies
app.use("/api/volunteers", volunteerRoutes);
// Routes
app.use('/api/users', userRoutes);       // User registration & login
app.use('/api/assets', assetRoutes);     // Asset management
app.use('/api/agreements', agreementRoutes); // Agreements
app.use('/api/floods', floodRoutes); // Flood alerts

// Test root route
app.get('/', (req, res) => {
  res.send('Flood Management Backend is running!');
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Periodically fetch external alerts (every 10 minutes)
const FETCH_INTERVAL_MS = Number(process.env.FETCH_INTERVAL_MS) || 10 * 60 * 1000;
setInterval(() => {
  floodController.fetchExternalAlerts()
    .then((r) => console.log(`Fetched ${r.length} external alerts`))
    .catch((e) => console.warn('Error fetching external alerts:', e.message || e));
}, FETCH_INTERVAL_MS);

// Also run once at startup
floodController.fetchExternalAlerts().catch(() => {});
