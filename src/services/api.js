import axios from "axios";

const API_BASE_URL = "/api"; // use relative path and rely on react dev proxy

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
export const getFloodData = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/floods`, { params, timeout: 2000 });
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

// Helper to persist assets with quota handling: try saving, if quota exceeded remove photos and retry
const persistAssets = (assets) => {
  try {
    localStorage.setItem("assets", JSON.stringify(assets));
    return;
  } catch (err) {
    // if quota exceeded, remove photo fields and retry
    try {
      const stripped = assets.map(({ photo, ...rest }) => rest);
      localStorage.setItem("assets", JSON.stringify(stripped));
      // update in-memory copy to stripped so future reads match
      localAssets = stripped;
      return;
    } catch (err2) {
      // give up and throw original
      throw err2;
    }
  }
};

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
  persistAssets(localAssets);
  return newAsset;
};

// Update an existing asset (by id)
export const updateAsset = async (id, assetData) => {
  await simulateDelay(150);
  const idx = localAssets.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Asset not found');
  localAssets[idx] = { ...localAssets[idx], ...assetData };
  persistAssets(localAssets);
  return localAssets[idx];
};

// Delete an asset by id
export const deleteAsset = async (id) => {
  await simulateDelay(150);
  const before = localAssets.length;
  localAssets = localAssets.filter((a) => a.id !== id);
  persistAssets(localAssets);
  return { deleted: before - localAssets.length };
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
// ---------------- RELIEF CAMPS MOCK DATA ---------------- //
let localCamps = JSON.parse(localStorage.getItem("reliefCamps") || "[]");

export const getReliefCamps = async () => {
  await new Promise((r) => setTimeout(r, 200));
  return localCamps.length
    ? localCamps
    : [
        {
          name: "Central Relief Camp Karachi",
          region: "Karachi",
          location: "National Stadium Road, Karachi",
          totalCapacity: 5000,
          currentCapacity: 2800,
          contact: "0321-1234567",
          facilities: ["Food", "Water", "Medical", "Shelter"],
          coordinates: { lat: 24.8607, lng: 67.0011 },
        },
        {
          name: "Lahore City Relief Center",
          region: "Lahore",
          location: "Expo Center, Johar Town, Lahore",
          totalCapacity: 3500,
          currentCapacity: 1200,
          contact: "0300-9876543",
          facilities: ["Food", "Water", "Medical", "Shelter"],
          coordinates: { lat: 31.5204, lng: 74.3587 },
        },
        {
          name: "Hyderabad Safe Zone",
          region: "Hyderabad",
          location: "Civic Center, Latifabad, Hyderabad",
          totalCapacity: 2000,
          currentCapacity: 450,
          contact: "0345-7778889",
          facilities: ["Food", "Water", "Shelter"],
          coordinates: { lat: 25.3960, lng: 68.3578 },
        },
      ];
};

export const addReliefCamp = async (campData) => {
  await new Promise((r) => setTimeout(r, 200));
  localCamps.push(campData);
  localStorage.setItem("reliefCamps", JSON.stringify(localCamps));
  return campData;
};

// ---------------- COMMUNITY UPDATES MOCK DATA ---------------- //
let localCommunity = JSON.parse(localStorage.getItem("community") || "[]");

export const getCommunityUpdates = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages`, { timeout: 5000 });
    // Map message model to community update shape used by UI
    return response.data.map((m) => ({
      id: m._id,
      name: m.senderName || 'Anonymous',
      region: m.region || '',
      type: 'Update',
      priority: 'Medium',
      title: '',
      message: m.message,
      tags: '',
      createdAt: m.createdAt,
    }));
  } catch (err) {
    // fallback to localStorage mock
    await new Promise((r) => setTimeout(r, 300));
    if (localCommunity.length === 0) {
      localCommunity = [
        {
          name: "NDMA Official",
          region: "Karachi",
          type: "Announcement",
          priority: "High",
          title: "Relief Camp Operations Extended",
          message:
            "All relief camps in Karachi will remain operational 24/7. Free transportation available from main intersections. Medical teams on standby.",
          tags: "relief, transportation, medical",
        },
        {
          name: "Muhammad Raza",
          region: "Multan",
          type: "Request",
          priority: "Urgent",
          title: "Urgent: Need Drinking Water in Sector 12",
          message:
            "Our area has been without clean drinking water for 48 hours. Approximately 500 families affected. Water tanker urgently needed.",
          tags: "water, emergency, sector12",
        },
      ];
      localStorage.setItem("community", JSON.stringify(localCommunity));
    }
    return localCommunity;
  }
};

export const addCommunityUpdate = async (data) => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${API_BASE_URL}/messages`, { message: data.message, recipientId: data.recipientId || null }, { headers, timeout: 5000 });
    const m = response.data;
    return {
      id: m._id,
      name: m.senderName || data.name || 'Anonymous',
      region: data.region || '',
      type: data.type || 'Update',
      priority: data.priority || 'Medium',
      title: data.title || '',
      message: m.message,
      tags: data.tags || '',
      createdAt: m.createdAt,
    };
  } catch (err) {
    // fallback to localStorage
    await new Promise((r) => setTimeout(r, 300));
    const newUpdate = { ...data, id: Date.now() };
    localCommunity.push(newUpdate);
    localStorage.setItem("community", JSON.stringify(localCommunity));
    return newUpdate;
  }
};

// ---------------- AUTH (backend-backed) ---------------- //
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData, { timeout: 5000 });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, credentials, { timeout: 5000 });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// Force backend to fetch external alerts (immediate)
export const refreshAlerts = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/floods/refresh`, null, { timeout: 10000 });
    return response.data;
  } catch (err) {
    console.warn('⚠️ Failed to refresh alerts:', err.message || err);
    throw err;
  }
};

// ✅ Donations APIs
export const getDonations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations`, { timeout: 5000 });
    return response.data;
  } catch (err) {
    console.warn('⚠️ Backend unreachable for donations.');
    return [];
  }
};

export const createDonation = async (donationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/donations`, donationData, { timeout: 5000 });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const updateDonation = async (id, donationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/donations/${id}`, donationData, { timeout: 5000 });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

export const deleteDonation = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/donations/${id}`, { timeout: 5000 });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};

// ✅ Volunteers APIs
export const getVolunteers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/volunteers`, { timeout: 5000 });
    return response.data;
  } catch (err) {
    console.warn('⚠️ Backend unreachable for volunteers.');
    return [];
  }
};

export const createVolunteer = async (volunteerData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/volunteers`, volunteerData, { timeout: 5000 });
    return response.data;
  } catch (err) {
    throw err.response?.data || { message: err.message };
  }
};
