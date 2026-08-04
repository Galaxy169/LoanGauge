import { apiSlice } from "./apiSlice";

// TODO(JWT): The Authorization: Bearer token is already attached
// automatically by apiSlice's baseQueryWithReauth. The X-User-Id header
// below is a temporary stand-in for the backend, which currently reads
// userId from this header instead of the JWT. Once the backend switches
// to extracting userId from the token, remove the X-User-Id header and

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createProfile: builder.mutation({
      query: ({ userId, data }) => ({
        url: "/financial-profile",
        method: "POST",
        headers: { "X-User-Id": userId },
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),

    getProfile: builder.query({
      query: (userId) => ({
        url: "/financial-profile",
        headers: { "X-User-Id": userId },
      }),
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation({
      query: ({ userId, data }) => ({
        url: "/financial-profile",
        method: "PUT",
        headers: { "X-User-Id": userId },
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),

    checkProfileExists: builder.query({
      query: (userId) => ({
        url: "/financial-profile/exists",
        headers: { "X-User-Id": userId },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateProfileMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCheckProfileExistsQuery,
} = profileApi;
