import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Determine base URL based on environment
const getBaseUrl = () => {
    // If we're in development and have a local server running
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL || 'http://localhost:5000';
    }
    // In production, use the Railway URL
    return import.meta.env.VITE_API_URL || 'https://trains-production.up.railway.app';
};

const baseQuery = fetchBaseQuery({
    baseUrl: getBaseUrl(),
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        // You can add auth headers here if needed
        headers.set('Content-Type', 'application/json');
        return headers;
    },
    // Add timeout and better error handling
    timeout: 10000,
});

// Enhanced base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error) {
        console.error('API Error:', result.error);

        // Handle specific error cases
        if (result.error.status === 401) {
            // Handle unauthorized access
            console.log('Unauthorized access - redirect to login');
        } else if (result.error.status === 500) {
            // Handle server errors
            console.log('Server error - please try again later');
        } else if (result.error.status === 'TIMEOUT_ERROR') {
            // Handle timeout errors
            console.log('Request timeout - please check your connection');
        }
    }

    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User', 'Product', 'Category', 'Role', 'Cart', 'Supplier-item', 'Upload', 'Order'],
    endpoints: (builder) => ({})
});

export default apiSlice;