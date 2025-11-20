import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';

function Login() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const success = login({ email, password }); // frontend-only
    if (success) {
      navigate('/dashboard'); // redirect after login
    } else {
      alert('Please enter both email and password!');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '100px', textAlign: 'center' }}>
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

      {/* Register Button */}
      <Button
        variant="outlined"
        color="secondary"
        fullWidth
        style={{ marginTop: '10px' }}
        onClick={() => navigate('/register')} // navigate to Register page
      >
        Register New User
      </Button>
    </Container>
  );
}

export default Login;
