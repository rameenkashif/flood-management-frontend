import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box } from '@mui/material';
import FloodPredictionCard from '../components/FloodPredictionCard';
import ReliefCampCard from '../components/ReliefCampCard';
import VolunteerCard from '../components/VolunteerCard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);
import Footer from '../components/Footer';
import { getReliefCamps, getFloodData, getDonations, getVolunteers } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [camps, setCamps] = useState([]);

  useEffect(() => {
    let mounted = true;
    // Fetch all summary data in parallel
    Promise.all([
      getFloodData({ active: true }),
      getDonations(),
      getVolunteers(),
      getReliefCamps()
    ]).then(([alertsData, donationsData, volunteersData, campsData]) => {
      if (!mounted) return;
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setDonations(Array.isArray(donationsData) ? donationsData : []);
      setVolunteers(Array.isArray(volunteersData) ? volunteersData : []);
      if (!Array.isArray(campsData)) return setCamps([]);
      // choose top 3 camps by totalCapacity (fallback to createdAt recent)
      const sorted = [...campsData].sort((a, b) => {
        const aCap = Number(a.totalCapacity ?? 0);
        const bCap = Number(b.totalCapacity ?? 0);
        if (aCap !== bCap) return bCap - aCap;
        // fallback to newer first
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
      setCamps(sorted.slice(0, 3));
    }).catch(() => {
      setAlerts([]);
      setDonations([]);
      setVolunteers([]);
      setCamps([]);
    });
    return () => { mounted = false; };
  }, []);

  // remove sample asset preview and render volunteers deployment chart instead

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
          Welcome back, {user?.name || user?.email || 'User'}!
        </Typography>
        <Typography>
          Real-time flood monitoring and disaster response coordination
        </Typography>
      </Box>

      {/* Summary Cards - now live data */}
      <Container sx={{ mb: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: '#d32f2f',
                color: 'white',
                cursor: 'default',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 18px 42px rgba(211,47,47,0.24)'
                }
              }}
            >
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>{alerts.length}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{alerts.filter(a => a.severity === 'CRITICAL').length} critical alerts</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Active Alerts</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: '#1565d8',
                color: 'white',
                cursor: 'default',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 18px 42px rgba(21,101,216,0.24)'
                }
              }}
            >
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>{camps.length}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>{camps.reduce((sum, c) => sum + Number(c.totalCapacity || 0), 0)} spaces available</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Relief Camps</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: '#2e7d32',
                color: 'white',
                cursor: 'default',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 18px 42px rgba(46,125,50,0.24)'
                }
              }}
            >
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>{volunteers.length}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>Ready to help</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Volunteers</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: '#6a1b9a',
                color: 'white',
                cursor: 'default',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 18px 42px rgba(106,27,154,0.24)'
                }
              }}
            >
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>{donations.length}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>Active offers</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)' }}>Donations</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Chart & Map Section */}
      <Container>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2, mt: 3, position: 'relative' }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Analytics & Monitoring</Typography>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              textAlign: { xs: 'left', md: 'left' },
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            {/* position absolute on md+ so the left edge is exactly at 50% of the container */}
            <Typography
              className="top-relief-title"
              variant="h5"
              sx={{
                fontWeight: 'bold',
                position: { xs: 'static', md: 'absolute' },
                left: { md: '50%' },
                top: { md: '50%' },
                transform: { md: 'translateX(0) translateY(-50%)' },
                zIndex: { md: 2 },
              }}
            >
              Top Relief Camps
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FloodPredictionCard />
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              {camps.length === 0 ? (
                <Typography color="text.secondary">No camps available</Typography>
              ) : (
                camps.map((camp) => (
                  <Grid item xs={12} md={6} lg={4} key={camp._id}>
                    <ReliefCampCard camp={camp} />
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <VolunteerCard />
          </Grid>

          {/* Volunteer deployment pie chart (Available / Deployed) */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 3, boxShadow: 3, height: 420 }}>
              <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>Volunteer deployment</Typography>

                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* chart container controls size for responsive Doughnut */}
                  <Box sx={{ width: '80%', maxWidth: 360, height: 260 }}>
                    <Doughnut
                      data={{
                        labels: ['Available', 'Deployed'],
                        datasets: [{
                          data: [volunteers.filter(v => (v.status || '').toLowerCase() === 'available').length, volunteers.filter(v => (v.status || '').toLowerCase() === 'deployed').length],
                          backgroundColor: ['#FFD54F', '#0D47A1'],
                          hoverBackgroundColor: ['#FFEB3B', '#0B3B91'],
                          borderWidth: 2,
                        }]
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } }
                        }
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#FFD54F', borderRadius: '2px' }} />
                    <Typography variant="body2">Available</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#0D47A1', borderRadius: '2px' }} />
                    <Typography variant="body2">Deployed</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
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
