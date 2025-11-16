const axios = require('axios');
const Alert = require('../models/Alert');

// List alerts with optional filtering
exports.listAlerts = async (req, res) => {
  try {
    const { region, severity, limit = 100 } = req.query;
    const filter = {};
    if (region) filter.region = { $regex: region, $options: 'i' };
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save an alert if not duplicate (simple duplicate check)
exports.saveAlert = async (alertData) => {
  try {
    const exists = await Alert.findOne({
      region: alertData.region,
      message: alertData.message,
      lat: alertData.lat,
      lng: alertData.lng,
    });
    if (exists) return exists;
    const a = await Alert.create(alertData);
    return a;
  } catch (err) {
    console.error('Error saving alert:', err.message || err);
    throw err;
  }
};

// Express handler to create alert via POST /api/floods
exports.createAlertHandler = async (req, res) => {
  try {
    const body = req.body;
    const alert = await exports.saveAlert(body);
    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Express handler to force-fetch external alerts via POST /api/floods/refresh
exports.refreshAlertsHandler = async (req, res) => {
  try {
    const results = await exports.fetchExternalAlerts();
    res.json({ fetched: results.length, results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Express handler to clear alerts (DELETE /api/floods)
exports.clearAlertsHandler = async (req, res) => {
  try {
    const result = await Alert.deleteMany({});
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch external weather data for defined locations (Pakistan cities)
exports.fetchExternalAlerts = async (options = {}) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  // Minimal list of cities with coords in Pakistan
  const locations = [
    { name: 'Karachi', lat: 24.8607, lng: 67.0011 },
    { name: 'Lahore', lat: 31.5204, lng: 74.3587 },
    { name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
    { name: 'Peshawar', lat: 34.0151, lng: 71.5249 },
    { name: 'Quetta', lat: 30.1798, lng: 66.9750 },
    { name: 'Hyderabad', lat: 25.3960, lng: 68.3578 },
  ];

  if (!apiKey) {
    // No API key — create simulated alerts (useful for development)
    const simulated = locations.map((loc, i) => ({
      region: loc.name,
      severity: ['LOW','MEDIUM','HIGH','CRITICAL'][Math.floor(Math.random()*4)],
      rainfall: Math.round(Math.random()*200),
      waterLevel: +(Math.random()*5).toFixed(2),
      affectedPopulation: Math.floor(Math.random()*10000),
      message: `Simulated alert for ${loc.name}`,
      lat: loc.lat,
      lng: loc.lng,
      source: 'SIMULATED',
    }));

    // Save simulated alerts
    for (const s of simulated) {
      await exports.saveAlert(s);
    }
    return simulated;
  }

  // If API key present, use OpenWeather One Call / Weather API to detect heavy rainfall or alerts
  const results = [];
  for (const loc of locations) {
    try {
      // Use OpenWeather's current weather (could be replaced with alerts endpoint)
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${loc.lat}&lon=${loc.lng}&appid=${apiKey}&units=metric`;
      const resp = await axios.get(url, { timeout: 8000 });
      const data = resp.data;

      // Simple heuristic: heavy rainfall if clouds/rain volume or extreme weather ids
      let severity = 'LOW';
      const weatherId = (data.weather && data.weather[0] && data.weather[0].id) || 800;
      const rain = (data.rain && (data.rain['1h'] || data.rain['3h'])) || 0;
      if (weatherId >= 200 && weatherId < 600) {
        // thunderstorm, drizzle, rain
        if (rain > 50) severity = 'CRITICAL';
        else if (rain > 20) severity = 'HIGH';
        else severity = 'MEDIUM';
      } else if (weatherId >= 600 && weatherId < 700) {
        severity = 'MEDIUM';
      }

      const alertObj = {
        region: loc.name,
        severity,
        rainfall: rain,
        waterLevel: null,
        affectedPopulation: null,
        message: data.weather && data.weather[0] && data.weather[0].description,
        lat: loc.lat,
        lng: loc.lng,
        source: 'OPENWEATHER',
      };

      await exports.saveAlert(alertObj);
      results.push(alertObj);
    } catch (err) {
      console.warn(`Failed to fetch weather for ${loc.name}:`, err.message || err);
    }
  }

  return results;
};
