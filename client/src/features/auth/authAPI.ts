import { apiClient } from "@/app/api-client";

export const authApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),

    refresh: builder.mutation<
      {
        access_token: string;
        expires_in: number;
      },
      { refresh_token: string }
    >({
      query: (body) => ({
        url: "/auth/refresh-token",
        method: "POST",
        body,
      }),
    }),

    // Forgot Password APIs
    forgotPasswordSendOtp: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/auth/forgot-password/send-otp",
        method: "POST",
        body,
      }),
    }),

    forgotPasswordVerifyOtp: builder.mutation<
      { message: string; otp_valid: boolean },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/auth/forgot-password/verify-otp",
        method: "POST",
        body,
      }),
    }),

    forgotPasswordReset: builder.mutation<
      { message: string },
      { email: string; new_password: string }
    >({
      query: (body) => ({
        url: "/auth/forgot-password/reset",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordSendOtpMutation,
  useForgotPasswordVerifyOtpMutation,
  useForgotPasswordResetMutation,
} = authApi;