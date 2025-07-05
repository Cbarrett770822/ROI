import React from 'react';
import { 
  Typography,
  Button, 
  Box, 
  Container, 
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoading } from '../redux/slices/uiSlice';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGetStarted = () => {
    dispatch(setLoading(true));
    navigate('/companies');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {/* Centered Hero Section */}
      <Box sx={{ flex: 1, width: '100vw', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 8 }, py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 110, height: 110, mb: 4, boxShadow: 4 }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'white' }} />
        </Avatar>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 900, color: 'primary.main', textAlign: 'center', mb: 3, letterSpacing: '-1px', fontSize: { xs: '2.2rem', md: '3.5rem' } }}>
          WMS ROI Assessment Tool
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ textAlign: 'center', mb: 5, fontWeight: 400, maxWidth: 900, width: '100%' }}>
          Discover the potential benefits of implementing a Warehouse Management System (WMS) in your business. Complete this guided assessment to estimate your return on investment (ROI) based on your own operational data and improvement opportunities.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleGetStarted}
          sx={{
            px: 6,
            py: 2.2,
            fontSize: '1.25rem',
            fontWeight: 700,
            borderRadius: 3,
            boxShadow: '0 8px 24px rgba(44, 183, 233, 0.10)',
            letterSpacing: '0.5px',
            background: 'linear-gradient(90deg, #2E7D32 0%, #1DE9B6 100%)',
            color: 'white',
            '&:hover': { background: 'linear-gradient(90deg, #1DE9B6 0%, #2E7D32 100%)' }
          }}
        >
          Get Started
        </Button>
      </Box>
      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 3, borderTop: '1px solid #eee', textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary">
          &copy; {new Date().getFullYear()} ROI Supply Chain Assessment &mdash; Built with ♥ using React &amp; MUI
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
