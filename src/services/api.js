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

// ---------------- ASSET APIs (backend-backed) ---------------- //
// Note: assets endpoints are protected. We attach the token from localStorage when present.
const authHeaders = () => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// map backend asset document to UI-friendly shape
const mapAssetFromServer = (a) => {
  return {
    id: a._id || a.id,
    name: a.name,
    type: a.type,
    description: a.description,
    // prefer value (legacy) then estimatedValue
    value: a.value !== undefined && a.value !== null ? a.value : a.estimatedValue,
    estimatedValue: a.estimatedValue,
    currency: a.currency || 'PKR',
    photo: a.photoUrl || a.photo || '',
    photoUrl: a.photoUrl || a.photo || '',
    location: a.location,
    dateRegistered: a.createdAt || a.dateRegistered,
    raw: a,
  };
};

export const getAssets = async () => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/assets/me`, { headers: authHeaders(), timeout: 5000 });
    if (!Array.isArray(resp.data)) return [];
    return resp.data.map(mapAssetFromServer);
  } catch (err) {
    console.warn('⚠️ Failed to load assets from backend — falling back to empty list', err.message || err);
    return [];
  }
};

export const getAllAssets = async () => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/assets`, { headers: authHeaders(), timeout: 5000 });
    if (!Array.isArray(resp.data)) return [];
    return resp.data.map(mapAssetFromServer);
  } catch (err) {
    console.warn('⚠️ Failed to load all assets from backend — falling back to empty list', err.message || err);
    return [];
  }
};

export const addAsset = async (assetData) => {
  try {
    // map UI shape to backend shape
    const payload = {
      type: assetData.type,
      name: assetData.name,
      description: assetData.description,
      // send `value` (frontend input) as primary numeric field the backend validates
      value: Number(assetData.value || assetData.estimatedValue || 0),
      // also send estimatedValue for compatibility
      estimatedValue: Number(assetData.estimatedValue || assetData.value || 0),
      currency: assetData.currency || 'PKR',
      // frontend stores resized image in `photo` (data URL) — backend accepts `photo` or `photoUrl`
      photo: assetData.photo || assetData.photoUrl || '',
      photoUrl: assetData.photoUrl || assetData.photo || '',
      location: assetData.location || '',
    };
    const resp = await axios.post(`${API_BASE_URL}/assets`, payload, { headers: { 'Content-Type': 'application/json', ...authHeaders() }, timeout: 5000 });
    return mapAssetFromServer(resp.data);
  } catch (err) {
    console.error('Failed to add asset to backend:', err.response?.data || err.message || err);
    const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to add asset';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

export const updateAsset = async (id, assetData) => {
  try {
    const payload = {
      type: assetData.type,
      name: assetData.name,
      description: assetData.description,
      value: Number(assetData.value || assetData.estimatedValue || 0),
      estimatedValue: Number(assetData.estimatedValue || assetData.value || 0),
      currency: assetData.currency || 'PKR',
      photo: assetData.photo || assetData.photoUrl || '',
      photoUrl: assetData.photoUrl || assetData.photo || '',
      location: assetData.location || '',
      value: Number(assetData.value || assetData.estimatedValue || 0),
    };
    const resp = await axios.patch(`${API_BASE_URL}/assets/${id}`, payload, { headers: { 'Content-Type': 'application/json', ...authHeaders() }, timeout: 5000 });
    return mapAssetFromServer(resp.data);
  } catch (err) {
    console.error('Failed to update asset:', err.response?.data || err.message || err);
    const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to update asset';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

export const deleteAsset = async (id) => {
  try {
    const resp = await axios.delete(`${API_BASE_URL}/assets/${id}`, { headers: authHeaders(), timeout: 5000 });
    return resp.data;
  } catch (err) {
    console.error('Failed to delete asset:', err.response?.data || err.message || err);
    const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete asset';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

export const getAssetSummary = async () => {
  const assets = await getAssets();
  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value || 0), 0);
  return {
    totalAssets: assets.length,
    protectedAssets: assets.length,
    totalValue,
  };
};
// ---------------- RELIEF CAMPS MOCK DATA ---------------- //
export const getReliefCamps = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/relief-camps`, { timeout: 3000 });
    // If an old localStorage cache exists from previous app versions, remove it
    try {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('reliefCamps')) {
        localStorage.removeItem('reliefCamps');
      }
    } catch (e) {
      // ignore storage errors in environment without localStorage
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn('⚠️ Backend unreachable for relief camps — returning empty list.');
    return [];
  }
};

export const addReliefCamp = async (campData) => {
  const response = await axios.post(`${API_BASE_URL}/relief-camps`, campData, { timeout: 4000 });
  return response.data;
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

// ---------------- PAKISTAN CITIES ---------------- //
export const getPakistanCities = async () => {
  try {
    const resp = await axios.get(`${API_BASE_URL}/locations/cities`, { timeout: 5000 });
    return resp.data;
  } catch (err) {
    console.warn('⚠️ Failed to load cities from backend, using local fallback');
    // local fallback subset
    return [
      'Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar','Quetta','Hyderabad'
    ];
  }
};

// ---------------- AUTH (backend-backed) ---------------- //
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/register`, userData, { timeout: 5000 });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/login`, credentials, { timeout: 5000 });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || err.message || 'Login failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

// Force backend to fetch external alerts (immediate)
export const refreshAlerts = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/floods/refresh`, null, { timeout: 10000 });
    return response.data;
  } catch (err) {
    console.warn('⚠️ Failed to refresh alerts:', err.message || err);
    const message = err.response?.data?.message || err.response?.data || err.message || 'Failed to refresh alerts';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

// ✅ Donations APIs
export const getDonations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/donations`, { headers: authHeaders(), timeout: 5000 });
    return response.data;
  } catch (err) {
    console.warn('⚠️ Backend unreachable for donations.');
    return [];
  }
};

export const createDonation = async (donationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/donations`, donationData, { headers: { 'Content-Type': 'application/json', ...authHeaders() }, timeout: 5000 });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || err.message || 'Create donation failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

export const updateDonation = async (id, donationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/donations/${id}`, donationData, { headers: { 'Content-Type': 'application/json', ...authHeaders() }, timeout: 5000 });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || err.message || 'Update donation failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};

export const deleteDonation = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/donations/${id}`, { timeout: 5000 });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || err.message || 'Delete donation failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
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
    const response = await axios.post(`${API_BASE_URL}/volunteers`, volunteerData, { headers: { 'Content-Type': 'application/json', ...authHeaders() }, timeout: 5000 });
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data || err.message || 'Create volunteer failed';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
};
