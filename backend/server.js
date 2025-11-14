require('dotenv').config();          // Load .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const agreementRoutes = require('./routes/agreementRoutes');

const app = express();

// Middleware
app.use(cors());                     // Enable cross-origin requests
app.use(express.json());             // Parse JSON request bodies

// Routes
app.use('/api/users', userRoutes);       // User registration & login
app.use('/api/assets', assetRoutes);     // Asset management
app.use('/api/agreements', agreementRoutes); // Agreements

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
