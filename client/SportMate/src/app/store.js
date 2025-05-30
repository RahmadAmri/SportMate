import { configureStore } from '@reduxjs/toolkit';
import progressReducer from '../features/progressSlice';

export const store = configureStore({
  reducer: {
    progress: progressReducer
  }
});