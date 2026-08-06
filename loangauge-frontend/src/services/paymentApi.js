import { api } from './api';

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({
        url: '/api/payments/order',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response.data,
    }),
    verifyPayment: builder.mutation({
      query: (body) => ({
        url: '/api/payments/verify',
        method: 'POST',
        body,
      }),
      // API returns { data: true|false } — true only if the signature verified
      // and the user was actually upgraded server-side.
      transformResponse: (response) => response.data,
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
} = paymentApi;
