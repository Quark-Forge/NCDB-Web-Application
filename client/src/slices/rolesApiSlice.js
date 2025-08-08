import { apiSlice } from "./apiSlice";

export const rolesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/api/roles',
      providesTags: ['Roles']
    }),
  })
});

export const { useGetRolesQuery } = rolesApiSlice;