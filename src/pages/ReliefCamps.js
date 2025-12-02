// src/pages/ReliefCamps.js
import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Button,
  Modal,
  Box,
  TextField,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ReliefCampCard from "../components/ReliefCampCard";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getReliefCamps, addReliefCamp, getPakistanCities } from "../services/api";
import L from 'leaflet';

// Fix leaflet's default icon paths (webpack doesn't copy them automatically)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
import { useAuth } from "../context/AuthContext";

function ReliefCamps() {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCamp, setNewCamp] = useState({
    name: "",
    region: "",
    location: "",
    contact: "",
    totalCapacity: "",
    currentCapacity: 0,
    coordinates: { lat: null, lng: null },
    facilities: [],
  });
  const [cities, setCities] = useState([]);

  // Fetch camps from API (mock or backend)
  useEffect(() => {
    getReliefCamps().then((data) => {
      setCamps(data);
      setFilteredCamps(data);
    });
    const loadCities = async () => {
      try {
        const list = await getPakistanCities();
        setCities(list || []);
      } catch (e) {
        setCities([]);
      }
    };
    loadCities();
  }, []);

  // Handle adding new camp
  const handleAddCamp = async () => {
    // ensure coordinates are numbers; if not, try to geocode the location
    const coords = newCamp.coordinates || {};
    if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      if (newCamp.location && newCamp.location.trim()) {
        await geocodeLocation();
      }
    }

    const finalCoords = newCamp.coordinates || {};
    if (typeof finalCoords.lat !== 'number' || typeof finalCoords.lng !== 'number') {
      console.warn('Please provide valid coordinates or a recognized location to geocode');
      return;
    }

    const payload = {
      ...newCamp,
      totalCapacity: Number(newCamp.totalCapacity) || 0,
      currentCapacity: Number(newCamp.currentCapacity) || 0,
      coordinates: { lat: Number(finalCoords.lat), lng: Number(finalCoords.lng) },
    };

    await addReliefCamp(payload);
    const updated = await getReliefCamps();
    setCamps(updated);
    setFilteredCamps(updated);
    setOpen(false);
  };

  // Try geocoding the location string via OpenStreetMap Nominatim
  const geocodeLocation = async () => {
    let q = newCamp.location;
    if (!q || q.trim() === '') return;
    q = q.trim();
    // If user didn't include a country, bias to Pakistan to avoid ambiguous results
    if (!/\b(pakistan|pk)\b/i.test(q)) {
      q = `${q}, Pakistan`;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();
      if (Array.isArray(results) && results.length > 0) {
        // If region provided, try to find a result that mentions the region
        const regionLower = (newCamp.region || '').toLowerCase();
        let r = results[0];
        if (regionLower) {
          const matched = results.find((item) => (item.display_name || '').toLowerCase().includes(regionLower));
          if (matched) r = matched;
        }
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          setNewCamp((prev) => ({ ...prev, coordinates: { lat, lng } }));
          return { lat, lng };
        }
      }
    } catch (e) {
      console.warn('Geocoding failed', e.message || e);
    }
    return null;
  };

  // Handle live search
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (term.trim() === "") {
      setFilteredCamps(camps);
    } else {
      const filtered = camps.filter(
        (camp) =>
          camp.name.toLowerCase().includes(term) ||
          camp.region.toLowerCase().includes(term)
      );
      setFilteredCamps(filtered);
    }
  };

  // Handle toggling facilities
  const handleFacilityChange = (facility) => {
    setNewCamp((prev) => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility],
      };
    });
  };

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, alignItems: "center" }}>
        <Typography variant="h4" fontWeight={600}>
          Relief Camps
        </Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" onClick={() => setOpen(true)} size="medium">
            + Add New Camp
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <TextField
        placeholder="Search by camp name or region..."
        fullWidth
        size="small"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearch}
        sx={{ mb: 4 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Map Section */}
      <Box sx={{ height: 400, borderRadius: 3, overflow: "hidden", mb: 4 }}>
        <MapContainer
          center={[30.3753, 69.3451]}
          zoom={5}
          style={{ height: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredCamps.map((camp, idx) => (
            (camp.coordinates && typeof camp.coordinates.lat === 'number' && typeof camp.coordinates.lng === 'number') ? (
              <Marker key={idx} position={[camp.coordinates.lat, camp.coordinates.lng]}>
              <Popup>
                <strong>{camp.name}</strong>
                <br />
                {camp.region}
              </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </Box>

      {/* Camps List */}
      {filteredCamps.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
          No relief camps found matching “{searchTerm}”.
        </Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Existing Relief Camps
          </Typography>
          <Grid container spacing={3}>
            {filteredCamps.map((camp, index) => (
              <Grid item xs={12} md={6} lg={4} key={camp._id || index}>
                <ReliefCampCard camp={camp} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Add Camp Modal */}
      <Modal open={open && user?.role === 'admin'} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Add New Relief Camp
          </Typography>
          <TextField
            fullWidth
            label="Camp Name"
            sx={{ mb: 2 }}
            value={newCamp.name}
            onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Region"
            sx={{ mb: 2 }}
            value={newCamp.region}
            onChange={(e) => setNewCamp({ ...newCamp, region: e.target.value })}
          />
          <TextField
            fullWidth
            label="Location"
            sx={{ mb: 2 }}
            value={newCamp.location}
            onChange={(e) => setNewCamp({ ...newCamp, location: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
            <Button size="small" variant="outlined" onClick={geocodeLocation} sx={{ mr: 1 }}>
              Auto geocode
            </Button>
            <TextField
              label="Latitude"
              size="small"
              value={newCamp.coordinates?.lat ?? ''}
              onChange={(e) => setNewCamp({ ...newCamp, coordinates: { ...(newCamp.coordinates||{}), lat: e.target.value ? parseFloat(e.target.value) : null } })}
              sx={{ width: 160 }}
            />
            <TextField
              label="Longitude"
              size="small"
              value={newCamp.coordinates?.lng ?? ''}
              onChange={(e) => setNewCamp({ ...newCamp, coordinates: { ...(newCamp.coordinates||{}), lng: e.target.value ? parseFloat(e.target.value) : null } })}
              sx={{ width: 160 }}
            />
          </Box>
          <TextField
            fullWidth
            label="Contact"
            sx={{ mb: 2 }}
            value={newCamp.contact}
            onChange={(e) => setNewCamp({ ...newCamp, contact: e.target.value })}
          />
          <TextField
            fullWidth
            label="Total Capacity"
            type="number"
            sx={{ mb: 2 }}
            value={newCamp.totalCapacity}
            onChange={(e) =>
              setNewCamp({ ...newCamp, totalCapacity: e.target.value })
            }
          />

          {/* Facilities */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
            {["Food", "Water", "Medical", "Shelter"].map((facility) => (
              <Button
                key={facility}
                variant={
                  newCamp.facilities.includes(facility)
                    ? "contained"
                    : "outlined"
                }
                onClick={() => handleFacilityChange(facility)}
              >
                {facility}
              </Button>
            ))}
          </Box>

          <Button variant="contained" fullWidth onClick={handleAddCamp}>
            Save
          </Button>
        </Box>
      </Modal>
    </Container>
  );
}

export default ReliefCamps;
