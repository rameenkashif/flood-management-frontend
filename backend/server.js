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
const messageRoutes = require('./routes/messageRoutes');
const locationRoutes = require('./routes/locationRoutes');
const volunteerRoutes = require('./routes/volunteers');
const donationRoutes = require('./routes/donationRoutes');
const reliefRoutes = require('./routes/reliefRoutes');

const app = express();

app.use(cors());
// Increase body size limits to allow data-URL images sent from the frontend
// Note: data URLs can be large — consider using multipart upload to avoid sending large base64 in JSON.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/floods', floodRoutes);
app.use('/api/relief-camps', reliefRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/locations', locationRoutes);

// Test root route
app.get('/', (req, res) => res.send('Flood Management Backend is running!'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Ensure admin user exists (create default admin if missing)
const User = require('./models/User');
const ensureAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin';
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const adminUser = new User({ name: 'admin', email: adminEmail, phone: '0000000000', password: process.env.ADMIN_PASSWORD || 'admin123', role: 'admin' });
      await adminUser.save();
      console.log('✅ Default admin user created:', adminEmail);
    } else {
      console.log('ℹ️ Admin user already exists:', adminEmail);
    }
  } catch (err) {
    console.warn('⚠️ Failed to ensure admin user:', err && err.message ? err.message : err);
  }
};

// Run admin creation best-effort after a short delay so DB connection is ready
setTimeout(() => ensureAdmin().catch(() => {}), 1000);

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
