import React from "react";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

function VolunteerCard() {
  const navigate = useNavigate();

  return (
    <Card sx={{ boxShadow: 3, p: 2 }}>
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Volunteers & Donations
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Manage registered volunteers and their deployment.
        </Typography>
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/volunteers")}
          >
            View Volunteers
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default VolunteerCard;
