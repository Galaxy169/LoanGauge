import { api } from './api';

export const comparisonApi = api.injectEndpoints({
  endpoints: (builder) => ({
    compareAssessments: builder.mutation({
      query: (body) => ({
        url: '/api/comparisons',
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useCompareAssessmentsMutation } = comparisonApi;
