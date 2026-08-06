import { api } from './api';

export const financialProfileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkProfileExists: builder.query({
      query: () => '/api/financial-profile/exists',
      transformResponse: (response) => response.data,
      // Without this, creating/updating the profile invalidates the
      // 'FinancialProfile' tag but this query was never tagged with it, so
      // it never refetches — DashboardPage/NewAssessmentPage/this page's own
      // isEditMode flag all kept showing stale "no profile yet" state until
      // a full page reload reset the whole RTK Query cache.
      providesTags: ['FinancialProfile'],
    }),
    getFinancialProfile: builder.query({
      query: () => '/api/financial-profile',
      transformResponse: (response) => response.data,
      providesTags: ['FinancialProfile'],
    }),
    createFinancialProfile: builder.mutation({
      query: (body) => ({
        url: '/api/financial-profile',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FinancialProfile'],
    }),
    updateFinancialProfile: builder.mutation({
      query: (body) => ({
        url: '/api/financial-profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['FinancialProfile'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCheckProfileExistsQuery,
  useGetFinancialProfileQuery,
  useCreateFinancialProfileMutation,
  useUpdateFinancialProfileMutation,
} = financialProfileApi;
