import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import './App.css';

// Components
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import DataUploader from './components/Common/DataUploader';
import OEMManufacturingDashboard from './components/Dashboard/OEMManufacturingDashboard';
import InboundLogisticsDashboard from './components/Dashboard/InboundLogisticsDashboard';
import SupplyChainResponsivenessDashboard from './components/Dashboard/SupplyChainResponsivenessDashboard';
import TraceabilityDashboard from './components/Dashboard/TraceabilityDashboard';
import SupplierPerformanceDashboard from './components/Dashboard/SupplierPerformanceDashboard';
import ExecutiveDashboard from './components/Dashboard/ExecutiveDashboard';
import ReportsDashboard from './components/Dashboard/ReportsDashboard';
import DataSourcesDashboard from './components/Dashboard/DataSourcesDashboard';

const theme = createTheme({
  palette: {
    primary: {
      light: '#4791db',
      main: '#1976d2',
      dark: '#0d47a1',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#33bfcd',
      main: '#00acc1',
      dark: '#007c91',
      contrastText: '#ffffff',
    },
    accent: {
      amber: '#ffb300',
      teal: '#00acc1',
      orange: '#ff9800',
      green: '#4caf50',
      red: '#f44336',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
      card: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '0.00735em',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.00735em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.00735em',
    },
    body1: {
      fontSize: '0.875rem',
      letterSpacing: '0.01071em',
    },
    body2: {
      fontSize: '0.75rem',
      letterSpacing: '0.01071em',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 500,
          backgroundColor: '#f5f5f5',
        },
      },
    },
  },
});

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState('executive');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Check for saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('supplyChainData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setDashboardData(parsedData);
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Error loading saved data:', err);
      }
    }
  }, []);

  // Handle data from file upload
  const handleDataLoaded = (data) => {
    setDashboardData(data);
    setIsDataLoaded(true);
    localStorage.setItem('supplyChainData', JSON.stringify(data));
  };

  // Handle dashboard change
  const handleDashboardChange = (dashboard) => {
    setCurrentDashboard(dashboard);
  };

  // Render the current dashboard
  const renderDashboard = () => {
    if (!isDataLoaded && currentDashboard !== 'datasources') {
      return <DataUploader onDataLoaded={handleDataLoaded} />;
    }

    switch (currentDashboard) {
      case 'executive':
        return <ExecutiveDashboard data={dashboardData || {}} />;
      case 'oem':
        return <OEMManufacturingDashboard data={dashboardData?.OEMManufacturing || []} />;
      case 'inbound':
        return <InboundLogisticsDashboard data={dashboardData?.InboundLogistics || []} />;
      case 'responsiveness':
        return <SupplyChainResponsivenessDashboard data={dashboardData?.SupplyChainResponsiveness || []} />;
      case 'traceability':
        return <TraceabilityDashboard data={dashboardData?.Traceability || []} />;
      case 'supplier':
        return <SupplierPerformanceDashboard data={dashboardData?.SupplierPerformance || []} />;
      case 'reports':
        return <ReportsDashboard data={dashboardData || {}} />;
      case 'datasources':
        return <DataSourcesDashboard />;
      default:
        return <ExecutiveDashboard data={dashboardData || {}} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Header 
          isDataLoaded={isDataLoaded} 
          onResetData={() => {
            localStorage.removeItem('supplyChainData');
            setDashboardData(null);
            setIsDataLoaded(false);
          }} 
        />
        <Sidebar 
          currentDashboard={currentDashboard}
          onDashboardChange={handleDashboardChange}
          isDataLoaded={isDataLoaded}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            overflow: 'auto',
            backgroundColor: theme.palette.background.default
          }}
        >
          {renderDashboard()}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
