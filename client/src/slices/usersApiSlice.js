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
            query: () => ({
                url: `${USERS_URL}`,
                method: 'GET',
            })
        }),
        updateUserRole: builder.mutation({
            query: ({ userId, roleId }) => ({
                url: `${USERS_URL}/${userId}/role`,
                method: 'PUT',
                body: { role_id: roleId },
            }),
            invalidatesTags: ['Users']
        }),
        deleteUser: builder.mutation({
            query: ( userId ) => ({
                url: `${USERS_URL}/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users']
        }),
        restoreUser: builder.mutation({
            query: ( userId ) => ({
                url: `${USERS_URL}/${userId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Users']
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
    useUpdateUserRoleMutation
} = usersApiSlice;