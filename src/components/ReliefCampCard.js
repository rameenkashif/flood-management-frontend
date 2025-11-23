import { Card, CardContent, Typography, Grid } from "@mui/material";

function ReliefCampCard({ camp }) {
  if (!camp) return null;

  const capacity = camp.totalCapacity ?? camp.capacity ?? 'N/A';
  const contact = camp.contact ?? camp.contactPerson ?? '';
  const location = camp.location ?? '';
  const region = camp.region ?? '';
  const facilities = Array.isArray(camp.facilities) ? camp.facilities.join(', ') : '';

  return (
    <Grid item xs={12} md={6} lg={4}>
      <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            {camp.name}
          </Typography>
          <Typography variant="body2">
            <strong>📍 Location:</strong> {location}
          </Typography>
          <Typography variant="body2">
            <strong>🌍 Region:</strong> {region}
          </Typography>
          <Typography variant="body2">
            <strong>🏕 Capacity:</strong> {capacity} people
          </Typography>
          {contact && (
            <Typography variant="body2">
              <strong>👤 Contact:</strong> {contact}
            </Typography>
          )}
          {facilities && (
            <Typography variant="body2">
              <strong>🧰 Facilities:</strong> {facilities}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}

export default ReliefCampCard;
