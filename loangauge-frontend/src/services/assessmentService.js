import { apiSlice } from "./apiSlice.js";

export const assessmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLoanTypes: builder.query({
      query: () => "/api/loan-types",
      transformResponse: (response) => response.data, // unwrap ApiResponse envelope
    }),
    createAssessment: builder.mutation({
      query: (body) => ({
        url: "/api/assessments",
        method: "POST",
        body,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ["Assessment"],
    }),
    getAssessmentHistory: builder.query({
      query: () => "/api/assessments/history",
      transformResponse: (response) => response.data,
      providesTags: ["Assessment"],
    }),
    getAssessmentById: builder.query({
      query: (id) => `/api/assessments/${id}`,
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  useGetLoanTypesQuery,
  useCreateAssessmentMutation,
  useGetAssessmentHistoryQuery,
  useGetAssessmentByIdQuery,
} = assessmentApi;
