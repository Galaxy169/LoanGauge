import { api } from './api';

export const consultationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createConsultation: builder.mutation({
      query: (body) => ({
        url: '/api/consultations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Consultations'],
    }),
    getConsultations: builder.query({
      query: () => '/api/consultations',
      transformResponse: (response) => response.data,
      providesTags: ['Consultations'],
    }),
    getAdvisorConsultations: builder.query({
      query: () => '/api/advisor/consultations',
      transformResponse: (response) => response.data,
      providesTags: ['AdvisorConsultations'],
    }),
    respondToConsultation: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/advisor/consultations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdvisorConsultations', 'Consultations'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateConsultationMutation,
  useGetConsultationsQuery,
  useGetAdvisorConsultationsQuery,
  useRespondToConsultationMutation,
} = consultationApi;
