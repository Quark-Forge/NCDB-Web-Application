import { apiSlice } from "./apiSlice";

export const rolesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['role']
    }),
  })
});

export const { useGetRolesQuery } = rolesApiSlice;