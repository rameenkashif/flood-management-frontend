import { Card, CardContent, Typography, Box } from "@mui/material";

function AssetCard({ asset }) {
  // ✅ Prevent crash if asset is undefined
  if (!asset) {
    return (
      <Card sx={{ p: 3, textAlign: "center", color: "gray" }}>
        <Typography variant="body2">No asset data available</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ boxShadow: 3 }}>
      {asset.photo && (
        <img
          src={asset.photo}
          alt={asset.name}
          width="100%"
          height="180"
          style={{ objectFit: "cover" }}
        />
      )}
      <CardContent>
        <Typography variant="h6" fontWeight="bold">
          {asset.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {asset.type}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {asset.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Value:</strong> PKR {asset.value}
          </Typography>
          <Typography variant="body2">
            <strong>Location:</strong> {asset.location}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>Registered on:</strong> {asset.dateRegistered}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AssetCard;
