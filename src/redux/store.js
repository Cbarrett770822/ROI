import { configureStore } from '@reduxjs/toolkit';
import companiesReducer from './slices/companiesSlice';
import questionnaireReducer from './slices/questionnaireSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    questionnaire: questionnaireReducer,
    ui: uiReducer,
    auth: authReducer,
  },
});
