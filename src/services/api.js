import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // your backend URL

// ---------------- FLOOD ALERT MOCK DATA ---------------- //
let localAlerts = [
  {
    id: 1,
    region: "Hyderabad",
    severity: "High",
    rainfall: 120,
    waterLevel: 4.5,
    affectedPopulation: 5000,
    message: "Severe flooding expected in low-lying areas.",
    lat: 17.385,
    lng: 78.4867,
  },
  {
    id: 2,
    region: "Chennai",
    severity: "Medium",
    rainfall: 85,
    waterLevel: 3.2,
    affectedPopulation: 3000,
    message: "Moderate flooding reported near coastal regions.",
    lat: 13.0827,
    lng: 80.2707,
  },
];

const simulateDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ Flood Data APIs
export const getFloodData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/floods`, { timeout: 2000 });
    return response.data;
  } catch (error) {
    console.warn("⚠️ Backend unreachable — using local mock data.");
    await simulateDelay(300);
    return localAlerts;
  }
};

export const createAlert = async (alertData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/floods`, alertData, { timeout: 2000 });
    return response.data;
  } catch {
    console.warn("⚠️ Backend unreachable — storing alert locally.");
    await simulateDelay(300);
    const newAlert = { id: Date.now(), ...alertData };
    localAlerts.push(newAlert);
    return newAlert;
  }
};

export const filterAlerts = async (region, severity) => {
  await simulateDelay(200);
    const alerts = await getFloodData();
  return alerts.filter((alert) => {
    const matchesRegion = region ? alert.region.toLowerCase().includes(region.toLowerCase()) : true;
    const matchesSeverity = severity ? alert.severity.toLowerCase() === severity.toLowerCase() : true;
    return matchesRegion && matchesSeverity;
  });
};

// ---------------- ASSET LOCKER MOCK DATA ---------------- //
let localAssets = JSON.parse(localStorage.getItem("assets") || "[]");

// ✅ Get assets
export const getAssets = async () => {
  await simulateDelay(200);
  return localAssets;
};

// ✅ Add new asset
export const addAsset = async (assetData) => {
  await simulateDelay(200);
  const newAsset = {
    id: Date.now(),
    ...assetData,
    dateRegistered: new Date().toLocaleDateString(),
  };
  localAssets.push(newAsset);
  localStorage.setItem("assets", JSON.stringify(localAssets));
  return newAsset;
};

// ✅ Calculate total asset value
export const getAssetSummary = async () => {
  const assets = await getAssets();
  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value || 0), 0);
  return {
    totalAssets: assets.length,
    protectedAssets: assets.length, // assuming all are protected
    totalValue,
  };
};
