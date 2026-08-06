import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout, setCredentials } from '../store/authSlice';
import { API_BASE_URL } from '../utils/runtimeConfig';

// Re-exported so callers that need to bypass RTK Query — e.g. a raw fetch()
// against a binary/blob endpoint like the PDF report download — hit the
// same gateway base URL instead of duplicating the config lookup. Resolved
// via runtimeConfig.js so a single built/containerized image can point at
// a different API Gateway per environment without a rebuild — see that
// file for why.
export { API_BASE_URL };

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

let isRefreshing = false;
let refreshPromise = null;

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  let result = await baseQuery(args, apiInstance, extraOptions);

  if (result?.error?.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = baseQuery(
        { url: '/auth/refresh-token', method: 'POST' },
        apiInstance,
        extraOptions
      );
    }

    const refreshResult = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshResult?.data?.success) {
      const { accessToken, user } = refreshResult.data.data;
      apiInstance.dispatch(setCredentials({ accessToken, user }));
      result = await baseQuery(args, apiInstance, extraOptions);
    } else {
      apiInstance.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Profile',
    'FinancialProfile',
    'Assessments',
    'Goals',
    'Consultations',
    'AdvisorConsultations',
    'Notifications',
    'AdminUsers',
    'AdminSubscriptions',
    'AdminDashboard',
    'LoanTypes',
  ],
  endpoints: () => ({}),
});
