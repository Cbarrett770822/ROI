import { useEffect } from 'react';
import './api'; // Import API configuration
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Backdrop, CircularProgress } from '@mui/material';

// Import components
import Header from './components/layout/Header';
import CompanySelectionPage from './pages/CompanySelectionPage';
import QuestionnairePage from './pages/QuestionnairePage';
import CalculatorPage from './pages/CalculatorPage';
import HomePage from './pages/HomePage';

// Import actions
import { setLoading } from './redux/slices/uiSlice';
import { initializeApp } from './redux/slices/companiesSlice';

// Create a sophisticated theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Forest green - representing supply chain sustainability
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0277BD', // Blue - representing business intelligence
      light: '#039BE5',
      dark: '#01579B',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#263238',
      secondary: '#546E7A',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
    subtitle1: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 25px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get loading state from Redux store
  const isLoading = useSelector((state) => state.ui.isLoading);
  
  // Initialize app with default companies when it first loads
  useEffect(() => {
    dispatch(initializeApp())
      .unwrap()
      .then((companies) => {
        console.log('App initialized with companies:', companies);
      })
      .catch((error) => {
        console.error('Failed to initialize app:', error);
      });
  }, [dispatch]);
  
  // Reset loading state when location changes (navigation completes)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Global loading overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2 }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      
      {/* App Layout */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Header />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            width: '100%',
            maxWidth: '100vw',
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: 'background.default'
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/companies" element={<CompanySelectionPage />} />
            <Route path="/questionnaire/:companyId" element={<QuestionnairePage />} />
            <Route path="/calculator/:companyId" element={<CalculatorPage />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
