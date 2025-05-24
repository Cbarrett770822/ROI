import React from 'react';
import { 
  Typography,
  Button, 
  Box, 
  Container, 
  Paper, 
  Grid, 
  Avatar,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoading } from '../redux/slices/uiSlice';
import DataExportImport from '../components/DataExportImport';

// Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleGetStarted = () => {
    dispatch(setLoading(true));
    navigate('/companies');
  };

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(120deg, #2E7D32 0%, #1B5E20 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid grid={{ xs: 12, md: 7 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700, 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Supply Chain Assessment Tool
              </Typography>
              <Typography 
                variant="h5" 
                paragraph
                sx={{ 
                  fontWeight: 400, 
                  mb: 4,
                  opacity: 0.9,
                  maxWidth: '600px'
                }}
              >
                Evaluate your supply chain performance and calculate potential ROI for optimization initiatives.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={handleGetStarted}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}
              >
                Get Started
              </Button>
            </Grid>
            <Grid grid={{ xs: 12, md: 5 }}>
              <Box sx={{ 
                position: 'relative', 
                height: { xs: '300px', md: '400px' },
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/* Central icon */}
                <Avatar sx={{ 
                  bgcolor: 'primary.light', 
                  width: { xs: 120, md: 150 }, 
                  height: { xs: 120, md: 150 },
                  boxShadow: '0 12px 24px rgba(0,0,0,0.2)'
                }}>
                  <AssessmentIcon sx={{ fontSize: { xs: 70, md: 90 } }} />
                </Avatar>
                
                {/* Floating icons */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '20%', 
                  left: '20%',
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60 }}>
                    <LocalShippingIcon sx={{ fontSize: 35 }} />
                  </Avatar>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: '25%', 
                  right: '15%',
                  animation: 'float 7s ease-in-out infinite 1s',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }}>
                  <Avatar sx={{ bgcolor: 'secondary.light', width: 50, height: 50 }}>
                    <BusinessIcon sx={{ fontSize: 30 }} />
                  </Avatar>
                </Box>
                <Box sx={{ 
                  position: 'absolute', 
                  top: '60%', 
                  right: '25%',
                  animation: 'float 5s ease-in-out infinite 0.5s',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }}>
                  <Avatar sx={{ bgcolor: '#4CAF50', width: 45, height: 45 }}>
                    <InventoryIcon sx={{ fontSize: 25 }} />
                  </Avatar>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Data Management Section */}
      <Box 
        sx={{ 
          bgcolor: 'background.default', 
          py: { xs: 4, md: 6 },
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="md">
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, md: 4 }, 
              borderRadius: 4,
              backgroundColor: 'rgba(46, 125, 50, 0.05)', // Light green background
              border: '1px solid',
              borderColor: 'primary.light'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                color: 'primary.dark',
                mb: 2
              }}
            >
              Data Management
            </Typography>
            <Typography variant="body1" paragraph>
              Export your company data and questionnaire responses to a file that can be backed up or loaded into a database.
              You can also import previously exported data to restore your companies and responses.
            </Typography>
            <DataExportImport />
          </Paper>
        </Container>
      </Box>
      
      {/* Additional content can be added here if needed */}
    </Box>
  );
};

export default HomePage;
