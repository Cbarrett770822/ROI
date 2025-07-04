import { useEffect } from 'react';
import './api'; // Import API configuration
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Backdrop, CircularProgress } from '@mui/material';

// Import error handling and notification components
import Notification from './components/common/Notification';

// Import components
import Header from './components/layout/Header';
import CompanySelectionPage from './pages/CompanySelectionPage';
import QuestionnairePage from './pages/QuestionnairePage';
import CalculatorPage from './pages/CalculatorPage';
import HomePage from './pages/HomePage';
import WarehouseMapPage from './pages/WarehouseMapPage';
import LoginPage from './pages/LoginPage';

import RequireAuth from './components/auth/RequireAuth';
import UserManagementPage from './pages/UserManagementPage';
import QuestionnaireDebugger from './components/QuestionnaireDebugger';

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
  
  // Get authentication state from Redux store with null checks
  const { isAuthenticated = false } = useSelector((state) => state?.auth || {});
  
  // Initialize app with default companies only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(initializeApp())
        .unwrap()
        .then((companies) => {
          console.log('App initialized with companies:', companies);
        })
        .catch((error) => {
          console.error('Failed to initialize app:', error);
        });
    }
  }, [dispatch, isAuthenticated]);
  
  // Reset loading state when location changes (navigation completes)
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 100);
    
    return () => clearTimeout(timer);
  }, [location.pathname, dispatch]);
  
  // Force redirect to login page on initial load if not authenticated
  useEffect(() => {
    // Always check auth status on app load and redirect accordingly
    console.log('Auth check - isAuthenticated:', isAuthenticated, 'path:', location.pathname);
    
    if (!isAuthenticated) {
      // If not authenticated, redirect to login unless already there
      if (location.pathname !== '/login') {
        console.log('Not authenticated, redirecting to login');
        navigate('/login', { replace: true });
      }
    } else if (location.pathname === '/' || location.pathname === '/login') {
      // If authenticated and on root or login page, redirect to home
      console.log('Already authenticated, redirecting to home');
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Global notification system */}
      <Notification />
      
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
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Default route - redirect based on auth status */}
            <Route path="/" element={
              isAuthenticated === true ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            
            {/* Protected routes */}
            <Route path="/home" element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            } />
            <Route path="/companies" element={
              <RequireAuth>
                <CompanySelectionPage />
              </RequireAuth>
            } />
            {/* Redirect /questionnaire/undefined to /companies */}
            <Route path="/questionnaire/undefined" element={<Navigate to="/companies" replace />} />
            
            {/* Normal questionnaire route with company ID */}
            <Route path="/questionnaire/:companyId" element={
              <RequireAuth>
                <QuestionnairePage />
              </RequireAuth>
            } />
            {/* Redirect /calculator/undefined to /companies */}
            <Route path="/calculator/undefined" element={<Navigate to="/companies" replace />} />
            
            {/* Normal calculator route with company ID */}
            <Route path="/calculator/:companyId" element={
              <RequireAuth>
                <CalculatorPage />
              </RequireAuth>
            } />
            {/* Redirect /warehouse-maps/undefined to /companies */}
            <Route path="/warehouse-maps/undefined" element={<Navigate to="/companies" replace />} />
            
            {/* Normal warehouse maps route with company ID */}
            <Route path="/warehouse-maps/:companyId" element={
              <RequireAuth>
                <WarehouseMapPage />
              </RequireAuth>
            } />
            <Route path="/user-management" element={
              <RequireAuth>
                <UserManagementPage />
              </RequireAuth>
            } />
            
            {/* Debug route */}
            <Route path="/debug/questionnaire/:companyId" element={
              <RequireAuth>
                <QuestionnaireDebugger />
              </RequireAuth>
            } />
            <Route path="/debug/questionnaire" element={
              <RequireAuth>
                <QuestionnaireDebugger />
              </RequireAuth>
            } />
            
            {/* Catch all - redirect to login or home based on auth */}
            <Route path="*" element={
              isAuthenticated === true ? (
                <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App
