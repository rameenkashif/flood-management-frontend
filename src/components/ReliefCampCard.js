import { Card, CardContent, Typography, Grid, Box } from "@mui/material";

const mockCamps = [
  {
    id: 1,
    name: "City Central Relief Camp",
    location: "Hyderabad",
    region: "Sindh",
    capacity: 300,
    contactPerson: "Ali Khan",
    phone: "+92 333 1234567",
  },
  {
    id: 2,
    name: "Coastal Shelter Camp",
    location: "Karachi",
    region: "Sindh",
    capacity: 450,
    contactPerson: "Sara Ahmed",
    phone: "+92 322 9876543",
  },
  {
    id: 3,
    name: "North Valley Camp",
    location: "Sukkur",
    region: "Sindh",
    capacity: 220,
    contactPerson: "Bilal Qureshi",
    phone: "+92 334 4567890",
  },
];

function ReliefCampCard() {
  return (
    <Box sx={{ marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Existing Relief Camps
      </Typography>

      <Grid container spacing={2}>
        {mockCamps.map((camp) => (
          <Grid item xs={12} md={6} lg={4} key={camp.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {camp.name}
                </Typography>
                <Typography variant="body2">
                  <strong>📍 Location:</strong> {camp.location}
                </Typography>
                <Typography variant="body2">
                  <strong>🌍 Region:</strong> {camp.region}
                </Typography>
                <Typography variant="body2">
                  <strong>🏕 Capacity:</strong> {camp.capacity} people
                </Typography>
                <Typography variant="body2">
                  <strong>👤 Contact:</strong> {camp.contactPerson}
                </Typography>
                <Typography variant="body2">
                  <strong>📞 Phone:</strong> {camp.phone}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ReliefCampCard;
