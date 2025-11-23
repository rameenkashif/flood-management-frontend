import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import FloodPredictionCard from '../components/FloodPredictionCard';
import ReliefCampCard from '../components/ReliefCampCard';
import VolunteerCard from '../components/VolunteerCard';
import AssetCard from '../components/AssetCard';
import Footer from '../components/Footer';
import { getReliefCamps } from '../services/api';

function Dashboard() {
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    let mounted = true;
    getReliefCamps()
      .then((data) => {
        if (!mounted) return;
        if (!Array.isArray(data)) return setCamps([]);
        // choose top 3 camps by totalCapacity (fallback to createdAt recent)
        const sorted = [...data].sort((a, b) => {
          const aCap = Number(a.totalCapacity ?? 0);
          const bCap = Number(b.totalCapacity ?? 0);
          if (aCap !== bCap) return bCap - aCap;
          // fallback to newer first
          const aTime = new Date(a.createdAt || 0).getTime();
          const bTime = new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        });
        setCamps(sorted.slice(0, 3));
      })
      .catch(() => setCamps([]));
    return () => { mounted = false; };
  }, []);
  // ✅ Sample asset data to prevent runtime crash
  const sampleAsset = {
    photo: "https://via.placeholder.com/400x200",
    name: "Rescue Boat",
    type: "Equipment",
    description: "Used for flood area evacuations",
    value: "250000",
    location: "Islamabad",
    dateRegistered: "2025-10-25",
  };

  return (
    <>
      {/* Welcome Section */}
      <Box
        sx={{
          bgcolor: '#1565d8',
          color: 'white',
          p: 4,
          borderRadius: 2,
          mt: 3,
          mb: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Welcome back, rameen kashif!
        </Typography>
        <Typography>
          Real-time flood monitoring and disaster response coordination
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Container sx={{ mb: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderLeft: '5px solid red' }}>
              <Typography variant="h5">5</Typography>
              <Typography color="error">3 critical alerts</Typography>
              <Typography variant="body2">Active Alerts</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderLeft: '5px solid blue' }}>
              <Typography variant="h5">4</Typography>
              <Typography color="primary">7150 spaces available</Typography>
              <Typography variant="body2">Relief Camps</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderLeft: '5px solid green' }}>
              <Typography variant="h5">0</Typography>
              <Typography color="green">Ready to help</Typography>
              <Typography variant="body2">Volunteers</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, borderLeft: '5px solid purple' }}>
              <Typography variant="h5">3</Typography>
              <Typography color="secondary">Active offers</Typography>
              <Typography variant="body2">Donations</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Chart & Map Section */}
      <Container>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}>
          Analytics & Monitoring
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FloodPredictionCard />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 1 }}>Top Relief Camps</Typography>
            <Grid container spacing={2}>
              {camps.length === 0 ? (
                <Typography color="text.secondary">No camps available</Typography>
              ) : (
                camps.map((camp) => (
                  <ReliefCampCard camp={camp} key={camp._id} />
                ))
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <VolunteerCard />
          </Grid>

          {/* ✅ Fixed AssetCard - now safely receives asset data */}
          <Grid item xs={12} md={6}>
            <AssetCard asset={sampleAsset} />
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: 5 }}>
        <Footer />
      </Box>
    </>
  );
}

export default Dashboard;
