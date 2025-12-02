import { Card, CardContent, Typography, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


const data = { labels: ['Jan','Feb','Mar','Apr','May','Jun'], datasets: [{ label: 'Rainfall Intensity', data: [12,19,3,5,2,3], borderColor:'blue', fill:false }] };


function FloodPredictionCard() {
  return (
    <Card sx={{ height: 420 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>Flood Prediction & Alerts</Typography>
        <Box sx={{ flex: 1 }}>
          <Line data={data} />
        </Box>
      </CardContent>
    </Card>
  );
}


export default FloodPredictionCard;