import { api } from './api';

export const loanTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLoanTypes: builder.query({
      query: () => '/api/loan-types',
      transformResponse: (response) => response.data,
      providesTags: ['LoanTypes'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetLoanTypesQuery } = loanTypeApi;
