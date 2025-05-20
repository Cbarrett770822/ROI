import { configureStore } from '@reduxjs/toolkit';
import companiesReducer from './slices/companiesSlice';
import questionnaireReducer from './slices/questionnaireSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
    questionnaire: questionnaireReducer,
    ui: uiReducer,
  },
});
