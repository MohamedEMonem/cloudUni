import { apiSlice } from "@/store/apiSlice";
import { IAPIResponse } from "@/types/api/response.types";
import { LoginDTO, RegisterDTO } from "@/types/dto/auth.dto";
import { IUser } from "@/types/entities/user.types";

interface IVerifyOtpPayload {
  otp: string;
}

interface IPatchProfilePayload {
  name?: string;
  contactNumber?: string | null;
  profilePhotoUrl?: string | null;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      IAPIResponse<{ token: string; user: IUser }>,
      RegisterDTO
    >({
      query: (credentials) => ({
        url: "auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<
      IAPIResponse<{ token: string; user: IUser }>,
      LoginDTO
    >({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    refresh: builder.mutation<IAPIResponse<{ token: string }>, void>({
      query: () => ({
        url: "auth/refresh",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<IAPIResponse<{ success: boolean }>, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    getProfile: builder.query<IAPIResponse<IUser>, void>({
      query: () => ({
        url: "auth/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    patchProfile: builder.mutation<IAPIResponse<IUser>, IPatchProfilePayload>({
      query: (payload) => ({
        url: "auth/profile",
        method: "PATCH",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    deleteAccount: builder.mutation<IAPIResponse<{ success: boolean }>, void>({
      query: () => ({
        url: "auth/profile",
        method: "DELETE",
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyOtp: builder.mutation<IAPIResponse<{ isVerified: boolean }>, IVerifyOtpPayload>({
      query: (payload) => ({
        url: "auth/verify-otp",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),
    resendOtp: builder.mutation<IAPIResponse<{ sent: boolean }>, void>({
      query: () => ({
        url: "auth/resend-otp",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetProfileQuery,
  usePatchProfileMutation,
  useDeleteAccountMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
} = authApi;
