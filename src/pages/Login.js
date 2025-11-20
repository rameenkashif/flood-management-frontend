import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography } from '@mui/material';

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const success = login({ email, password }); // frontend-only login
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
        onClick={handleLogin}
        style={{ marginTop: '20px' }}
      >
        Login
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
