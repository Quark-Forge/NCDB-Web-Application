import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({ baseUrl: '' });

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['user', 'product', 'category', 'role', 'cart', 'supplier-item', ],
    endpoints: (builder) => ({})
});


