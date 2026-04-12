import { apiClient } from "@/app/api-client";
import { UpdateUserResponse, ScheduleReportParams, ScheduledReportTimeResponse } from "./userType";

export const userApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<UpdateUserResponse, FormData>({
      query: (formData) => ({
        url: "/user/update",
        method: "PUT",
        body: formData,
      }),
    }),

    getScheduledReportTime: builder.query<ScheduledReportTimeResponse, void>({
      query: () => ({
        url: "/user/schedule-time",
        method: "GET",
      }),
      providesTags: ["scheduledReport"],
    }),

    scheduleReport: builder.mutation<void, ScheduleReportParams>({
      query: (body) => ({
        url: "/user/schedule",
        method: "POST",
        body,
      }),
      invalidatesTags: ["scheduledReport"],
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useGetScheduledReportTimeQuery,
  useScheduleReportMutation,
} = userApi;