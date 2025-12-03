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
const Alert = require('./models/Alert');
const ensureAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    console.log(`🔍 Checking for admin user: ${adminEmail}`);
    const admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      // Create admin with credentials: admin@gmail.com / password123
      console.log(`📝 Creating admin user...`);
      const adminUser = new User({ name: 'admin', email: adminEmail, phone: '0000000000', password: 'password123', role: 'admin' });
      await adminUser.save();
      console.log('✅ Default admin user created: admin@gmail.com / password123');
    } else {
      console.log('ℹ️ Admin user already exists:', adminEmail, 'Role:', admin.role);
    }
  } catch (err) {
    console.warn('⚠️ Failed to ensure admin user:', err && err.message ? err.message : err);
  }
};

// Clear all alerts from database on startup
const clearAllAlerts = async () => {
  try {
    const result = await Alert.deleteMany({});
    console.log(`🗑️ Cleared ${result.deletedCount} existing alerts from database`);
  } catch (err) {
    console.warn('⚠️ Failed to clear alerts:', err && err.message ? err.message : err);
  }
};

// Run admin creation best-effort after a short delay so DB connection is ready
setTimeout(() => {
  ensureAdmin().catch(() => {});
  clearAllAlerts().catch(() => {});
}, 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Periodically fetch external alerts (every 10 minutes by default)
const FETCH_INTERVAL_MS = Number(process.env.FETCH_INTERVAL_MS) || 10 * 60 * 1000;
console.log(`⏱️ Alert refresh interval set to ${FETCH_INTERVAL_MS / 1000} seconds (${FETCH_INTERVAL_MS / 60000} minutes)`);
setInterval(() => {
  floodController.fetchExternalAlerts()
    .then((r) => console.log(`✅ Periodic fetch: ${Array.isArray(r) ? r.length : 0} alerts updated`))
    .catch((e) => console.warn('⚠️ Error fetching external alerts:', e && e.message ? e.message : e));
}, FETCH_INTERVAL_MS);

// Run once at startup (best-effort)
if (typeof floodController.fetchExternalAlerts === 'function') {
  floodController.fetchExternalAlerts().catch(() => {});
}
