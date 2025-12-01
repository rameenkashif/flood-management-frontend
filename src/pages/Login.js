import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Switch, Box, Paper } from '@mui/material';

function Login() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      // If admin mode is selected, only allow the known admin credentials
      if (isAdminMode) {
        if (email !== 'admin@gmail.com' || password !== 'password123') {
          throw new Error('Only admin@gmail.com may login in Admin mode');
        }
      }

      // Do not pass role to backend; let backend determine role from database
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      // Prevent registering admin via UI
      if (isAdminMode || email === 'admin' || email === 'admin@local' || email === 'admin@gmail.com') {
        throw new Error('Admin account cannot be registered via UI');
      }
      // Basic client-side validation: require Gmail and Pakistani mobile format
      if (!name || name.trim().length < 2) throw new Error('Please enter your full name');
      if (!email || !email.toLowerCase().endsWith('@gmail.com')) throw new Error('Please register with a valid Gmail address');
      const phoneRegex = /^03\d{9}$/;
      if (!phone || !phoneRegex.test(phone)) throw new Error('Please enter a valid Pakistani mobile number (e.g. 03001234567)');
      await register({ name, email, phone, password });
      // after successful registration, navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url('/login_bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: '#ffffff',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
        }}
      >
        <img
          src="/floodguard-logo.png.png"
          alt="FloodGuard Logo"
          style={{ width: '120px', marginBottom: '12px' }}
        />

        <Typography variant="h5" gutterBottom>
          Flood Management Login
        </Typography>

        <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>User</Typography>
          <Switch
            checked={isAdminMode}
            onChange={(e) => {
              const checked = e.target.checked;
              setIsAdminMode(checked);
              if (checked) setIsRegistering(false);
            }}
            color="primary"
            inputProps={{ 'aria-label': 'user-admin-toggle' }}
          />
          <Typography variant="body2" sx={{ ml: 1 }}>Admin</Typography>
        </Box>

        {isRegistering && (
          <>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </>
        )}

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="small"
          onClick={isRegistering ? handleRegister : handleLogin}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {isRegistering ? (loading ? 'Registering...' : 'Register') : (loading ? 'Logging in...' : 'Login')}
        </Button>

        {!isAdminMode && (
          <Button
            fullWidth
            onClick={() => setIsRegistering(!isRegistering)}
            sx={{ mt: 1, textTransform: 'none', color: '#00bcd4' }}
            size="small"
          >
            {isRegistering ? 'Have an account? Login' : "Don't have account. Register"}
          </Button>
        )}
      </Paper>
    </Box>
  );
}

export default Login;
