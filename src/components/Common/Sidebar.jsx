import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Box,
  Typography 
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FactoryIcon from '@mui/icons-material/Factory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import StorageIcon from '@mui/icons-material/Storage';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StoreIcon from '@mui/icons-material/Store';

const drawerWidth = 240;

const dashboards = [
  { id: 'executive', name: 'Executive Overview', icon: <DashboardIcon /> },
  { id: 'oem', name: 'OEM Manufacturing', icon: <FactoryIcon /> },
  { id: 'inbound', name: 'Inbound Logistics', icon: <LocalShippingIcon /> },
  { id: 'responsiveness', name: 'Supply Chain Responsiveness', icon: <SpeedIcon /> },
  { id: 'traceability', name: 'Traceability & Compliance', icon: <TimelineIcon /> },
  { id: 'supplier', name: 'Supplier Performance', icon: <AssessmentIcon /> },
  { id: '3pl', name: '3PL Metrics', icon: <WarehouseIcon /> },
  { id: 'retail', name: 'Retail Performance', icon: <StoreIcon /> },
  { id: 'retailwarehouse', name: 'Retail Warehouse', icon: <WarehouseIcon /> },
  { id: 'reports', name: 'Supply Chain Reports', icon: <DescriptionIcon /> },
  { id: 'datasources', name: 'WMS Data Sources', icon: <StorageIcon /> }
];

const Sidebar = ({ currentDashboard, onDashboardChange, isDataLoaded }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          mt: 8, // Space for AppBar
          borderRight: '1px solid #e0e0e0',
          boxShadow: '1px 0px 3px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        {isDataLoaded ? (
          <>
            <List sx={{ py: 1 }}>
              {dashboards.map((dashboard) => (
                <ListItem 
                  key={dashboard.id}
                  selected={currentDashboard === dashboard.id}
                  onClick={() => onDashboardChange(dashboard.id)}
                  sx={{ 
                    cursor: 'pointer',
                    borderRadius: '0 24px 24px 0',
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.12)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'primary.main',
                        fontWeight: 500,
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    color: currentDashboard === dashboard.id ? 'primary.main' : 'text.secondary',
                  }}>
                    {dashboard.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={dashboard.name} 
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: currentDashboard === dashboard.id ? 500 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        ) : (
          <Box sx={{ p: 3, mt: 2 }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 1 
              }}
            >
              <CloudUploadIcon color="disabled" sx={{ fontSize: 40 }} />
              Please upload data to view dashboards
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            © 2025 WMS Dashboard
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
