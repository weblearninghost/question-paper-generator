import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();

//     setError('');
//     setLoading(true);

//     try {
//       const response = await api.post('/auth/login', {
//         email,
//         password,
//       });

//       console.log('Login response:', response.data);

//       const { access_token, user } = response.data;

//       login(access_token, user);

//       navigate('/dashboard');
//     } catch (err: any) {
//       console.error('Login error:', err);

//       setError(err.response?.data?.message || 'Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);

    const response = await api.post("/auth/login", {
      email: email.trim(),
      password,
    });

    console.log("LOGIN RESPONSE:", response.data);

    const { accessToken, user } = response.data;

console.log("TOKEN:", accessToken);
console.log("USER:", user);

login(accessToken, user);

console.log("NAVIGATING TO DASHBOARD");

navigate("/dashboard");
    navigate("/dashboard");
  } catch (err: any) {
    console.log("LOGIN ERROR:", err);
    console.log("STATUS:", err.response?.status);
    console.log("BACKEND ERROR:", err.response?.data);

    setError(
      err.response?.data?.message ||
        "Invalid email or password"
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 420,
          padding: 4,
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight="bold"
          gutterBottom
        >
          Question Paper Generator
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Login to your account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.4,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
