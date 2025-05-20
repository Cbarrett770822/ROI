import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { exportDataToFile, importDataFromFile } from '../../utils/exportData';

// Helper function to load companies from localStorage
const loadCompaniesFromStorage = () => {
  try {
    const storedCompanies = localStorage.getItem('companies');
    if (storedCompanies) {
      return JSON.parse(storedCompanies);
    }
    
    // Default companies if none in storage
    const defaultCompanies = [
      { id: '1', name: 'Acme Corporation' },
      { id: '2', name: 'Globex Industries' },
      { id: '3', name: 'Stark Enterprises' }
    ];
    
    // Save default companies to localStorage
    localStorage.setItem('companies', JSON.stringify(defaultCompanies));
    console.log('Saved default companies to localStorage');
    
    return defaultCompanies;
  } catch (error) {
    console.error('Error loading companies from localStorage:', error);
    
    // Fallback if there's an error
    return [
      { id: '1', name: 'Acme Corporation' },
      { id: '2', name: 'Globex Industries' },
      { id: '3', name: 'Stark Enterprises' }
    ];
  }
};

// Helper function to save companies to localStorage
const saveCompaniesToStorage = (companies) => {
  try {
    localStorage.setItem('companies', JSON.stringify(companies));
  } catch (error) {
    console.error('Error saving companies to localStorage:', error);
  }
};

// Async thunks for data operations
export const initializeApp = createAsyncThunk(
  'companies/initializeApp',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Load companies from localStorage
      const companies = loadCompaniesFromStorage();
      
      // Ensure companies are saved to localStorage
      saveCompaniesToStorage(companies);
      
      console.log('App initialized with companies:', companies);
      
      return companies;
    } catch (error) {
      console.error('Failed to initialize app:', error);
      return rejectWithValue('Failed to initialize app');
    }
  }
);

export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      // Load companies from localStorage
      return loadCompaniesFromStorage();
    } catch (error) {
      return rejectWithValue('Failed to fetch companies');
    }
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (name, { getState, rejectWithValue }) => {
    try {
      // Create a new company with a unique ID
      const newCompany = {
        id: uuidv4(),
        name,
        createdAt: new Date().toISOString()
      };
      
      // Get current companies and add the new one
      const currentCompanies = getState().companies.companies;
      const updatedCompanies = [...currentCompanies, newCompany];
      
      // Save to localStorage
      saveCompaniesToStorage(updatedCompanies);
      
      return newCompany;
    } catch (error) {
      return rejectWithValue('Failed to create company');
    }
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (companyId, { getState, rejectWithValue }) => {
    try {
      // Get current companies and filter out the one to delete
      const currentCompanies = getState().companies.companies;
      const updatedCompanies = currentCompanies.filter(company => company.id !== companyId);
      
      // Save to localStorage
      saveCompaniesToStorage(updatedCompanies);
      
      // Remove questionnaire answers for this company
      try {
        localStorage.removeItem(`questionnaire_answers_${companyId}`);
      } catch (error) {
        console.error(`Error removing answers for company ${companyId}:`, error);
      }
      
      return { companyId, success: true };
    } catch (error) {
      return rejectWithValue('Failed to delete company');
    }
  }
);

export const deleteAllData = createAsyncThunk(
  'companies/deleteAllData',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get current companies to remove their questionnaire data
      const currentCompanies = getState().companies.companies;
      
      // Remove all questionnaire answers
      currentCompanies.forEach(company => {
        try {
          localStorage.removeItem(`questionnaire_answers_${company.id}`);
        } catch (error) {
          console.error(`Error removing answers for company ${company.id}:`, error);
        }
      });
      
      // Clear companies from localStorage
      localStorage.removeItem('companies');
      
      return { success: true };
    } catch (error) {
      return rejectWithValue('Failed to delete all data');
    }
  }
);

export const exportAllData = createAsyncThunk(
  'companies/exportAllData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const companies = state.companies.companies;
      
      console.log('Exporting companies:', companies);
      
      // Get all questionnaire answers for all companies
      const answers = {};
      companies.forEach(company => {
        // Get answers from localStorage
        try {
          const storedData = localStorage.getItem(`questionnaire_answers_${company.id}`);
          if (storedData) {
            answers[company.id] = JSON.parse(storedData);
            console.log(`Loaded answers for company ${company.id}`);
          } else {
            console.log(`No answers found for company ${company.id}`);
          }
        } catch (error) {
          console.error(`Error loading answers for company ${company.id}:`, error);
        }
      });
      
      console.log('Exporting answers:', answers);
      
      // Export data to file
      const exportData = { companies, answers };
      console.log('Full export data:', exportData);
      
      const success = exportDataToFile(exportData);
      
      if (!success) {
        console.error('Export failed');
        return rejectWithValue('Failed to export data');
      }
      
      console.log('Export successful');
      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      return rejectWithValue('Failed to export data');
    }
  }
);

export const importAllData = createAsyncThunk(
  'companies/importAllData',
  async (file, { dispatch, rejectWithValue }) => {
    try {
      const data = await importDataFromFile(file);
      
      // Save companies to localStorage
      saveCompaniesToStorage(data.companies);
      
      // Save answers for each company to localStorage
      Object.entries(data.answers).forEach(([companyId, answers]) => {
        try {
          localStorage.setItem(`questionnaire_answers_${companyId}`, JSON.stringify(answers));
        } catch (error) {
          console.error(`Error saving answers for company ${companyId}:`, error);
        }
      });
      
      return data;
    } catch (error) {
      return rejectWithValue('Failed to import data: ' + error.message);
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
        state.companies = state.companies.filter(company => company.id !== action.payload.companyId);
        // If the deleted company was active, clear the active company
        if (state.activeCompany && state.activeCompany.id === action.payload.companyId) {
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
