import { apiSlice } from '../slices/apiSlice';

const WISHLIST_URL = '/wishlist';

const wishlistApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWishlist: builder.query({
            query: () => ({
                url: `${WISHLIST_URL}`,
                method: 'GET',
            }),
            providesTags: ['Wishlist'],
        }),
        addToWishlist: builder.mutation({
            query: (wishlistItem) => ({
                url: `${WISHLIST_URL}`,
                method: 'POST',
                body: wishlistItem,
            }),
            invalidatesTags: ['Wishlist'],
        }),
        removeFromWishlist: builder.mutation({
            query: (itemId) => ({
                url: `${WISHLIST_URL}/${itemId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Wishlist'],
        }),
        clearWishlist: builder.mutation({
            query: () => ({
                url: `${WISHLIST_URL}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Wishlist'],
        }),
        checkWishlistItem: builder.query({
            query: (productId) => ({
                url: `${WISHLIST_URL}/check/${productId}`,
                method: 'GET',
            }),
            providesTags: ['Wishlist'],
        }),
        updateWishlistItem: builder.mutation({
            query: ({ itemId, ...wishlistItem }) => ({
                url: `${WISHLIST_URL}/${itemId}`,
                method: 'PUT',
                body: wishlistItem,
            }),
            invalidatesTags: ['Wishlist'],
        }),
    }),
});

export const {
    useGetWishlistQuery,
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useClearWishlistMutation,
    useCheckWishlistItemQuery,
    useUpdateWishlistItemMutation,
} = wishlistApiSlice;