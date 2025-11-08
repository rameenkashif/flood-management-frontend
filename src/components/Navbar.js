import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Flood Management
        </Typography>
        <Button color="inherit" component={Link} to="/">Dashboard</Button>
        <Button color="inherit" component={Link} to="/alerts">Alerts</Button>
        <Button color="inherit" component={Link} to="/locker">Locker</Button>
        <Button color="inherit" component={Link} to="/camps">Camps</Button>
        <Button color="inherit" component={Link} to="/volunteers">Volunteers</Button>
        <Button color="inherit" component={Link} to="/login">Login</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
