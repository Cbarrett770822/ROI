import { createSlice } from '@reduxjs/toolkit';
import { fetchCompanies, createCompany } from './companiesSlice';
import { fetchQuestionnaire, saveQuestionnaireAnswers } from './questionnaireSlice';

const initialState = {
  isLoading: false,
  activeView: 'companies',
  error: null,
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

export const { setLoading, setActiveView, setError, clearError } = uiSlice.actions;

export default uiSlice.reducer;
