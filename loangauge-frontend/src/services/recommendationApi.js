import { api } from './api';

export const recommendationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRecommendations: builder.query({
      // assessmentId is stored (and expected by the backend) as a string in
      // MongoDB — never coerce this to a number, unlike the MySQL-backed ids
      // used elsewhere.
      query: (assessmentId) => `/api/recommendations/${assessmentId}`,
      transformResponse: (response) => response.data,
      // No pollingInterval here on purpose — recommendations are generated
      // asynchronously after assessment creation, but not every consumer of
      // this hook wants to poll. Polling/timeout behavior belongs to the
      // calling page (see AssessmentDetailPage), passed in as hook options.
    }),
  }),
  overrideExisting: false,
});

export const { useGetRecommendationsQuery } = recommendationApi;
