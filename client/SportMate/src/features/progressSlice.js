import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../axios/api";

export const fetchLogs = createAsyncThunk(
  "progress/fetchLogs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/progressLog");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch logs");
    }
  }
);

export const addLog = createAsyncThunk(
  "progress/addLog",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/progressLog", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add log");
    }
  }
);

export const updateLog = createAsyncThunk(
  "progress/updateLog",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/progressLog/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update log");
    }
  }
);

export const deleteLog = createAsyncThunk(
  "progress/deleteLog",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/progressLog/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete log");
    }
  }
);

const progressSlice = createSlice({
  name: "progress",
  initialState: {
    logs: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatus: (state) => {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLogs.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.logs = action.payload;
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(addLog.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(addLog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.logs.push(action.payload);
      })
      .addCase(addLog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateLog.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateLog.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.logs.findIndex(
          (log) => log.id === action.payload.id
        );
        if (index !== -1) {
          state.logs[index] = action.payload;
        }
      })
      .addCase(updateLog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteLog.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteLog.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.logs = state.logs.filter((log) => log.id !== action.payload);
      })
      .addCase(deleteLog.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearError, resetStatus } = progressSlice.actions;
export default progressSlice.reducer;
