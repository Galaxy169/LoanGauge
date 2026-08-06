import { api } from './api';

export const assessmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createAssessment: builder.mutation({
      query: (body) => ({
        url: '/api/assessments',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Assessments'],
    }),
    getAssessment: builder.query({
      query: (assessmentId) => `/api/assessments/${assessmentId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Assessments', id }, 'Assessments'],
    }),
    getAssessmentHistory: builder.query({
      query: () => '/api/assessments/history',
      transformResponse: (response) => response.data,
      providesTags: ['Assessments'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateAssessmentMutation,
  useGetAssessmentQuery,
  useGetAssessmentHistoryQuery,
} = assessmentApi;
