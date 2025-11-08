import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import FloodPredictionCard from '../components/FloodPredictionCard';
import ReliefCampCard from '../components/ReliefCampCard';
import VolunteerCard from '../components/VolunteerCard';
import AssetCard from '../components/AssetCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="default" sx={{ boxShadow: 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            FloodGuard
          </Typography>

          <Box>
            <Button color="primary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button color="primary" onClick={() => navigate('/alerts')}>
              Flood Alerts
            </Button>
            <Button color="primary" onClick={() => navigate('/digital-locker')}>
              Asset Locker
            </Button>
            <Button color="primary" onClick={() => navigate('/relief-camps')}>
              Relief Camps
            </Button>
            <Button color="primary" onClick={() => navigate('/volunteers')}>
              Volunteers
            </Button>
            <Button color="primary" onClick={() => navigate('/donations')}>
              Donations
            </Button>
            <Button color="primary" onClick={() => navigate('/community')}>
              Community
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

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
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', mb: 2, mt: 3 }}
        >
          Analytics & Monitoring
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {/* FloodPredictionCard includes rainfall trend/chart */}
            <FloodPredictionCard />
          </Grid>

          <Grid item xs={12} md={6}>
            {/* ReliefCampCard includes map or camp visuals */}
            <ReliefCampCard />
          </Grid>

          <Grid item xs={12} md={6}>
            <VolunteerCard />
          </Grid>

          <Grid item xs={12} md={6}>
            <AssetCard />
          </Grid>
        </Grid>
      </Container>

      {/* Footer (optional if defined) */}
      <Box sx={{ mt: 5 }}>
        <Footer />
      </Box>
    </>
  );
}

export default Dashboard;
