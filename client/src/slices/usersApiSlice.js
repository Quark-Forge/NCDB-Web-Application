import { apiSlice } from "./apiSlice";
const USERS_URL = '/api/users';

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
            query: ({ page = 1, limit = 2 }{ page = 1, limit = 10 }) => ({
                url: `${USERS_URL}`,
                method: 'GET',
                params: { page, limit }
                params: { page, limit }
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
            invalidatesTags: ['user']
        }),


    })
});

export const {
   
    useLoginMutation,
   
    useLogoutMutation,
   
    useRegisterMutation,
   
    useUpdateUserMutation,
   
    useGetAllUsersQuery,
    useDeleteUserMutation,
    useRestoreUserMutation,
   ,
    useDeleteUserMutation,
    useRestoreUserMutation,
    useUpdateUserRoleMutation
useUpdateUserRoleMutation
} = usersApiSlice;