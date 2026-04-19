import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicationService, prescriptionService, marService } from '../../api/medication.service';

// ── Medication Thunks ─────────────────────────────────────────────────────────
export const fetchAllMedications = createAsyncThunk(
  'medications/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await medicationService.getAll(params);
      // Backend returns paginated: { success, totalItems, items: [...], totalPages, currentPage }
      return res.items ?? res.data ?? res;
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
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

export const fetchAllPrescriptions = createAsyncThunk(
  'medications/fetchAllPrescriptions',
  async (params, { rejectWithValue }) => {
    try {
      const res = await prescriptionService.getAll(params);
      // Backend returns paginated: { success, totalItems, items: [...], totalPages, currentPage }
      return res.items ?? res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch all prescriptions');
    }
  }
);

export const createPrescription = createAsyncThunk(
  'medications/createPrescription',
  async (data, { rejectWithValue }) => {
    try {
      const res = await prescriptionService.create(data);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to create prescription'
      );
    }
  }
);

// ── MAR Thunks ───────────────────────────────────────────────────────────────
export const fetchMARByPatient = createAsyncThunk(
  'medications/fetchMAR',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await marService.getByPatient(patientId);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch MAR');
    }
  }
);

const medicationsSlice = createSlice({
  name: 'medications',
  initialState: {
    catalog: [],       // Full medication catalog
    prescriptions: [], // All / patient prescriptions
    mar: [],           // Medication administration records
    loading: false,
    saving: false,     // Tracks createPrescription in-flight state
    error: null,
  },
  reducers: {
    clearMedicationData: (state) => {
      state.prescriptions = [];
      state.mar = [];
      state.error = null;
    },
    // Allows Medications.jsx to bulk-set all prescriptions fetched via direct service call
    setAllPrescriptions: (state, action) => {
      state.prescriptions = Array.isArray(action.payload) ? action.payload : [];
    },
  },
  extraReducers: (builder) => {
    const setPending   = (state) => { state.loading = true;  state.error = null; };
    const setRejected  = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchAllMedications.pending,   setPending)
      .addCase(fetchAllMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.catalog = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllMedications.rejected,  setRejected)

      .addCase(fetchPrescriptionsByPatient.pending,   setPending)
      .addCase(fetchPrescriptionsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchPrescriptionsByPatient.rejected,  setRejected)

      .addCase(fetchAllPrescriptions.pending,   setPending)
      .addCase(fetchAllPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllPrescriptions.rejected,  setRejected)

      .addCase(createPrescription.pending,   (state) => { state.saving = true; state.error = null; })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) state.prescriptions.unshift(action.payload);
      })
      .addCase(createPrescription.rejected,  (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      .addCase(fetchMARByPatient.pending,   setPending)
      .addCase(fetchMARByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.mar = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMARByPatient.rejected,  setRejected);
  },
});

export const { clearMedicationData, setAllPrescriptions } = medicationsSlice.actions;
export default medicationsSlice.reducer;
