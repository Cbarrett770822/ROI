import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Button, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Container,
  Paper,
  Chip,
  Tooltip,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Icons
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';

// Import Redux actions and selectors
import { 
  fetchCompanies, 
  createCompany, 
  setActiveCompany,
  selectAllCompanies,
  selectCompaniesStatus,
  selectCompaniesError
} from '../redux/slices/companiesSlice';
import { setLoading } from '../redux/slices/uiSlice';
import { selectUser } from '../redux/slices/authSlice';

/**
 * Company Selection Page component
 * Allows users to select an existing company or create a new one
 */
const CompanySelectionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get data from Redux store
  const companies = useSelector(selectAllCompanies);
  const status = useSelector(selectCompaniesStatus);
  const error = useSelector(selectCompaniesError);
  const user = useSelector(selectUser);
  const loading = status === 'loading';
  
  // Local state
  const [openDialog, setOpenDialog] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [formError, setFormError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch companies on component mount
  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company => 
    company && company.name && company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle dialog open/close
  const handleOpenDialog = () => {
    setOpenDialog(true);
    setNewCompanyName('');
    setFormError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle company creation
  const handleCreateCompany = async () => {
    // Validate input
    if (!newCompanyName.trim()) {
      setFormError('Company name is required');
      return;
    }

    try {
      dispatch(setLoading(true));
      console.log('Creating company with name:', newCompanyName.trim());
      
      // When creating a company, the backend will automatically associate it with the current user
      const resultAction = await dispatch(createCompany({ name: newCompanyName.trim() }));
      
      if (createCompany.fulfilled.match(resultAction)) {
        // Success - close dialog and navigate to the new company
        handleCloseDialog();
        const newCompany = resultAction.payload;
        console.log('Company created successfully:', newCompany);
        
        if (newCompany && newCompany.id) {
          dispatch(setActiveCompany(newCompany));
          navigate(`/questionnaire/${newCompany.id}`);
        } else {
          console.error('Invalid company data received:', newCompany);
          setFormError('Received invalid company data from server');
        }
      } else {
        // Error
        console.error('Failed to create company:', resultAction.error);
        setFormError(resultAction.error.message || 'Failed to create company');
      }
    } catch (error) {
      console.error('Exception creating company:', error);
      setFormError(error.message || 'An unexpected error occurred');
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Handle company selection
  const handleSelectCompany = (companyId) => {
    // Set active company in Redux store
    dispatch(setActiveCompany(companies.find(c => c.id === companyId)));
    // Set loading state before navigation
    dispatch(setLoading(true));
  };

  return (
    <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* Page Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: 'rgba(46, 125, 50, 0.04)', // Light green background
          border: '1px solid',
          borderColor: 'primary.light',
          width: '100%'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
              Company Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Select a company to assess its supply chain or calculate ROI
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ px: 3 }}
          >
            New Company
          </Button>
        </Box>
      </Paper>
      
      {/* Search and Filter Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <TextField
          placeholder="Search companies..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: { sm: '400px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Sort companies">
            <IconButton color="primary">
              <SortIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter companies">
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
      
      {/* Create Company Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Create New Company
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the company name to create a new assessment profile.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Company Name"
            type="text"
            fullWidth
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            error={!!formError}
            helperText={formError}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCompany} 
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            Create Company
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Main Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : filteredCompanies.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider'
          }}
        >
          {companies.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4, p: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No companies found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user?.role === 'admin' ? 
                  'No companies have been created yet. Create a new company or wait for users to create their own.' :
                  'You haven\'t created any companies yet. Create a new company to get started.'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {user?.role === 'admin' ? 
                  'As an admin, you will be able to see all companies created by any user.' :
                  'You will only see companies that you create.'}
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>No matching companies found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try a different search term or create a new company.
              </Typography>
            </>
          )}
        </Paper>
      ) : (
      <>
        {/* Companies Count */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" color="text.secondary">
            Showing {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
            {user?.role === 'admin' ? ' (admin view)' : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {searchTerm && (
              <Chip 
                label={`Search: ${searchTerm}`} 
                onDelete={() => setSearchTerm('')} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ mr: 2 }}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Create New Company
            </Button>
          </Box>
        </Box>
          
          {/* Companies Grid */}
          <Grid container spacing={3}>
            {filteredCompanies.map((company) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={company.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    border: company.createdBy === user?.username ? '2px solid #4caf50' : 'none'
                  }}
                >
                  {/* Company Icon */}
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -20, 
                      left: 20, 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <BusinessIcon sx={{ color: 'white', fontSize: 28 }} />
                  </Box>
                  
                  <CardContent sx={{ pt: 4, flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 1 }}>
                      {company.name}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Access supply chain assessment tools and ROI calculator for this company.
                    </Typography>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Button 
                      variant="outlined"
                      color="primary"
                      size="medium"
                      startIcon={<AssignmentIcon />}
                      onClick={() => {
                        handleSelectCompany(company.id);
                        navigate(`/questionnaire/${company.id}`);
                      }}
                      fullWidth
                    >
                      Assessment
                    </Button>
                    <Button 
                      variant="contained"
                      color="primary"
                      size="medium"
                      startIcon={<BarChartIcon />}
                      onClick={() => {
                        handleSelectCompany(company.id);
                        navigate(`/calculator/${company.id}`);
                      }}
                      fullWidth
                    >
                      ROI Calculator
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
};

export default CompanySelectionPage;
