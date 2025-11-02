import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'https://trains-production.up.railway.app',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        headers.set('Content-Type', 'application/json');
        return headers;
    }
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Product', 'Category', 'Role', 'Cart', 'Supplier-item', 'Upload'],
    endpoints: (builder) => ({})
});