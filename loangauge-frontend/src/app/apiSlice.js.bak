import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Temporary base query — points straight at the gateway.
// Swap this file out entirely once Member 2's real apiSlice.js
// (with baseQueryWithReauth / auto-refresh-on-401) is ready.
// Your notificationService.js doesn't need to change at all when that happens —
// it only imports `apiSlice` from this path, same name, same shape.

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  prepareHeaders: (headers, { getState }) => {
    const token = getState()?.auth?.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Notification'],
  endpoints: () => ({}),
});