import { Card, CardContent, Typography } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';


function ReliefCampCard() {
return (
<Card style={{ height: '400px' }}>
<CardContent>
<Typography variant="h5" gutterBottom>Relief Camps</Typography>
<MapContainer center={[24.8607, 67.0011]} zoom={13} style={{ height:'300px' }}>
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
<Marker position={[24.8607, 67.0011]}><Popup>Relief Camp A</Popup></Marker>
<Marker position={[24.867, 67.010]}><Popup>Relief Camp B</Popup></Marker>
</MapContainer>
</CardContent>
</Card>
);
}


export default ReliefCampCard;