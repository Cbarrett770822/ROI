import { createSlice } from '@reduxjs/toolkit';
import { fetchCompanies, createCompany } from './companiesSlice';
import { fetchQuestionnaire, saveQuestionnaireAnswers } from './questionnaireSlice';

const initialState = {
  isLoading: false,
  activeView: 'companies',
  error: null,
  notification: {
    open: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
    duration: 5000
  }
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    showNotification: (state, action) => {
      state.notification = {
        open: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000
      };
    },
    hideNotification: (state) => {
      state.notification.open = false;
    },
  },
  extraReducers: (builder) => {
    // Handle loading states for API actions
    builder
      // Companies actions
      .addCase(fetchCompanies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCompanies.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(createCompany.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCompany.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createCompany.rejected, (state) => {
        state.isLoading = false;
      })
      // Questionnaire actions
      .addCase(fetchQuestionnaire.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchQuestionnaire.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchQuestionnaire.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(saveQuestionnaireAnswers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveQuestionnaireAnswers.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(saveQuestionnaireAnswers.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { 
  setLoading, 
  setActiveView, 
  setError, 
  clearError,
  showNotification,
  hideNotification 
} = uiSlice.actions;

// Selectors
export const selectLoading = (state) => state.ui?.isLoading || false;
export const selectActiveView = (state) => state.ui?.activeView || 'companies';
export const selectError = (state) => state.ui?.error || null;
export const selectNotification = (state) => state.ui?.notification || {
  open: false,
  message: '',
  type: 'info',
  duration: 5000
};

export default uiSlice.reducer;
