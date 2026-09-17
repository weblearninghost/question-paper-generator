import { Box, Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">Question Paper Generator</Typography>

        <Button color="inherit" variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ padding: 4 }}>
        <Paper sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name}
          </Typography>

          <Typography>Email: {user?.email}</Typography>

          <Typography>Role: {user?.role}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
