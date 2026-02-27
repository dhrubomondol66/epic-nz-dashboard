import { baseApi } from "../baseApi";

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<unknown, { email: string; password: string }>({
            query: (data) => ({
                url: "auth/login",
                method: "POST",
                data,
            }),
        }),

        /** POST auth/forget-password — sends reset email */
        forgotPassword: builder.mutation<void, { email: string }>({
            query: (data) => ({
                url: "auth/forget-password",
                method: "POST",
                data,
            }),
        }),

        /** POST auth/forgot-password-verify-otp — verifies the OTP code */
        verifyOtp: builder.mutation<void, { email: string; otp: string }>({
            query: (data) => ({
                url: "otp/forgot-password-verify-otp",
                method: "POST",
                data,
            }),
        }),

        setPassword: builder.mutation<
            void,
            { email: string; password: string; confirm_password: string }
        >({
            query: (data) => ({
                url: "auth/set-password",
                method: "POST",
                data: {
                    ...data,
                    confirmPassword: data.confirm_password, // Compatibility alias
                    newPassword: data.password, // Compatibility alias
                },
            }),
        }),

        /** POST auth/logout — logs out the user */
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "auth/logout",
                method: "POST",
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useForgotPasswordMutation,
    useVerifyOtpMutation,
    useSetPasswordMutation,
    useLogoutMutation,
} = authApi;