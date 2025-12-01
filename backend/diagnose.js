#!/usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');
const mongoose = require('mongoose');
const Alert = require('./models/Alert');

async function diagnoseSystem() {
  console.log('🔍 FLOOD MANAGEMENT BACKEND DIAGNOSTIC\n');
  console.log('=' .repeat(50));

  // 1. Check environment
  console.log('\n1️⃣ ENVIRONMENT CHECK');
  console.log('-'.repeat(50));
  const apiKey = process.env.OPENWEATHER_API_KEY;
  console.log(`   API Key set: ${!!apiKey}`);
  console.log(`   API Key length: ${apiKey?.length || 0}`);
  console.log(`   API Key valid format: ${apiKey && apiKey.length === 32 ? '✅' : '❌'}`);
  console.log(`   MongoDB URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Missing'}`);
  console.log(`   JWT Secret: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);

  // 2. Test OpenWeather API directly
  console.log('\n2️⃣ OPENWEATHER API TEST');
  console.log('-'.repeat(50));
  
  try {
    // Try with explicit query params
    const testUrl = `https://api.openweathermap.org/data/2.5/weather`;
    const params = {
      lat: 24.8607,
      lon: 67.0011,
      appid: apiKey,
      units: 'metric'
    };
    
    console.log(`   Endpoint: ${testUrl}`);
    console.log(`   City: Karachi (24.8607, 67.0011)`);
    
    const resp = await axios.get(testUrl, { params, timeout: 8000 });
    
    if (resp.status === 200) {
      console.log(`   ✅ API Call Successful (200 OK)`);
      console.log(`   Response: ${resp.data.weather?.[0]?.main} - ${resp.data.weather?.[0]?.description}`);
      console.log(`   Temp: ${resp.data.main?.temp}°C`);
    }
  } catch (err) {
    console.log(`   ❌ API Call Failed`);
    console.log(`   Status: ${err.response?.status}`);
    console.log(`   Error: ${err.response?.data?.message || err.message}`);
    if (err.response?.status === 401) {
      console.log(`\n   💡 SOLUTION: Your API key is not working.`);
      console.log(`      Options:`);
      console.log(`      a) Generate a NEW API key at https://openweathermap.org/api`);
      console.log(`      b) Check if the key was activated (can take 5-10 minutes)`);
      console.log(`      c) Verify no typos in the key`);
      console.log(`      d) Check API plan restrictions at https://home.openweathermap.org/subscriptions`);
    }
  }

  // 3. Check MongoDB connection
  console.log('\n3️⃣ MONGODB CONNECTION TEST');
  console.log('-'.repeat(50));
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`   ✅ MongoDB Connected`);
    
    const alertCount = await Alert.countDocuments();
    console.log(`   Alerts in DB: ${alertCount}`);
    
    await mongoose.connection.close();
  } catch (err) {
    console.log(`   ❌ MongoDB Connection Failed`);
    console.log(`   Error: ${err.message}`);
  }

  // 4. Summary & next steps
  console.log('\n4️⃣ NEXT STEPS');
  console.log('-'.repeat(50));
  console.log(`   1. Get a NEW API key from https://openweathermap.org/api`);
  console.log(`   2. Wait 5-10 minutes for activation`);
  console.log(`   3. Update backend/.env with the new key`);
  console.log(`   4. Restart the server: node server.js`);
  console.log(`   5. The Refresh External button in the UI should now work`);
  console.log('\n' + '='.repeat(50) + '\n');
}

diagnoseSystem().catch(err => {
  console.error('Diagnostic error:', err.message);
  process.exit(1);
});
