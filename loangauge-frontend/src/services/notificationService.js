<<<<<<< HEAD
import { apiSlice } from '../app/apiSlice';

export const notificationService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/notifications/{userId}
    getNotifications: builder.query({
      query: (userId) => `/notify/api/notifications/${userId}`,
      providesTags: ['Notification'],
=======
import { apiSlice } from "./apiSlice";

export const notificationService = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/notifications/{userId}
    getNotifications: builder.query({
      query: (userId) => `/notify/api/notifications/${userId}`,
      providesTags: ["Notification"],
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
    }),

    // PUT /api/notifications/{id}/read
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notify/api/notifications/${id}/read`,
<<<<<<< HEAD
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
=======
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
    }),

    // GET /api/reports/{assessmentId}/download?loanType=&loanAmount=&foir=&dti=&score=&riskCategory=&eligibleAmount=
    downloadReport: builder.mutation({
      query: ({ assessmentId, ...params }) => ({
        url: `/notify/api/reports/${assessmentId}/download`,
<<<<<<< HEAD
        method: 'GET',
=======
        method: "GET",
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // POST /api/reports/{assessmentId}/email?toEmail=&loanType=&...
    emailReport: builder.mutation({
      query: ({ assessmentId, ...params }) => ({
        url: `/notify/api/reports/${assessmentId}/email`,
<<<<<<< HEAD
        method: 'POST',
=======
        method: "POST",
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
        params,
      }),
    }),

    // POST /api/payments/order  { amount }
    createRazorpayOrder: builder.mutation({
      query: (amount) => ({
        url: `/notify/api/payments/order`,
<<<<<<< HEAD
        method: 'POST',
=======
        method: "POST",
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
        body: { amount },
      }),
    }),

    // POST /api/payments/verify { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    verifyRazorpayPayment: builder.mutation({
      query: (payload) => ({
        url: `/notify/api/payments/verify`,
<<<<<<< HEAD
        method: 'POST',
        body: payload,
      }),
    }),

=======
        method: "POST",
        body: payload,
      }),
    }),
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useDownloadReportMutation,
  useEmailReportMutation,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
<<<<<<< HEAD
} = notificationService;
=======
} = notificationService;
>>>>>>> bca40a80a96baae4c6bf0ca498fd30ec6ff89428
