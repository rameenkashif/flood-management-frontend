#!/usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');

async function testAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    console.log('\n🔍 Looking for admin user...');
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found! Creating...');
      const newAdmin = new User({
        name: 'admin',
        email: 'admin@gmail.com',
        phone: '0000000000',
        password: 'password123',
        role: 'admin'
      });
      await newAdmin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Phone: ${admin.phone}`);
      
      // Test password match
      console.log('\n🔐 Testing password...');
      const isMatch = await admin.matchPassword('password123');
      console.log(`   Password "password123" matches: ${isMatch}`);
      if (!isMatch) {
        console.log('🔁 Password mismatch detected — resetting admin password to "password123"');
        admin.password = 'password123';
        await admin.save();
        const isNowMatch = await admin.matchPassword('password123');
        console.log(`   After reset, password matches: ${isNowMatch}`);
      }
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testAdmin();
