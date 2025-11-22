import React, { useState, useEffect, useRef } from "react";
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
import { getFloodData, createAlert, refreshAlerts } from "../services/api";
import AlertCard from "../components/AlertCard";
import { useAuth } from "../context/AuthContext";

const severityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [viewFilter, setViewFilter] = useState('active'); // active | previous | all
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(null);

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
    // start polling every 60 seconds
    pollingRef.current = setInterval(() => {
      fetchData();
    }, 60 * 1000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const fetchData = async () => {
    const params = {};
    if (viewFilter === 'active') params.active = true;
    else if (viewFilter === 'previous') params.active = false;
    const data = await getFloodData(params);
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

  useEffect(() => {
    // refetch when view changes
    fetchData();
  }, [viewFilter]);

  const handleCreateAlert = async () => {
    try {
      setLoading(true);
      await createAlert({
        ...newAlert,
        rainfall: Number(newAlert.rainfall) || 0,
        waterLevel: Number(newAlert.waterLevel) || 0,
        affectedPopulation: Number(newAlert.affected) || 0,
        lat: Number(newAlert.lat) || 0,
        lng: Number(newAlert.lng) || 0,
      });
      setOpen(false);
      await fetchData();
    } catch (err) {
      alert('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshExternal = async () => {
    try {
      setLoading(true);
      await refreshAlerts();
      await fetchData();
      alert('External alerts refreshed');
    } catch (err) {
      alert('Failed to refresh external alerts');
    } finally {
      setLoading(false);
    }
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
            size="small"
            label="Filter by Region"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
          <TextField
            select
            fullWidth
            size="small"
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
          <TextField
            select
            size="small"
            sx={{ width: 160 }}
            label="View"
            value={viewFilter}
            onChange={(e) => setViewFilter(e.target.value)}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="previous">Previous</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </TextField>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Button variant="outlined" onClick={handleRefreshExternal} disabled={loading} size="medium" sx={{ height: 44 }}>
            Refresh External
          </Button>
          {user?.role === 'admin' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpen(true)}
              size="medium"
              sx={{ height: 44 }}
            >
              + Create Alert
            </Button>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ marginBottom: "30px" }}>
        <MapContainer
          center={[30.3753, 69.3451]} // Pakistan center
          zoom={6}
          style={{ height: "350px", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredAlerts.map((alert, i) => {
            const lat = Number(alert.lat) || 0;
            const lng = Number(alert.lng) || 0;
            // choose color by severity
            const color =
              (alert.severity && alert.severity.toUpperCase() === 'CRITICAL' && 'red') ||
              (alert.severity && alert.severity.toUpperCase() === 'HIGH' && 'orange') ||
              (alert.severity && alert.severity.toUpperCase() === 'MEDIUM' && 'yellow') ||
              'green';

            const pinHtml = `<svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 24 24' fill='${color}'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z'/></svg>`;

            const icon = L.divIcon({
              html: pinHtml,
              className: '',
              iconSize: [36, 36],
              iconAnchor: [18, 36],
            });

            return (
              <Marker key={i} position={[lat, lng]} icon={icon}>
                <Popup>
                  <strong>{alert.region}</strong>
                  <br />
                  Severity: {alert.severity}
                  <br />
                  {alert.message}
                </Popup>
              </Marker>
            );
          })}
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

      {/* Create Alert Dialog (admin only) */}
      {user?.role === 'admin' && (
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
      )}
    </Container>
  );
}

export default Alerts;
