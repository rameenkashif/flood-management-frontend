// floodController_live.js

const axios = require("axios");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const Alert = require("../models/Alert");

// Severity thresholds
const SEVERITY_THRESHOLDS = {
  CRITICAL: { rainfall: 100, waterLevel: 4.0 },
  HIGH: { rainfall: 50, waterLevel: 2.5 },
  MEDIUM: { rainfall: 20, waterLevel: 1.5 },
  LOW: { rainfall: 5, waterLevel: 0.5 },
};

// Determine severity
function determineSeverity(rainfall = 0, waterLevel = null) {
  if (
    rainfall >= SEVERITY_THRESHOLDS.CRITICAL.rainfall ||
    (waterLevel !== null && waterLevel >= SEVERITY_THRESHOLDS.CRITICAL.waterLevel)
  )
    return "CRITICAL";

  if (
    rainfall >= SEVERITY_THRESHOLDS.HIGH.rainfall ||
    (waterLevel !== null && waterLevel >= SEVERITY_THRESHOLDS.HIGH.waterLevel)
  )
    return "HIGH";

  if (
    rainfall >= SEVERITY_THRESHOLDS.MEDIUM.rainfall ||
    (waterLevel !== null && waterLevel >= SEVERITY_THRESHOLDS.MEDIUM.waterLevel)
  )
    return "MEDIUM";

  if (
    rainfall >= SEVERITY_THRESHOLDS.LOW.rainfall ||
    (waterLevel !== null && waterLevel >= SEVERITY_THRESHOLDS.LOW.waterLevel)
  )
    return "LOW";

  return null;
}

// List alerts
exports.listAlerts = async (req, res) => {
  try {
    const { region, severity, limit = 200, active, showPrevious } = req.query;
    const filter = {};

    if (region) filter.region = { $regex: region, $options: "i" };
    if (severity) filter.severity = severity;

    if (typeof active !== "undefined") filter.active = String(active) === "true";
    else if (String(showPrevious) === "true") filter.active = false;
    else filter.active = true;

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Save or update alert
exports.saveAlert = async (alertData) => {
  try {
    const exists = await Alert.findOne({
      region: alertData.region,
      message: alertData.message,
      lat: alertData.lat,
      lng: alertData.lng,
    });

    if (exists) {
      exists.severity = alertData.severity || exists.severity;
      exists.rainfall =
        alertData.rainfall !== undefined ? alertData.rainfall : exists.rainfall;
      exists.waterLevel =
        alertData.waterLevel !== undefined
          ? alertData.waterLevel
          : exists.waterLevel;
      exists.affectedPopulation =
        alertData.affectedPopulation !== undefined
          ? alertData.affectedPopulation
          : exists.affectedPopulation;
      exists.active = true;
      exists.endsAt = null;

      await exists.save();
      return exists;
    }

    return await Alert.create({ ...alertData, active: true });
  } catch (err) {
    console.error("Error saving alert:", err.message);
  }
};

// Manual alert creation
exports.createAlertHandler = async (req, res) => {
  try {
    const body = req.body;
    if (!body.source) body.source = "MANUAL";

    // validate region
    const cities = require('../data/pakistan_cities.json');
    if (!body.region || !cities.includes(body.region)) return res.status(400).json({ message: 'Invalid region; must be a Pakistani city' });

    const alert = await exports.saveAlert(body);

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Auto deactivate alerts if conditions calm down
exports.autoDeactivateIfSubsided = async (region, rainfall = 0, waterLevel = null) => {
  try {
    const severity = determineSeverity(rainfall, waterLevel);

    if (!severity) {
      await Alert.updateMany(
        { region, active: true },
        { $set: { active: false, endsAt: new Date() } }
      );
    }
  } catch (err) {
    console.warn(`Auto-deactivation failed for ${region}:`, err.message);
  }
};

// DELETE all alerts
exports.clearAlertsHandler = async (req, res) => {
  try {
    const result = await Alert.deleteMany({});
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- FETCH LIVE WEATHER FOR ALL PAKISTAN CITIES ----------------

// Path to city.list.json.gz (downloaded from OpenWeather sample data)
const CITY_LIST_PATH = path.join(__dirname, "../city.list.json.gz");

async function getPakistanCities() {
  if (!fs.existsSync(CITY_LIST_PATH)) {
    throw new Error("city.list.json.gz not found. Download from OpenWeather");
  }

  const buffer = fs.readFileSync(CITY_LIST_PATH);
  const decompressed = zlib.gunzipSync(buffer);
  const allCities = JSON.parse(decompressed.toString());

  // Filter all Pakistan cities
  return allCities
    .filter((c) => c.country === "PK")
    .map((c) => ({ name: c.name, lat: c.coord.lat, lng: c.coord.lon }));
}

// Fetch external alerts
exports.fetchExternalAlerts = async () => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENWEATHER_API_KEY");
    return [];
  }

  let cities = [];
  try {
    cities = await getPakistanCities();
  } catch (err) {
    console.error("Failed to load Pakistan cities:", err.message);
    return [];
  }

  const results = [];

  for (const city of cities) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lng}&appid=${apiKey}&units=metric`;
      const resp = await axios.get(url, { timeout: 8000 });
      const data = resp.data;

      const rain = data.rain?.["1h"] || data.rain?.["3h"] || 0;
      const severity = determineSeverity(rain, null) || "LOW";

      const alertObj = {
        region: city.name,
        severity,
        rainfall: rain,
        waterLevel: null,
        affectedPopulation: null,
        message: data.weather?.[0]?.description || "Weather update",
        lat: city.lat,
        lng: city.lng,
        source: "OPENWEATHER",
      };

      await exports.saveAlert(alertObj);
      await exports.autoDeactivateIfSubsided(city.name, rain, null);

      results.push(alertObj);
    } catch (err) {
      console.warn(`Failed to fetch weather for ${city.name}:`, err.message);
    }
  }

  await deactivateStaleAlerts(results);
  return results;
};

// Deactivate stale alerts
async function deactivateStaleAlerts(results) {
  try {
    const updatedRegions = results.map((r) => r.region);
    await Alert.updateMany(
      { active: true, region: { $nin: updatedRegions } },
      { $set: { active: false, endsAt: new Date() } }
    );
  } catch (err) {
    console.warn("Failed to deactivate stale alerts:", err.message);
  }
}

// REFRESH endpoint
exports.refreshAlertsHandler = async (req, res) => {
  try {
    const list = await exports.fetchExternalAlerts();
    res.json({
      fetched: list.length,
      results: list,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
