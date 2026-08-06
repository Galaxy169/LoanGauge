import { api } from './api';

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (userId) => `/api/notifications/${userId}`,
      transformResponse: (response) => response.data,
      providesTags: ['Notifications'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
    // Emails the PDF assessment report to the logged-in user's address.
    // Documented response is the standard { success, message, data: null }
    // envelope, but in practice this endpoint sometimes sends back a bare
    // string body (e.g. "Report emailed to user@example.com") while still
    // claiming Content-Type: application/json. fetchBaseQuery's default
    // handler calls response.json() unconditionally in that case and throws
    // a SyntaxError, which RTK Query then surfaces as the mutation's error
    // — even though the email actually sent. A custom responseHandler here
    // tries JSON first and falls back to treating the body as the message
    // text, so the frontend behaves correctly either way the backend
    // decides to respond.
    emailReport: builder.mutation({
      query: (assessmentId) => ({
        url: `/api/reports/${assessmentId}/email`,
        method: 'POST',
        responseHandler: async (response) => {
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch {
            return { success: response.ok, message: text, data: null };
          }
        },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useEmailReportMutation,
} = notificationApi;
