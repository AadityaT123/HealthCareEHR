import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '../../api/appointment.service';

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await appointmentService.getAll(params);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const fetchAppointmentsByPatient = createAsyncThunk(
  'appointments/fetchByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await appointmentService.getByPatient(patientId);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await appointmentService.create(data);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await appointmentService.update(id, data);
      return res.data ?? res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (id, { rejectWithValue }) => {
    try {
      await appointmentService.cancel(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState: {
    list: [],             // All appointments / filtered list
    patientList: [],      // Appointments for a specific patient
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {
    clearAppointmentError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const setPending  = (state) => { state.loading = true;  state.error = null; };
    const setRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchAppointments.pending,   setPending)
      .addCase(fetchAppointments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.list = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchAppointments.rejected,  setRejected)

      .addCase(fetchAppointmentsByPatient.pending,   setPending)
      .addCase(fetchAppointmentsByPatient.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.patientList = Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchAppointmentsByPatient.rejected,  setRejected)

      .addCase(createAppointment.pending,   (state) => { state.saving = true; })
      .addCase(createAppointment.fulfilled, (state, { payload }) => {
        state.saving = false;
        state.list.unshift(payload);
      })
      .addCase(createAppointment.rejected,  (state, action) => { state.saving = false; state.error = action.payload; })

      .addCase(updateAppointment.pending,   (state) => { state.saving = true; })
      .addCase(updateAppointment.fulfilled, (state, { payload }) => {
        state.saving = false;
        const idx = state.list.findIndex((a) => a.id === payload.id);
        if (idx !== -1) state.list[idx] = payload;
      })
      .addCase(updateAppointment.rejected,  (state, action) => { state.saving = false; state.error = action.payload; })

      .addCase(cancelAppointment.fulfilled, (state, { payload: id }) => {
        state.list = state.list.filter((a) => a.id !== id);
      });
  },
});

export const { clearAppointmentError } = appointmentSlice.actions;
export default appointmentSlice.reducer;
