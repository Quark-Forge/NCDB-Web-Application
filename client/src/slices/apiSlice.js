import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
        const token = getState().auth?.userInfo?.token;

        // Add authorization header if token exists
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }

        // IMPORTANT: Don't set Content-Type for upload endpoints
        if (endpoint && endpoint.includes('upload')) {
            headers.delete('Content-Type');
            return headers;
        }

        // For other endpoints, set JSON content type
        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }
        return headers;
    }
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: [
        'User',
        'Product',
        'Category',
        'Role',
        'Cart',
        'Supplier-item',
        'Upload',
        'Order',
        'Payment',
        'Purchase',
        'ShippingAddress',
        'ShippingCost',
        'Wishlist'
    ],
    endpoints: (builder) => ({})
});