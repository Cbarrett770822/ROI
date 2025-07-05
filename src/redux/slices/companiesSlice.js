import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import authFetch from '../../api/authFetch';
import { exportDataToFile, importDataFromFile } from '../../utils/exportData';

// API endpoints for companies - use relative paths for unified deployment
const API_URL = '/.netlify/functions';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    return error.response.data.error || 'Server error';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    return 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
    return error.message;
  }
};

// Async thunks for data operations
export const initializeApp = createAsyncThunk(
  'companies/initializeApp',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Load companies from API - authFetch now returns parsed JSON
      const companies = await authFetch(`${API_URL}/companies`);
      
      console.log('App initialized with companies:', companies);
      
      return companies;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      return rejectWithValue(handleApiError(error) || 'Failed to initialize app');
    }
  }
);

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      // Load companies from API - authFetch now returns parsed JSON
      return await authFetch(`${API_URL}/companies`);
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to fetch companies');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      console.log('Creating company with data:', companyData);
      // Create a new company via API - authFetch now returns parsed JSON
      const responseData = await authFetch(`${API_URL}/companies`, {
        method: 'POST',
        body: JSON.stringify(companyData)
      });
      
      console.log('Company created successfully:', responseData);
      return responseData;
    } catch (error) {
      console.error('Error creating company:', error);
      return rejectWithValue(handleApiError(error) || 'Failed to create company');
    }
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, name }, { rejectWithValue }) => {
    try {
      // Update company via API - authFetch now returns parsed JSON
      return await authFetch(`${API_URL}/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name })
      });
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to update company');
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (id, { rejectWithValue }) => {
    try {
      // Delete company via API
      await authFetch(`${API_URL}/companies/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to delete company');
    }
  }
);

// Get company data (questionnaire answers, etc.)
export const getCompanyData = createAsyncThunk(
  'companies/getCompanyData',
  async (id, { rejectWithValue }) => {
    try {
      const response = await authFetch(`${API_URL}/companies/${id}/data`);
      return await response.json();
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to get company data');
    }
  }
);

// Save company data
export const saveCompanyData = createAsyncThunk(
  'companies/saveCompanyData',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await authFetch(`${API_URL}/companies/${id}/data`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to save company data');
    }
  }
);

// Delete all data
export const deleteAllData = createAsyncThunk(
  'companies/deleteAllData',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      // Get current companies to delete their data
      const companies = getState().companies.companies;
      
      // Delete each company (which will also delete their data files)
      for (const company of companies) {
        await dispatch(deleteCompany(company.id)).unwrap();
      }
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to delete all data');
    }
  }
);

// Export all data
export const exportAllData = createAsyncThunk(
  'companies/exportAllData',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get companies from state
      const companies = getState().companies.companies;
      
      // Prepare answers object
      const answers = {};
      
      // For each company, get their questionnaire data
      for (const company of companies) {
        try {
          const response = await axios.get(`${API_URL}/companies/${company.id}/data`);
          if (response.data && response.data.answers) {
            answers[company.id] = response.data.answers;
          }
        } catch (error) {
          console.error(`Error fetching data for company ${company.id}:`, error);
          // Continue with other companies even if one fails
        }
      }
      
      // Export the data to a file
      const exportSuccess = exportDataToFile({ companies, answers });
      
      if (!exportSuccess) {
        return rejectWithValue('Failed to export data to file');
      }
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(handleApiError(error) || 'Failed to export data');
    }
  }
);

// Export questionnaire to Excel
export const exportQuestionnaireToExcel = createAsyncThunk(
  'companies/exportQuestionnaireToExcel',
  async ({ companyId, questions }, { getState, rejectWithValue }) => {
    try {
      // Get company data
      let companyName = 'Company';
      let answers = {};
      
      // If company ID is provided, get specific company data
      if (companyId) {
        try {
          // Get company name
          const companies = getState().companies.companies;
          const company = companies.find(c => c.id === companyId);
          if (company) {
            companyName = company.name;
          }
          
          // Get company answers
          const response = await axios.get(`${API_URL}/companies/${companyId}/data`);
          if (response.data && response.data.answers) {
            answers = response.data.answers;
          }
        } catch (error) {
          console.error(`Error fetching data for company ${companyId}:`, error);
          // Continue even if there's an error
        }
      }
      
      // Import the Excel exporter dynamically to avoid issues with SSR
      const { exportQuestionnaireToExcel } = await import('../../utils/excelExporter');
      
      // Generate the Excel file - note that this is now an async function
      const excelBlob = await exportQuestionnaireToExcel(questions, answers, companyName);
      
      console.log('Excel blob generated:', excelBlob);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(excelBlob);
      
      // Create a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${companyName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-questionnaire-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Append to the body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the URL to free up memory
      URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting questionnaire to Excel:', error);
      return rejectWithValue(handleApiError(error) || 'Failed to export questionnaire to Excel');
    }
  }
);

// Import all data
export const importAllData = createAsyncThunk(
  'companies/importAllData',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      // Import data from file
      const importedData = await importDataFromFile(file);
      
      // Delete existing data first
      await dispatch(deleteAllData()).unwrap();
      
      // Import companies
      for (const company of importedData.companies) {
        // Create the company
        const newCompany = await dispatch(createCompany(company.name)).unwrap();
        
        // If this company has answers, save them
        if (importedData.answers[company.id]) {
          await dispatch(saveCompanyData({
            id: newCompany.id,
            data: { answers: importedData.answers[company.id] }
          })).unwrap();
        }
      }
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to import data');
    }
  }
);

const initialState = {
  companies: [],
  activeCompany: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    setActiveCompany: (state, action) => {
      state.activeCompany = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize app
      .addCase(initializeApp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(initializeApp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
        state.error = null;
      })
      .addCase(initializeApp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch companies
      .addCase(fetchCompanies.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload;
        state.error = null;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create company
      .addCase(createCompany.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies.push(action.payload);
        state.activeCompany = action.payload;
        state.error = null;
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Export data
      .addCase(exportAllData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(exportAllData.fulfilled, (state) => {
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(exportAllData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Import data
      .addCase(importAllData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(importAllData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.companies = action.payload.companies;
        state.error = null;
      })
      .addCase(importAllData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete company
      .addCase(deleteCompany.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Handle both formats: direct ID or object with companyId property
        const deletedId = typeof action.payload === 'string' ? action.payload : action.payload.companyId;
        state.companies = state.companies.filter(company => company.id !== deletedId);
        // If the deleted company was active, clear the active company
        if (state.activeCompany && state.activeCompany.id === deletedId) {
          state.activeCompany = null;
        }
        state.error = null;
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Delete all data
      .addCase(deleteAllData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteAllData.fulfilled, (state) => {
        state.status = 'succeeded';
        state.companies = [];
        state.activeCompany = null;
        state.error = null;
      })
      .addCase(deleteAllData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setActiveCompany } = companiesSlice.actions;

// Selectors
export const selectAllCompanies = (state) => state.companies.companies;
export const selectActiveCompany = (state) => state.companies.activeCompany;
export const selectCompaniesStatus = (state) => state.companies.status;
export const selectCompaniesError = (state) => state.companies.error;

export default companiesSlice.reducer;
