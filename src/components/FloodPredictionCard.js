import { Card, CardContent, Typography } from '@mui/material';
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
<Card>
<CardContent>
<Typography variant="h5" gutterBottom>Flood Prediction & Alerts</Typography>
<Line data={data} />
</CardContent>
</Card>
);
}


export default FloodPredictionCard;