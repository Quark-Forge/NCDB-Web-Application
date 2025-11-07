import { apiSlice } from "./apiSlice";
const USERS_URL = '/users';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data
            })
        }),
        logout: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/logout`,
                method: 'POST',
            })
        }),
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}`,
                method: 'POST',
                body: data
            })
        }),
        updateUser: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data
            })
        }),
        getAllUsers: builder.query({
            query: ({ page = 1, limit = 10 }) => ({
                url: `${USERS_URL}`,
                method: 'GET',
                params: { page, limit }
            }
            ),
            providesTags: ['user']
        }),
        getUserProfile: builder.query({
            query: () => ({
                url: `${USERS_URL}/profile`,
                method: 'GET',
            }),
            providesTags: ['user']
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, roleId }) => ({
                url: `${USERS_URL}/${userId}/role`,
                method: 'PUT',
                body: { role_id: roleId },
            }),
            invalidatesTags: ['user']
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `${USERS_URL}/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['user']
        }),
        restoreUser: builder.mutation({
            query: (userId) => ({
                url: `${USERS_URL}/${userId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['user'],
            providesTags: ['user']
        }),
        // Forgot Password
        forgotPassword: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/forgot-password`,
                method: 'POST',
                body: data
            })
        }),
        // Reset Password
        resetPassword: builder.mutation({
            query: ({ token, password }) => ({
                url: `${USERS_URL}/reset-password/${token}`,
                method: 'POST',
                body: { password }
            })
        }),
        // Email Verification
        verifyEmail: builder.mutation({
            query: (token) => ({
                url: `${USERS_URL}/verify/${token}`,
                method: 'GET',
            })
        }),
        // Resend Verification Email
        resendVerification: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/resend-verification`,
                method: 'POST',
                body: data
            })
        }),
    })
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
    useGetUserProfileQuery,
    useUpdateUserMutation,
    useGetAllUsersQuery,
    useDeleteUserMutation,
    useRestoreUserMutation,
    useUpdateUserRoleMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useVerifyEmailMutation,
    useResendVerificationMutation
} = usersApiSlice;