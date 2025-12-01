import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Modal,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { getDonations, createDonation, getPakistanCities } from "../services/api";
import { AuthContext } from "../context/AuthContext";

// ---------------- MOCK DONATION DATA ----------------
const mockDonations = [
  {
    id: 1,
    name: "Ali Khan",
    contact: "03001234567",
    type: "Food",
    quantity: 50,
    estimatedValue: 5000,
    targetRegion: "Hyderabad",
    pickupLocation: "Warehouse 1",
    status: "In Transit",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    contact: "03111234567",
    type: "Medical Supplies",
    quantity: 20,
    estimatedValue: 12000,
    targetRegion: "Karachi",
    pickupLocation: "Warehouse 2",
    status: "Delivered",
  },
  {
    id: 3,
    name: "Hassan Ali",
    contact: "03221234567",
    type: "Clothes",
    quantity: 100,
    estimatedValue: 15000,
    targetRegion: "Lahore",
    pickupLocation: "Warehouse 3",
    status: "In Transit",
  },
  {
    id: 4,
    name: "Fatima Noor",
    contact: "03331234567",
    type: "Cash",
    quantity: 1,
    estimatedValue: 10000,
    targetRegion: "Islamabad",
    pickupLocation: "Bank Deposit",
    status: "Delivered",
  },
];

const donationTypes = ["All", "Food", "Clothes", "Medical Supplies", "Cash"];

const Donations = () => {
  const [donations, setDonations] = useState([]);
  const [filteredType, setFilteredType] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [newDonation, setNewDonation] = useState({
    name: "",
    contact: "",
    type: "",
    quantity: "",
    estimatedValue: "",
    targetRegion: "",
    pickupLocation: "",
    status: "In Transit",
  });

  const { user } = useContext(AuthContext);

  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchDonations = async () => {
      // only fetch donations when user is logged in; admin will receive all from backend
      if (!user?.token) {
        setDonations([]);
        return;
      }
      try {
        const data = await getDonations();
        setDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load donations:', err);
        setDonations([]);
      }
    };
    fetchDonations();
  }, [user]);

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


  const handleFilterChange = (event) => {
    setFilteredType(event.target.value);
  };

  const filteredDonations =
    filteredType === "All"
      ? donations
      : donations.filter((d) => d.type === filteredType);

  // Stats calculations
  const totalDonations = donations.length;
  const inTransit = donations.filter((d) => d.status === "In Transit").length;
  const totalValue = donations.reduce(
    (sum, d) => sum + Number(d.estimatedValue),
    0
  );

  // Modal handlers
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDonation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // backend will derive donor name/contact from auth token; send form fields only
      const payload = {
        type: newDonation.type,
        quantity: Number(newDonation.quantity || 0),
        estimatedValue: Number(newDonation.estimatedValue || 0),
        targetRegion: newDonation.targetRegion,
        pickupLocation: newDonation.pickupLocation,
        status: newDonation.status,
      };
      const data = await createDonation(payload);
      setDonations((prev) => [...prev, data]);
      setNewDonation({
        name: "",
        contact: "",
        type: "",
        quantity: "",
        estimatedValue: "",
        targetRegion: "",
        pickupLocation: "",
        status: "In Transit",
      });
      handleClose();
    } catch (err) {
      console.error("Error submitting donation:", err);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" fontWeight={600}>
        Donations Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Donations</Typography>
              <Typography variant="h4">{totalDonations}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">In Transit</Typography>
              <Typography variant="h4">{inTransit}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Value (PKR)</Typography>
              <Typography variant="h4">{totalValue}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Controls */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={filteredType} onChange={handleFilterChange} label="Filter by Type">
            {donationTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpen}
          disabled={!user?.token || user?.role === 'admin'}
          sx={user?.role === 'admin' ? { filter: 'blur(1px)', opacity: 0.7, pointerEvents: 'none' } : {}}
        >
          {user?.token ? 'Make a Donation' : 'Login to Donate'}
        </Button>
      </Box>

      {/* Donations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Quantity/Amount</TableCell>
              <TableCell>Estimated Value</TableCell>
              <TableCell>Target Region</TableCell>
              <TableCell>Pickup Location</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDonations.map((donation) => (
              <TableRow key={donation._id || donation.id}>
                <TableCell>{donation.name || (donation.userId && (donation.userId.name || donation.userId.email)) || 'Unknown'}</TableCell>
                <TableCell>{donation.contact || (donation.userId && (donation.userId.phone || donation.userId.email)) || 'N/A'}</TableCell>
                <TableCell>{donation.type}</TableCell>
                <TableCell>{donation.quantity}</TableCell>
                <TableCell>{donation.estimatedValue}</TableCell>
                <TableCell>{donation.targetRegion}</TableCell>
                <TableCell>{donation.pickupLocation}</TableCell>
                <TableCell>{donation.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Donation Modal */}
      <Modal open={openModal} onClose={handleClose}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6">Make a Donation</Typography>
          {/* Donor identity is taken from authenticated user; no free-text name/contact allowed */}
          <FormControl required>
            <InputLabel>Donation Type</InputLabel>
            <Select
              name="type"
              value={newDonation.type}
              onChange={handleInputChange}
            >
              {donationTypes.slice(1).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Quantity/Amount"
            name="quantity"
            type="number"
            value={newDonation.quantity}
            onChange={handleInputChange}
            required
          />
          <TextField
            label="Estimated Value (PKR)"
            name="estimatedValue"
            type="number"
            value={newDonation.estimatedValue}
            onChange={handleInputChange}
            required
          />
          <FormControl required>
            <InputLabel id="target-region-label">Target Region</InputLabel>
            <Select
              labelId="target-region-label"
              name="targetRegion"
              value={newDonation.targetRegion}
              onChange={handleInputChange}
              label="Target Region"
            >
              {cities && cities.length > 0 ? (
                cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="">No cities available</MenuItem>
              )}
            </Select>
          </FormControl>
          <TextField
            label="Pickup Location"
            name="pickupLocation"
            value={newDonation.pickupLocation}
            onChange={handleInputChange}
            required
          />
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Donations;
