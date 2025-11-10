import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          FloodGuard Pakistan
        </Typography>
        <Button color="inherit" component={Link} to="/dashboard">
          Dashboard
        </Button>
        <Button color="inherit" component={Link} to="/alerts">
          Flood Alerts
        </Button>
        <Button color="inherit" component={Link} to="/digital-locker">
          Asset Locker
        </Button>
        <Button color="inherit" component={Link} to="/relief-camps">
          Relief Camps
        </Button>
        <Button color="inherit" component={Link} to="/volunteers">
          Volunteers
        </Button>
        <Button color="inherit" component={Link} to="/donations">
          Donations
        </Button>
        <Button color="inherit" component={Link} to="/community">
          Community
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
