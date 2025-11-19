require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const path = require('path');

const uri = process.env.MONGO_URI;
const dbName = uri && uri.includes('/') ? uri.split('/').pop().split('?')[0] : 'flood_management';
const TTL_DAYS = Number(process.env.TTL_DAYS) || 30; // default 30 days

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const Alert = require('../models/Alert');
    const seconds = TTL_DAYS * 24 * 60 * 60;
    console.log(`Creating TTL index on alerts.endsAt with expireAfterSeconds=${seconds}`);
    // If an index named endsAt_1 exists, drop it first to avoid conflicts
    const existing = await Alert.collection.indexes();
    const hasEndsAt = existing.some(ix => ix.name === 'endsAt_1');
    if (hasEndsAt) {
      console.log('Dropping existing endsAt_1 index');
      try {
        await Alert.collection.dropIndex('endsAt_1');
      } catch (e) {
        console.warn('Failed to drop existing endsAt_1 index:', e.message || e);
      }
    }
    await Alert.collection.createIndex({ endsAt: 1 }, { expireAfterSeconds: seconds });
    console.log('TTL index created');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to create TTL index:', err);
    process.exit(1);
  }
})();
