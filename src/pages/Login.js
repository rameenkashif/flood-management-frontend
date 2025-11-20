import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';

function Login() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
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
    <Container maxWidth="sm" style={{ marginTop: '100px', textAlign: 'center' }}>

      {/* Logo Section */}
      <img 
        src="/floodguard-logo.png.png" 
        alt="FloodGuard Logo"
        style={{ width: '150px', marginBottom: '20px' }}
      />

      <Typography variant="h4" gutterBottom>
        Flood Management Login
      </Typography>

      {isRegistering && (
        <>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </>
      )}

      <TextField
        label="Email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={isRegistering ? handleRegister : handleLogin}
        style={{ marginTop: '20px' }}
        disabled={loading}
      >
        {isRegistering ? (loading ? 'Registering...' : 'Register') : (loading ? 'Logging in...' : 'Login')}
      </Button>

      <Button
        color="secondary"
        fullWidth
        onClick={() => setIsRegistering(!isRegistering)}
        style={{ marginTop: '12px' }}
      >
        {isRegistering ? 'Have an account? Login' : "Don't have an account? Register"}
      </Button>
    </Container>
  );
}

export default Login;