import { apiSlice } from "./apiSlice";

export const notificationService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/notifications/{userId}
    getNotifications: builder.query({
      query: (userId) => `/notify/api/notifications/${userId}`,
      providesTags: ["Notification"],
    }),

    // PUT /api/notifications/{id}/read
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notify/api/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // GET /api/reports/{assessmentId}/download?loanType=&loanAmount=&foir=&dti=&score=&riskCategory=&eligibleAmount=
    downloadReport: builder.mutation({
      query: ({ assessmentId, ...params }) => ({
        url: `/notify/api/reports/${assessmentId}/download`,
        method: "GET",
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // POST /api/reports/{assessmentId}/email?toEmail=&loanType=&...
    emailReport: builder.mutation({
      query: ({ assessmentId, ...params }) => ({
        url: `/notify/api/reports/${assessmentId}/email`,
        method: 'POST',
        params,
      }),
    }),

    // POST /api/payments/order  { amount }
    createRazorpayOrder: builder.mutation({
      query: (amount) => ({
        url: `/notify/api/payments/order`,
        method: "POST",
        body: { amount },
      }),
    }),

    // POST /api/payments/verify { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    verifyRazorpayPayment: builder.mutation({
      query: (payload) => ({
        url: `/notify/api/payments/verify`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useDownloadReportMutation,
  useEmailReportMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
} = notificationService;
