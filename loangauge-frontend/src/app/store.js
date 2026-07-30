import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/authSlice";
import uiReducer from "../store/uiSlice";
import { apiSlice } from "../services/appSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
