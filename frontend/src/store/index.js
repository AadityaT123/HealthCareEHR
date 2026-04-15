import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './slices/patientSlice';
import clinicalReducer from './slices/clinicalSlice';
import ordersReducer from './slices/ordersSlice';
import medicationsReducer from './slices/medicationsSlice';

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    clinical: clinicalReducer,
    orders: ordersReducer,
    medications: medicationsReducer,
  },
});
