const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const assetRoutes = require('./routes/assetRoutes');
const agreementRoutes = require('./routes/agreementRoutes');
const floodRoutes = require('./routes/floodRoutes');
const floodController = require('./Controllers/floodController_fixed');
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donationRoutes');
const reliefRoutes = require('./routes/reliefRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/floods', floodRoutes);
app.use('/api/relief-camps', reliefRoutes);

// Test root route
app.get('/', (req, res) => res.send('Flood Management Backend is running!'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Periodically fetch external alerts
const FETCH_INTERVAL_MS = Number(process.env.FETCH_INTERVAL_MS) || 10 * 60 * 1000;
setInterval(() => {
  floodController.fetchExternalAlerts()
    .then((r) => console.log(`Fetched ${Array.isArray(r) ? r.length : r} external alerts`))
    .catch((e) => console.warn('Error fetching external alerts:', e && e.message ? e.message : e));
}, FETCH_INTERVAL_MS);

// Run once at startup (best-effort)
if (typeof floodController.fetchExternalAlerts === 'function') {
  floodController.fetchExternalAlerts().catch(() => {});
}
