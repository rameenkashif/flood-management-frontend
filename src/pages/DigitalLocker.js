import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
} from "@mui/material";
import { getAssets, addAsset, getAssetSummary } from "../services/api";
import AssetCard from "../components/AssetCard";

function DigitalLocker() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({ totalAssets: 0, protectedAssets: 0, totalValue: 0 });
  const [open, setOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    type: "Home/Property",
    name: "",
    description: "",
    value: "",
    location: "",
    photo: "",
  });

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    const data = await getAssets();
    const summaryData = await getAssetSummary();
    setAssets(data);
    setSummary(summaryData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const reader = new FileReader();
      reader.onload = () => setNewAsset((prev) => ({ ...prev, photo: reader.result }));
      reader.readAsDataURL(files[0]);
    } else {
      setNewAsset((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!newAsset.name || !newAsset.value) return alert("Please fill all required fields.");
    await addAsset(newAsset);
    setOpen(false);
    setNewAsset({ type: "Home/Property", name: "", description: "", value: "", location: "", photo: "" });
    loadAssets();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        💼 Digital Asset Locker
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Register and protect your valuable assets with digital insurance.
      </Typography>

      {/* Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold">
            Protect Your Assets with Digital Insurance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register your assets to ensure government or NGO compensation in case of flood damage.
            All records are securely stored and legally recognized.
          </Typography>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card><CardContent><Typography align="center" variant="h5">{summary.totalAssets}</Typography><Typography align="center">Total Assets</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent><Typography align="center" variant="h5">{summary.protectedAssets}</Typography><Typography align="center">Protected Assets</Typography></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent><Typography align="center" variant="h5">PKR {summary.totalValue}</Typography><Typography align="center">Total Value</Typography></CardContent></Card>
        </Grid>
      </Grid>

      {/* Register New Asset Button */}
      <Box textAlign="right" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => setOpen(true)}>+ Register New Asset</Button>
      </Box>

      {/* Asset List */}
      <Grid container spacing={2}>
        {assets.map((asset) => (
          <Grid item xs={12} sm={6} md={4} key={asset.id}>
            <AssetCard asset={asset} />
          </Grid>
        ))}
      </Grid>

      {/* Dialog Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Register New Asset</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Asset Type"
            name="type"
            fullWidth
            margin="dense"
            value={newAsset.type}
            onChange={handleChange}
          >
            <MenuItem value="Home/Property">🏠 Home/Property</MenuItem>
            <MenuItem value="Vehicle">🚗 Vehicle</MenuItem>
            <MenuItem value="Business">🏢 Business</MenuItem>
          </TextField>
          <TextField label="Asset Name" name="name" fullWidth margin="dense" onChange={handleChange} value={newAsset.name} />
          <TextField label="Description" name="description" fullWidth multiline rows={2} margin="dense" onChange={handleChange} value={newAsset.description} />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField label="Estimated Value (PKR)" name="value" margin="dense" onChange={handleChange} value={newAsset.value} fullWidth />
            <TextField label="Location" name="location" margin="dense" onChange={handleChange} value={newAsset.location} fullWidth />
          </Box>
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Upload Photo
            <input type="file" hidden name="photo" accept="image/*" onChange={handleChange} />
          </Button>
          {newAsset.photo && (
            <Box sx={{ mt: 2 }}>
              <img src={newAsset.photo} alt="asset" width="100%" style={{ borderRadius: 8 }} />
            </Box>
          )}
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSubmit}>
            Save Asset
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default DigitalLocker;
