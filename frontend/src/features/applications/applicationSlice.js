import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = `${import.meta.env.VITE_API_URL || ''}/api`;

// Apply for a job
export const applyForJob = createAsyncThunk('applications/apply', async ({ jobId, applicationData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const isFormData = typeof FormData !== 'undefined' && applicationData instanceof FormData;
    const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Authorization: `Bearer ${token}`,
      },
      body: isFormData ? applicationData : JSON.stringify(applicationData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Propose interview slots (employer)
export const proposeInterviewSlots = createAsyncThunk(
  'applications/proposeInterviewSlots',
  async ({ id, slots, note }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await fetch(`${API_URL}/applications/${id}/interview-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slots, note }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Confirm interview slot (candidate)
export const confirmInterviewSlot = createAsyncThunk(
  'applications/confirmInterviewSlot',
  async ({ id, slotIndex }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await fetch(`${API_URL}/applications/${id}/interview-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotIndex }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Get applications
export const fetchApplications = createAsyncThunk('applications/fetchAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await fetch(`${API_URL}/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Update application status
export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const applicationSlice = createSlice({
  name: 'applications',
  initialState: {
    applications: [],
    isLoading: false,
    error: null,
    applySuccess: false,
  },
  reducers: {
    clearApplySuccess: (state) => {
      state.applySuccess = false;
    },
    clearAppError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Apply
      .addCase(applyForJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.applySuccess = false;
      })
      .addCase(applyForJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications.unshift(action.payload);
        state.applySuccess = true;
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.applySuccess = false;
      })
      // Fetch
      .addCase(fetchApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applications = action.payload;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const index = state.applications.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.applications[index] = action.payload;
      })
      // Propose interview slots
      .addCase(proposeInterviewSlots.fulfilled, (state, action) => {
        const index = state.applications.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.applications[index] = action.payload;
      })
      // Confirm interview slot
      .addCase(confirmInterviewSlot.fulfilled, (state, action) => {
        const index = state.applications.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.applications[index] = action.payload;
      });
  },
});

export const { clearApplySuccess, clearAppError } = applicationSlice.actions;
export default applicationSlice.reducer;
