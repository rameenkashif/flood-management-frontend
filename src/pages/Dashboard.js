import { Container, Grid, Typography } from '@mui/material';
import FloodPredictionCard from '../components/FloodPredictionCard';
import ReliefCampCard from '../components/ReliefCampCard';
import VolunteerCard from '../components/VolunteerCard';
import AssetCard from '../components/AssetCard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';


function Dashboard() {
return (
<Container style={{ marginTop: '50px' }}>
<Typography variant="h3" gutterBottom>Flood Management Dashboard</Typography>
<Grid container spacing={3}>
<Grid item xs={12} md={6}><FloodPredictionCard /></Grid>
<Grid item xs={12} md={6}><ReliefCampCard /></Grid>
<Grid item xs={12} md={6}><VolunteerCard /></Grid>
<Grid item xs={12} md={6}><AssetCard /></Grid>
</Grid>
</Container>
);
}


export default Dashboard;