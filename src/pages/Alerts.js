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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getFloodData, createAlert, refreshAlerts, getPakistanCities } from "../services/api";
import AlertCard from "../components/AlertCard";
import { useAuth } from "../context/AuthContext";

const severityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [cities, setCities] = useState([]);
  const [severityFilter, setSeverityFilter] = useState("");
  const [viewFilter, setViewFilter] = useState('active'); // active | previous | all
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef(null);

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

  useEffect(() => {
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

      {/* Filters + Refresh Button */}
      <div style={{ display: "flex", gap: "16px", marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        <FormControl sx={{ minWidth: 220, height: 56 }}>
          <InputLabel>Filter by Region</InputLabel>
          <Select
            value={regionFilter}
            label="Filter by Region"
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <MenuItem value="">All Regions</MenuItem>
            {cities.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 200, height: 56 }}>
          <InputLabel>Filter by Severity</InputLabel>
          <Select
            value={severityFilter}
            label="Filter by Severity"
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <MenuItem value="">All Severities</MenuItem>
            {severityOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 160, height: 56 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={viewFilter}
            label="View"
            onChange={(e) => setViewFilter(e.target.value)}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="previous">Previous</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={handleRefreshExternal} disabled={loading} size="medium" sx={{ height: 56, whiteSpace: 'nowrap' }}>
          Refresh External
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


    </Container>
  );
}

export default Alerts;
