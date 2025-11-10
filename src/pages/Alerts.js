import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getFloodData, createAlert } from "../services/api";
import AlertCard from "../components/AlertCard";

const severityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [open, setOpen] = useState(false);

  const [newAlert, setNewAlert] = useState({
    region: "",
    severity: "",
    rainfall: "",
    waterLevel: "",
    affected: "",
    message: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getFloodData();
    setAlerts(data);
    setFilteredAlerts(data);
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (regionFilter.trim()) {
      filtered = filtered.filter((a) =>
        a.region.toLowerCase().includes(regionFilter.toLowerCase())
      );
    }

    if (severityFilter.trim()) {
      filtered = filtered.filter((a) => a.severity === severityFilter);
    }

    setFilteredAlerts(filtered);
  };

  useEffect(() => {
    filterAlerts();
  }, [regionFilter, severityFilter]);

  const handleCreateAlert = async () => {
    await createAlert(newAlert);
    setOpen(false);
    fetchData();
  };

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Flood Alerts
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Real-time flood warnings and predictions
      </Typography>

      {/* Filters + Create Button */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: "20px", width: "70%" }}>
          <TextField
            fullWidth
            label="Filter by Region"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
          <TextField
            select
            fullWidth
            label="Filter by Severity"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <MenuItem value="">All Severities</MenuItem>
            {severityOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <Button
          variant="contained"
          color="error"
          onClick={() => setOpen(true)}
          sx={{ height: "55px" }}
        >
          + Create Alert
        </Button>
      </div>

      {/* Map */}
      <div style={{ marginBottom: "30px" }}>
        <MapContainer
          center={[30.3753, 69.3451]} // Pakistan center
          zoom={6}
          style={{ height: "350px", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredAlerts.map((alert, i) => (
            <Marker
              key={i}
              position={[alert.lat, alert.lng]}
              icon={L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                iconSize: [35, 35],
              })}
            >
              <Popup>
                <strong>{alert.region}</strong>
                <br />
                Severity: {alert.severity}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Alert Cards */}
      {filteredAlerts.length > 0 ? (
        filteredAlerts.map((alert, index) => (
          <AlertCard key={index} alert={alert} />
        ))
      ) : (
        <Typography color="textSecondary">No alerts found.</Typography>
      )}

      {/* Create Alert Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Create New Alert</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Region"
            value={newAlert.region}
            onChange={(e) => setNewAlert({ ...newAlert, region: e.target.value })}
          />
          <TextField
            select
            label="Severity"
            value={newAlert.severity}
            onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
          >
            {severityOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Rainfall (mm)"
            value={newAlert.rainfall}
            onChange={(e) => setNewAlert({ ...newAlert, rainfall: e.target.value })}
          />
          <TextField
            label="Water Level (m)"
            value={newAlert.waterLevel}
            onChange={(e) => setNewAlert({ ...newAlert, waterLevel: e.target.value })}
          />
          <TextField
            label="Affected Population"
            value={newAlert.affected}
            onChange={(e) => setNewAlert({ ...newAlert, affected: e.target.value })}
          />
          <TextField
            label="Alert Message"
            multiline
            rows={3}
            value={newAlert.message}
            onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
          />
          <TextField
            label="Latitude"
            value={newAlert.lat}
            onChange={(e) => setNewAlert({ ...newAlert, lat: e.target.value })}
          />
          <TextField
            label="Longitude"
            value={newAlert.lng}
            onChange={(e) => setNewAlert({ ...newAlert, lng: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAlert}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Alerts;
