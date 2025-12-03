import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { getVolunteers, createVolunteer, getPakistanCities, changeVolunteerStatus } from "../services/api";
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Volunteers() {
  const [open, setOpen] = useState(false);
  const authContext = useContext(AuthContext);
  const [volunteers, setVolunteers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    location: "",
    skill: "",
    status: "Available",
  });
  const [cities, setCities] = useState([]);
  const [skillFilter, setSkillFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchVolunteers = async () => {
      const data = await getVolunteers();
      if (data && Array.isArray(data)) {
        setVolunteers(data);
      }
    };
    fetchVolunteers();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const list = await getPakistanCities();
        setCities(list || []);
      } catch (err) {
        setCities([]);
      }
    };
    loadCities();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({
      name: "",
      phone: "",
      location: "",
      skill: "",
      status: "Available",
    });
  };

  const handleSubmit = async () => {
    // Require login; backend will derive name/phone from auth token
    const { user } = authContext;
    if (!user?.token) {
      alert('Please login to register as a volunteer');
      return;
    }
    if (form.skill) {
      try {
        const payload = {
          location: form.location,
          skill: form.skill,
          status: form.status,
        };
        const data = await createVolunteer(payload);
        // API returns { message, volunteer }
        const vol = data?.volunteer || data;
        setVolunteers([...volunteers, vol]);
        handleClose();
      } catch (err) {
        console.error("Error registering volunteer:", err);
      }
    }
  };

  const handleChangeStatus = async (vol) => {
    if (!authContext?.user || authContext.user.role !== 'admin') {
      alert('Only admins can change volunteer status');
      return;
    }
    const newStatus = vol.status === 'Available' ? 'Deployed' : 'Available';
    const ok = window.confirm(`Change status of ${vol.name} to ${newStatus}?`);
    if (!ok) return;
    try {
      const updated = await changeVolunteerStatus(vol._id || vol.id, newStatus);
      setVolunteers((prev) => prev.map((v) => (v._id === updated._id || v.id === updated._id ? updated : v)));
    } catch (err) {
      console.error('Failed to change status', err);
      alert('Failed to change status: ' + (err.message || err));
    }
  };

  const filteredVolunteers = volunteers.filter((v) => {
    const skillMatch = skillFilter ? v.skill === skillFilter : true;
    const statusMatch = statusFilter ? v.status === statusFilter : true;
    return skillMatch && statusMatch;
  });

  return (
    <Container sx={{ mt: 4, mb: 5 }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Volunteer Management
        </Typography>
        <Button variant="contained" color="primary" onClick={handleOpen} disabled={!authContext?.user?.token || authContext?.user?.role === 'admin'}>
          {authContext?.user?.token ? (authContext?.user?.role === 'admin' ? 'Admin cannot register' : '+ Register as Volunteer') : 'Login to Register'}
        </Button>
      </Box>

      {/* Volunteer List */}
      <Grid container spacing={3}>
        {filteredVolunteers.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography>No volunteers registered yet.</Typography>
            </Paper>
          </Grid>
        ) : (
          filteredVolunteers.map((vol, index) => (
            <Grid item xs={12} md={4} key={vol._id || index}>
              <Paper sx={{ p: 3, borderLeft: "4px solid #1565d8" }}>
                <Typography variant="h6" fontWeight="bold">
                  {vol.name}
                </Typography>
                <Typography variant="body2">📞 {vol.phone}</Typography>
                <Typography variant="body2">📍 {vol.location}</Typography>
                <Typography variant="body2">🧰 Skill: {vol.skill}</Typography>
                <Typography
                  variant="body2"
                  color={vol.status === "Available" ? "green" : "orange"}
                >
                  ⚙️ Status: {vol.status}
                </Typography>
                {authContext?.user?.role === 'admin' && (
                  <Box mt={2}>
                    <Button size="small" variant="outlined" onClick={() => handleChangeStatus(vol)}>
                      Change Status
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* Filters */}
      <Box
        mt={5}
        p={2}
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        sx={{ bgcolor: "#f5f5f5", borderRadius: 2 }}
      >
        <FormControl sx={{ minWidth: 200, mb: { xs: 2, md: 0 } }}>
          <InputLabel>Filter by Skill</InputLabel>
          <Select
            value={skillFilter}
            label="Filter by Skill"
            onChange={(e) => setSkillFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Medical">Medical</MenuItem>
            <MenuItem value="Tech">Tech</MenuItem>
            <MenuItem value="Search & Rescue">Search & Rescue</MenuItem>
            <MenuItem value="Food Distribution">Food Distribution</MenuItem>
            <MenuItem value="Donation Collector">Donation Collector</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Deployed">Deployed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Register Popup */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Register as Volunteer</DialogTitle>
        <DialogContent>
          {/* Name/phone derived from authenticated user; not editable */}
          {authContext?.user?.name ? (
            <>
              <Typography variant="body1">Registering as: <strong>{authContext.user.name}</strong></Typography>
              <Typography variant="body2">Contact: {authContext.user.email || authContext.user.phone || 'N/A'}</Typography>
            </>
          ) : (
            <Typography variant="body2">Please login to register as volunteer.</Typography>
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Location</InputLabel>
            <Select
              value={form.location}
              label="Location"
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            >
              <MenuItem value="">Select city</MenuItem>
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Skill</InputLabel>
            <Select
              value={form.skill}
              label="Skill"
              onChange={(e) => setForm({ ...form, skill: e.target.value })}
            >
              <MenuItem value="Medical">Medical</MenuItem>
              <MenuItem value="Tech">Tech</MenuItem>
              <MenuItem value="Search & Rescue">Search & Rescue</MenuItem>
              <MenuItem value="Food Distribution">Food Distribution</MenuItem>
              <MenuItem value="Donation Collector">Donation Collector</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.status}
              label="Status"
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Deployed">Deployed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Volunteers;
