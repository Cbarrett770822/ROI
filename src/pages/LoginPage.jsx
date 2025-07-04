import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { api } from '../api/apiClient';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());
    
    try {
      console.log('Attempting login for:', username);
      
      const response = await api.post('auth-login', { username, password });
      
      console.log('Login response status:', response.status);
      
      // Extract token and user from the response
      const { token, user } = response.data;
      
      if (!token || !user) {
        console.error('Missing token or user in response:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Login successful, token received, user:', user.username);
      
      // Dispatch login success with the correct payload structure
      dispatch(loginSuccess({ token, user }));
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <Box sx={{
      width: '100vw',
      height: 'calc(100vh - 72px)', // account for header
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e3ecf7 100%)',
      minHeight: '600px',
      p: 0,
      m: 0,
    }}>
      <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: 480,
        mx: 2,
        p: { xs: 3, sm: 6 },
        borderRadius: 3,
        boxShadow: '0 8px 32px 0 rgba(60, 80, 120, 0.10)',
        background: 'rgba(255,255,255,0.98)'
      }}>
        <Typography variant="h5" mb={2} align="center">Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
            size="large"
            sx={{ fontSize: 18 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            size="large"
            sx={{ fontSize: 18 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, py: 1.5, fontSize: 18 }}>
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>

      </Paper>
    </Box>
  );
}
