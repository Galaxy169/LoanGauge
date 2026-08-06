import { api } from './api';

export const goalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGoals: builder.query({
      query: () => '/api/goals',
      transformResponse: (response) => response.data,
      providesTags: ['Goals'],
    }),
    getGoal: builder.query({
      query: (goalId) => `/api/goals/${goalId}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Goals', id }, 'Goals'],
    }),
    createGoal: builder.mutation({
      query: (body) => ({
        url: '/api/goals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Goals'],
    }),
    updateGoal: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/goals/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Goals'],
    }),
    updateGoalProgress: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/api/goals/${id}/progress`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Goals'],
    }),
    deleteGoal: builder.mutation({
      query: (goalId) => ({
        url: `/api/goals/${goalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goals'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetGoalsQuery,
  useGetGoalQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useUpdateGoalProgressMutation,
  useDeleteGoalMutation,
} = goalApi;
