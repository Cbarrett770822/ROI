import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  IconButton, 
  Menu, 
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../redux/slices/uiSlice';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import BusinessIcon from '@mui/icons-material/Business';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';

const Header = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mobile menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Handle mobile menu open/close
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle navigation with loading state
  const handleNavClick = () => {
    dispatch(setLoading(true));
    if (isMobile) {
      handleClose();
    }
  };
  
  // Navigation items
  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon fontSize="small" sx={{ mr: 1 }} /> },
    { text: 'Companies', path: '/companies', icon: <BusinessIcon fontSize="small" sx={{ mr: 1 }} /> }
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth={false}>
        <Toolbar sx={{ py: 1 }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                width: 40, 
                height: 40, 
                mr: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AssessmentIcon />
            </Avatar>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/"
              sx={{ 
                flexGrow: 1, 
                color: 'text.primary', 
                textDecoration: 'none',
                fontWeight: 600,
                letterSpacing: 0.5,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Supply Chain Assessment
            </Typography>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Desktop Navigation */}
          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button 
                  key={item.path}
                  component={RouterLink} 
                  to={item.path}
                  onClick={handleNavClick}
                  color="primary"
                  sx={{ 
                    mx: 1, 
                    py: 1,
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    borderBottom: location.pathname === item.path ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'primary.main'
                    }
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
              {/* ROI Calculator button removed as requested */}
            </Box>
          ) : (
            /* Mobile Navigation */
            <Box>
              <IconButton
                size="large"
                edge="end"
                color="primary"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                {navItems.map((item) => (
                  <MenuItem 
                    key={item.path} 
                    onClick={() => {
                      handleNavClick();
                      handleClose();
                    }}
                    component={RouterLink}
                    to={item.path}
                    selected={location.pathname === item.path}
                  >
                    {item.icon}
                    {item.text}
                  </MenuItem>
                ))}
                {/* ROI Calculator menu item removed as requested */}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
