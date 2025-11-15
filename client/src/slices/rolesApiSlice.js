import { apiSlice } from "./apiSlice";

export const rolesEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query({
      query: () => '/roles',
      providesTags: ['role']
    }),
  })
});

export const { useGetRolesQuery } = rolesEndpoints;