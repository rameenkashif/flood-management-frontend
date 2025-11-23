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
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { getAssets, addAsset, getAssetSummary, getPakistanCities } from "../services/api";
import { updateAsset, deleteAsset } from "../services/api";
import AssetCard from "../components/AssetCard";
import AgreementView from "../components/AgreementView";

function DigitalLocker() {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({ totalAssets: 0, protectedAssets: 0, totalValue: 0 });
  const [open, setOpen] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [agreementAutoDownload, setAgreementAutoDownload] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [newAsset, setNewAsset] = useState({
    type: "Home/Property",
    name: "",
    description: "",
    value: "",
    location: "",
    photo: "",
  });
  const [cities, setCities] = useState([]);

  useEffect(() => {
    loadAssets();
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

  const loadAssets = async () => {
    const data = await getAssets();
    const summaryData = await getAssetSummary();
    setAssets(data);
    setSummary(summaryData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      // Resize image before storing to avoid localStorage quota issues
      const file = files[0];
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          const maxDim = 1024; // limit largest dimension
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = width / height;
            if (width > height) {
              width = maxDim;
              height = Math.round(maxDim / ratio);
            } else {
              height = maxDim;
              width = Math.round(maxDim * ratio);
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // use jpeg to reduce size
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setNewAsset((prev) => ({ ...prev, photo: dataUrl }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
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
      <Typography variant="h4" fontWeight={600}>
         Digital Asset Locker
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

      {/* Register New Asset Button + Agreement Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {assets.length > 0 && (
            <>
              <Button variant="outlined" onClick={() => { setAgreementOpen(true); setAgreementAutoDownload(false); }}>View Agreement</Button>
              <Button variant="contained" onClick={() => { setAgreementOpen(true); setAgreementAutoDownload(true); }}>Download Agreement</Button>
              <Button variant={deleteMode ? "contained" : "outlined"} color={deleteMode ? "error" : "inherit"} onClick={() => { setDeleteMode(!deleteMode); setSelectedForDelete(null); }}>
                {deleteMode ? 'Cancel Delete' : 'Delete Asset'}
              </Button>
            </>
          )}
          <Button variant="contained" onClick={() => setOpen(true)}>+ Register New Asset</Button>
        </Box>
      </Box>

      {/* Asset List */}
      <Grid container spacing={2}>
        {assets.map((asset) => (
          <Grid item xs={12} sm={6} md={4} key={asset.id}>
            <AssetCard
              asset={asset}
              onEdit={(a) => { setEditingAssetId(a.id); setNewAsset({ type: a.type, name: a.name, description: a.description, value: a.value, location: a.location, photo: a.photo }); setOpen(true); }}
              selectable={deleteMode}
              selected={selectedForDelete === asset.id}
              onSelect={(a) => {
                if (deleteMode) {
                  setSelectedForDelete(a.id);
                  setConfirmDeleteOpen(true);
                }
              }}
            />
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
            <FormControl fullWidth margin="dense">
              <InputLabel>Location</InputLabel>
              <Select name="location" value={newAsset.location} label="Location" onChange={handleChange}>
                <MenuItem value="">Select city</MenuItem>
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
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
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={async () => {
            if (editingAssetId) {
              // update
              try {
                await updateAsset(editingAssetId, newAsset);
                setEditingAssetId(null);
                setOpen(false);
                setNewAsset({ type: "Home/Property", name: "", description: "", value: "", location: "", photo: "" });
                loadAssets();
              } catch (e) {
                alert('Failed to update asset');
              }
            } else {
              await handleSubmit();
            }
          }}>
            {editingAssetId ? 'Save Changes' : 'Save Asset'}
          </Button>
        </DialogContent>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this asset?</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => { setConfirmDeleteOpen(false); setSelectedForDelete(null); }}>Cancel</Button>
            <Button color="error" variant="contained" onClick={async () => {
              if (selectedForDelete) {
                try {
                  await deleteAsset(selectedForDelete);
                  setConfirmDeleteOpen(false);
                  setSelectedForDelete(null);
                  setDeleteMode(false);
                  loadAssets();
                } catch (e) {
                  alert('Failed to delete asset');
                }
              }
            }}>Delete</Button>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Agreement View / Download Dialog */}
      {/** lazy load the component to avoid bundling errors if html2canvas missing */}
      {agreementOpen && (
        <AgreementView
          open={agreementOpen}
          autoDownload={agreementAutoDownload}
          onClose={() => { setAgreementOpen(false); setAgreementAutoDownload(false); }}
          assets={assets}
        />
      )}
    </Container>
  );
}

export default DigitalLocker;
