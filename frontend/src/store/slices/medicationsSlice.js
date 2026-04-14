import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicationService, prescriptionService, marService } from '../../api/medication.service';

// ── Medication Thunks ─────────────────────────────────────────────────────────
export const fetchAllMedications = createAsyncThunk(
  'medications/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await medicationService.getAll(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch medications');
    }
  }
);

// ── Prescription Thunks ───────────────────────────────────────────────────────
export const fetchPrescriptionsByPatient = createAsyncThunk(
  'medications/fetchPrescriptionsByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await prescriptionService.getByPatient(patientId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

export const createPrescription = createAsyncThunk(
  'medications/createPrescription',
  async (data, { rejectWithValue }) => {
    try {
      const res = await prescriptionService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create prescription');
    }
  }
);

// ── MAR Thunks ───────────────────────────────────────────────────────────────
export const fetchMARByPatient = createAsyncThunk(
  'medications/fetchMAR',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await marService.getByPatient(patientId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch MAR');
    }
  }
);

const medicationsSlice = createSlice({
  name: 'medications',
  initialState: {
    catalog: [],       // Full medication catalog
    prescriptions: [], // Patient's prescriptions
    mar: [],           // Medication administration records
    loading: false,
    error: null,
  },
  reducers: {
    clearMedicationData: (state) => {
      state.prescriptions = [];
      state.mar = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => { state.loading = true; state.error = null; };
    const setRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchAllMedications.pending, setPending)
      .addCase(fetchAllMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = action.payload || [];
      })
      .addCase(fetchAllMedications.rejected, setRejected)

      .addCase(fetchPrescriptionsByPatient.pending, setPending)
      .addCase(fetchPrescriptionsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload || [];
      })
      .addCase(fetchPrescriptionsByPatient.rejected, setRejected)

      .addCase(createPrescription.fulfilled, (state, action) => {
        state.prescriptions.unshift(action.payload);
      })

      .addCase(fetchMARByPatient.pending, setPending)
      .addCase(fetchMARByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.mar = action.payload || [];
      })
      .addCase(fetchMARByPatient.rejected, setRejected);
  },
});

export const { clearMedicationData } = medicationsSlice.actions;
export default medicationsSlice.reducer;
