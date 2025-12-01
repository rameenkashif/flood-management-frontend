import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

function AssetCard({ asset, onEdit, onSelect, selectable, selected }) {
  // ✅ Prevent crash if asset is undefined
  if (!asset) {
    return (
      <Card sx={{ p: 3, textAlign: "center", color: "gray" }}>
        <Typography variant="body2">No asset data available</Typography>
      </Card>
    );
  }
  return (
    <Card sx={{ boxShadow: 3, position: 'relative', border: selectable && selected ? '2px solid #1976d2' : undefined, cursor: selectable ? 'pointer' : 'default' }} onClick={() => { if (selectable && onSelect) onSelect(asset); }}>
      {asset.photo && (
        <img
          src={asset.photo}
          alt={asset.name}
          width="100%"
          height="180"
          style={{ objectFit: "cover" }}
        />
      )}

      {/* edit button top-right */}
      {onEdit && (
        <IconButton size="small" sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.9)' }} onClick={(e) => { e.stopPropagation(); onEdit(asset); }}>
          <EditIcon fontSize="small" />
        </IconButton>
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
          {asset.raw && asset.raw.userId && (asset.raw.userId.name || asset.raw.userId.email) && (
            <Typography variant="body2">
              <strong>Owner:</strong> {asset.raw.userId.name || asset.raw.userId.email}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            <strong>Registered on:</strong> {asset.dateRegistered}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default AssetCard;
