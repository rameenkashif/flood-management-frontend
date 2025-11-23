import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
} from "@mui/material";
import {
  MessageSquare,
  HelpCircle,
  Megaphone,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { getCommunityUpdates, addCommunityUpdate, getPakistanCities } from "../services/api";

function Community() {
  const [updates, setUpdates] = useState([]);
  const [filterRegion, setFilterRegion] = useState("All Regions");
  const [filterType, setFilterType] = useState("All Types");
  const [filterPriority, setFilterPriority] = useState("All Priorities");
  const [openDialog, setOpenDialog] = useState(false);
  const { user, isLoggedIn } = useAuth();

  const [newUpdate, setNewUpdate] = useState({
    name: user?.name || "",
    region: "",
    type: "Update",
    priority: "Medium",
    title: "",
    message: "",
    tags: "",
  });
  const [cities, setCities] = useState([]);

  useEffect(() => {
    getCommunityUpdates().then(setUpdates);
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

  const filteredUpdates = updates.filter((u) => {
    const matchesRegion =
      filterRegion === "All Regions" || u.region === filterRegion;
    const matchesType = filterType === "All Types" || u.type === filterType;
    const matchesPriority =
      filterPriority === "All Priorities" || u.priority === filterPriority;
    return matchesRegion && matchesType && matchesPriority;
  });

  const handlePost = async () => {
    // prefer logged-in user's name
    const payload = { ...newUpdate, name: user?.name || newUpdate.name };
    const newEntry = await addCommunityUpdate(payload);
    setUpdates([...updates, newEntry]);
    setOpenDialog(false);
    setNewUpdate({
      name: user?.name || "",
      region: "",
      type: "Update",
      priority: "Medium",
      title: "",
      message: "",
      tags: "",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Request":
        return <HelpCircle color="#a855f7" />;
      case "Announcement":
        return <Megaphone color="#22c55e" />;
      case "Alert":
        return <AlertTriangle color="#ef4444" />;
      default:
        return <MessageSquare color="#3b82f6" />;
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold">
        Community Updates
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Real-time coordination and emergency communication
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { type: "Updates", count: updates.filter((u) => u.type === "Update").length, icon: <MessageSquare /> },
          { type: "Requests", count: updates.filter((u) => u.type === "Request").length, icon: <HelpCircle /> },
          { type: "Announcements", count: updates.filter((u) => u.type === "Announcement").length, icon: <Megaphone /> },
          { type: "Alerts", count: updates.filter((u) => u.type === "Alert").length, icon: <AlertTriangle /> },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.type}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h5">{item.count}</Typography>
                <Typography>{item.type}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Region</InputLabel>
            <Select
              value={filterRegion}
              label="Filter by Region"
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <MenuItem value="All Regions">All Regions</MenuItem>
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="All Types">All Types</MenuItem>
              <MenuItem value="Update">Update</MenuItem>
              <MenuItem value="Request">Request</MenuItem>
              <MenuItem value="Announcement">Announcement</MenuItem>
              <MenuItem value="Alert">Alert</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Priority</InputLabel>
            <Select
              value={filterPriority}
              label="Filter by Priority"
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <MenuItem value="All Priorities">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Post Update Button */}
      <Box textAlign="right" mb={2}>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => setOpenDialog(true)}
          sx={{ backgroundColor: "#9333ea" }}
        >
          Post Update
        </Button>
      </Box>

      {/* Updates List */}
      {filteredUpdates.map((u, idx) => (
        <Card
          key={idx}
          sx={{
            mb: 2,
            borderLeft: `5px solid ${
              u.type === "Alert"
                ? "#ef4444"
                : u.type === "Request"
                ? "#a855f7"
                : u.type === "Announcement"
                ? "#22c55e"
                : "#3b82f6"
            }`,
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {getTypeIcon(u.type)}
              <Typography variant="h6">{u.title}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={1}>
              {u.message}
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              <Chip label={(u.type || 'Update').toLowerCase()} />
              <Chip label={`${(u.priority || 'Medium').toLowerCase()} priority`} />
              <Chip label={u.region} />
              {u.tags &&
                u.tags.split(",").map((t) => (
                  <Chip
                    key={t.trim()}
                    label={`#${t.trim()}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
            >
              Posted by {u.name}
            </Typography>
          </CardContent>
        </Card>
      ))}

      {/* Post Update Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Post Community Update</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Your Name"
            margin="normal"
            value={newUpdate.name}
            onChange={(e) => setNewUpdate({ ...newUpdate, name: e.target.value })}
            disabled={isLoggedIn}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Region</InputLabel>
            <Select
              value={newUpdate.region}
              label="Region"
              onChange={(e) => setNewUpdate({ ...newUpdate, region: e.target.value })}
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
            <InputLabel>Message Type</InputLabel>
            <Select
              value={newUpdate.type}
              label="Message Type"
              onChange={(e) => setNewUpdate({ ...newUpdate, type: e.target.value })}
            >
              <MenuItem value="Update">Update</MenuItem>
              <MenuItem value="Request">Request</MenuItem>
              <MenuItem value="Announcement">Announcement</MenuItem>
              <MenuItem value="Alert">Alert</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={newUpdate.priority}
              label="Priority"
              onChange={(e) =>
                setNewUpdate({ ...newUpdate, priority: e.target.value })
              }
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={newUpdate.title}
            onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Message Content"
            margin="normal"
            value={newUpdate.message}
            onChange={(e) =>
              setNewUpdate({ ...newUpdate, message: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Tags (comma separated)"
            margin="normal"
            value={newUpdate.tags}
            onChange={(e) => setNewUpdate({ ...newUpdate, tags: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePost}>
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Community;
