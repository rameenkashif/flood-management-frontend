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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ReliefCampCard from "../components/ReliefCampCard";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getReliefCamps, addReliefCamp } from "../services/api";

function ReliefCamps() {
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
    coordinates: { lat: 24.8607, lng: 67.0011 },
    facilities: [],
  });

  // Fetch camps from API (mock or backend)
  useEffect(() => {
    getReliefCamps().then((data) => {
      setCamps(data);
      setFilteredCamps(data);
    });
  }, []);

  // Handle adding new camp
  const handleAddCamp = async () => {
    await addReliefCamp(newCamp);
    const updated = await getReliefCamps();
    setCamps(updated);
    setFilteredCamps(updated);
    setOpen(false);
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
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add New Camp
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        placeholder="Search by camp name or region..."
        fullWidth
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
            <Marker key={idx} position={[camp.coordinates.lat, camp.coordinates.lng]}>
              <Popup>
                <strong>{camp.name}</strong>
                <br />
                {camp.region}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>

      {/* Camps List */}
      {filteredCamps.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
          No relief camps found matching “{searchTerm}”.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredCamps.map((camp, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <ReliefCampCard camp={camp} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Camp Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
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
