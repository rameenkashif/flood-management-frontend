import { useState, useContext } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logout(); // clears user and localStorage
    navigate("/login");
  };

  // common button hover style
  const buttonHoverStyle = {
    '&:hover': {
      backgroundColor: '#1565c0', // darker blue
      color: '#fff',
      transform: 'scale(1.05)',
      transition: 'all 0.2s ease-in-out',
    }
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Box
            onClick={() => navigate("/dashboard")}
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
          >
            <img
              src="/floodguard-logo.png.png"
              alt="FloodGuard Pakistan Logo"
              style={{ height: "45px", marginRight: "10px" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              FloodGuard Pakistan
            </Typography>
          </Box>
        </Box>

        {/* Navigation Buttons */}
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/alerts">Flood Alerts</Button>
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/digital-locker">Asset Locker</Button>
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/relief-camps">Relief Camps</Button>
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/volunteers">Volunteers</Button>
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/donations">Donations</Button>
        <Button sx={buttonHoverStyle} color="inherit" component={Link} to="/community">Community</Button>

        {/* Profile Avatar */}
        <IconButton onClick={handleProfileClick} sx={{ ml: 2 }}>
          <Avatar
            alt="User Profile"
            src="/user-avatar.png"
            sx={{ width: 40, height: 40, bgcolor: "secondary.main" }}
          />
        </IconButton>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ mt: 1 }}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
