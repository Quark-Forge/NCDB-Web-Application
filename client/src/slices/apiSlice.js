import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use environment variable for base URL
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    credentials: 'include'
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ['User', 'Product', 'Category', 'Role', 'Cart', 'Supplier-item', 'Upload'],
    endpoints: (builder) => ({})
});