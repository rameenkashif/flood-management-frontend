#!/usr/bin/env node
const dotenv = require('dotenv');
dotenv.config();

const axios = require('axios');

async function testOpenWeatherAPI() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  console.log('🔑 OPENWEATHER_API_KEY present:', !!apiKey && apiKey !== 'your_api_key_here');
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('❌ OPENWEATHER_API_KEY is not set or is using placeholder.');
    console.log('ℹ️  To use OpenWeather API:');
    console.log('   1. Go to https://openweathermap.org/api');
    console.log('   2. Sign up for a free account');
    console.log('   3. Get your API key');
    console.log('   4. Add it to backend/.env: OPENWEATHER_API_KEY=your_key_here');
    process.exit(1);
  }

  // Test with one city (Karachi)
  const city = { name: 'Karachi', lat: 24.8607, lng: 67.0011 };
  
  try {
    console.log(`\n🌐 Testing API call for ${city.name} (${city.lat}, ${city.lng})...`);
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}&units=metric`;
    console.log(`📍 URL: ${url.replace(apiKey, '***')}`);
    
    const resp = await axios.get(url, { timeout: 8000 });
    const data = resp.data;
    
    console.log('\n✅ API Response received:');
    console.log(`   Temp: ${data.main?.temp}°C`);
    console.log(`   Weather: ${data.weather?.[0]?.main} - ${data.weather?.[0]?.description}`);
    console.log(`   Humidity: ${data.main?.humidity}%`);
    console.log(`   Rainfall (1h): ${data.rain?.['1h'] || 0} mm`);
    console.log(`   Rainfall (3h): ${data.rain?.['3h'] || 0} mm`);
    console.log('\n✅ OpenWeather API is working correctly!');
    
  } catch (err) {
    console.error('\n❌ API Error:');
    console.error(`   Status: ${err.response?.status || 'N/A'}`);
    console.error(`   Message: ${err.response?.data?.message || err.message}`);
    if (err.response?.status === 401) {
      console.error('   Likely cause: Invalid or expired API key');
    }
    process.exit(1);
  }
}

testOpenWeatherAPI();
