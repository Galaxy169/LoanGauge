import { api } from './api';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/api/admin/users',
      transformResponse: (response) => response.data,
      providesTags: ['AdminUsers'],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, roleName }) => ({
        url: `/api/admin/users/${userId}/role?roleName=${encodeURIComponent(roleName)}`,
        method: 'PUT',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/api/admin/users/${userId}/status?status=${encodeURIComponent(status)}`,
        method: 'PUT',
      }),
      invalidatesTags: ['AdminUsers'],
    }),
    getDashboard: builder.query({
      query: () => '/api/admin/dashboard',
      transformResponse: (response) => response.data,
      providesTags: ['AdminDashboard'],
    }),
    getSubscriptions: builder.query({
      query: () => '/api/admin/subscriptions',
      transformResponse: (response) => response.data,
      providesTags: ['AdminSubscriptions'],
    }),
    createSubscription: builder.mutation({
      query: (body) => ({
        url: '/api/admin/subscriptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AdminSubscriptions'],
    }),
    updateSubscription: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/subscriptions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminSubscriptions'],
    }),
    createLoanType: builder.mutation({
      query: (body) => ({
        url: '/api/admin/loan-types',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['LoanTypes'],
    }),
    updateLoanType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/admin/loan-types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['LoanTypes'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useGetDashboardQuery,
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCreateLoanTypeMutation,
  useUpdateLoanTypeMutation,
} = adminApi;
