import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { labOrderService, imagingOrderService, labResultService } from '../../api/order.service';

// ── Lab Order Thunks ─────────────────────────────────────────────────────────
export const fetchLabOrdersByPatient = createAsyncThunk(
  'orders/fetchLabOrdersByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await labOrderService.getByPatient(patientId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch lab orders');
    }
  }
);

export const createLabOrder = createAsyncThunk(
  'orders/createLabOrder',
  async (data, { rejectWithValue }) => {
    try {
      const res = await labOrderService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create lab order');
    }
  }
);

// ── Imaging Order Thunks ─────────────────────────────────────────────────────
export const fetchImagingOrdersByPatient = createAsyncThunk(
  'orders/fetchImagingOrdersByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await imagingOrderService.getByPatient(patientId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch imaging orders');
    }
  }
);

export const createImagingOrder = createAsyncThunk(
  'orders/createImagingOrder',
  async (data, { rejectWithValue }) => {
    try {
      const res = await imagingOrderService.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create imaging order');
    }
  }
);

// ── Lab Result Thunks ────────────────────────────────────────────────────────
export const fetchLabResultsByPatient = createAsyncThunk(
  'orders/fetchLabResultsByPatient',
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await labResultService.getByPatient(patientId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch lab results');
    }
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    labOrders: [],
    imagingOrders: [],
    labResults: [],
    allLabOrders: [],
    allImagingOrders: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearOrdersData: (state) => {
      state.labOrders = [];
      state.imagingOrders = [];
      state.labResults = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const setPending = (state) => { state.loading = true; state.error = null; };
    const setRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchLabOrdersByPatient.pending, setPending)
      .addCase(fetchLabOrdersByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.labOrders = action.payload || [];
      })
      .addCase(fetchLabOrdersByPatient.rejected, setRejected)

      .addCase(createLabOrder.fulfilled, (state, action) => {
        state.labOrders.unshift(action.payload);
        state.allLabOrders.unshift(action.payload);
      })

      .addCase(fetchImagingOrdersByPatient.pending, setPending)
      .addCase(fetchImagingOrdersByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.imagingOrders = action.payload || [];
      })
      .addCase(fetchImagingOrdersByPatient.rejected, setRejected)

      .addCase(createImagingOrder.fulfilled, (state, action) => {
        state.imagingOrders.unshift(action.payload);
      })

      .addCase(fetchLabResultsByPatient.pending, setPending)
      .addCase(fetchLabResultsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.labResults = action.payload || [];
      })
      .addCase(fetchLabResultsByPatient.rejected, setRejected);
  },
});

export const { clearOrdersData } = ordersSlice.actions;
export default ordersSlice.reducer;
