import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_API = 'http://localhost:5000/api';
const API_URL = `${BASE_API}/jobs`;

// Get all jobs
export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (params = {}, thunkAPI) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}?${queryString}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Get single job
export const fetchJob = createAsyncThunk('jobs/fetchOne', async (id, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Create job
export const createJob = createAsyncThunk('jobs/create', async (jobData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Update job
export const updateJob = createAsyncThunk('jobs/update', async ({ id, jobData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Delete job
export const deleteJob = createAsyncThunk('jobs/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Match jobs from resume
export const matchJobsFromResume = createAsyncThunk('jobs/matchResume', async (resumeFile, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const formData = resumeFile instanceof FormData ? resumeFile : new FormData();
    if (!(resumeFile instanceof FormData)) {
      formData.append('resume', resumeFile);
    }

    const response = await fetch(`${API_URL}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// ATS score from resume
export const scoreAtsFromResume = createAsyncThunk('jobs/scoreAts', async (resumeFile, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const formData = resumeFile instanceof FormData ? resumeFile : new FormData();
    if (!(resumeFile instanceof FormData)) {
      formData.append('resume', resumeFile);
    }

    const response = await fetch(`${BASE_API}/ats/score`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    total: 0,
    pages: 1,
    page: 1,
    isLoading: false,
    isMatching: false,
    error: null,
    matchResults: [],
    matchError: null,
    isScoring: false,
    atsScore: null,
    atsError: null,
  },
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    clearJobError: (state) => {
      state.error = null;
    },
    clearMatchResults: (state) => {
      state.matchResults = [];
      state.matchError = null;
    },
    clearAtsScore: (state) => {
      state.atsScore = null;
      state.atsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload.jobs;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch one
      .addCase(fetchJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createJob.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJob.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateJob.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.jobs.findIndex((j) => j._id === action.payload._id);
        if (index !== -1) state.jobs[index] = action.payload;
        if (state.currentJob?._id === action.payload._id) {
          state.currentJob = action.payload;
        }
      })
      // Delete
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
      })
      // Match resume
      .addCase(matchJobsFromResume.pending, (state) => {
        state.isMatching = true;
        state.matchError = null;
      })
      .addCase(matchJobsFromResume.fulfilled, (state, action) => {
        state.isMatching = false;
        state.matchResults = action.payload.matches || [];
      })
      .addCase(matchJobsFromResume.rejected, (state, action) => {
        state.isMatching = false;
        state.matchError = action.payload;
      })
      // ATS score
      .addCase(scoreAtsFromResume.pending, (state) => {
        state.isScoring = true;
        state.atsError = null;
      })
      .addCase(scoreAtsFromResume.fulfilled, (state, action) => {
        state.isScoring = false;
        state.atsScore = action.payload.score;
      })
      .addCase(scoreAtsFromResume.rejected, (state, action) => {
        state.isScoring = false;
        state.atsError = action.payload;
      });
  },
});

export const { clearCurrentJob, clearJobError, clearMatchResults, clearAtsScore } = jobSlice.actions;
export default jobSlice.reducer;
