import { apiSlice } from "./apiSlice";


const CARTS_URL = '/api/carts';

export const cartApiSlice  = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET api/carts
        getCart: builder.query({
            query: () => `${CARTS_URL}`,
            providesTags: ['cart'],
        }),

        // POST /api/carts
        addToCart: builder.mutation({
            query: (data) => ({
                url: CARTS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['cart'],
        }),
    }),
});
// import { apiSlice } from "./apiSlice";


// const CARTS_URL = '/api/carts';

// export const cartApiSlice  = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({
//         // GET api/carts
//         getCart: builder.query({
//             query: () => `${CARTS_URL}`,
//             providesTags: ['cart'],
//         }),

//         // POST /api/carts
//         addToCart: builder.mutation({
//             query: (data) => ({
//                 url: CARTS_URL,
//                 method: 'POST',
//                 body: data,
//             }),
//             invalidatesTags: ['cart'],
//         }),
//     }),
// });

// export const {
//     useGetCartQuery,
//     useAddToCartMutation,
// } = cartApiSlice;

import { apiSlice } from "./apiSlice";

const CARTS_URL = '/api/carts';

export const cartApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/carts - Get user's cart
        getCart: builder.query({
            query: () => `${CARTS_URL}`,
            providesTags: ['Cart'],
        }),

        // POST /api/carts - Add item to cart
        addToCart: builder.mutation({
            query: (data) => ({
                url: CARTS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Cart'],
        }),

        // PUT /api/carts/items/:product_id/:supplier_id - Update cart item quantity
        updateCartItem: builder.mutation({
            query: ({ product_id, supplier_id, quantity }) => ({
                url: `${CARTS_URL}/items/${product_id}/${supplier_id}`,
                method: 'PUT',
                body: { quantity },
            }),
            invalidatesTags: ['Cart'],
        }),

        // DELETE /api/carts/items/:product_id/:supplier_id - Remove item from cart
        removeFromCart: builder.mutation({
            query: ({ product_id, supplier_id }) => ({
                url: `${CARTS_URL}/items/${product_id}/${supplier_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),

        // DELETE /api/carts - Clear entire cart
        clearCart: builder.mutation({
            query: () => ({
                url: CARTS_URL,
                method: 'DELETE',
            }),
            invalidatesTags: ['Cart'],
        }),

        // GET /api/carts/total - Get cart total
        getCartTotal: builder.query({
            query: () => `${CARTS_URL}/total`,
            providesTags: ['Cart'],
        }),
    }),
});

export const {
    useGetCartQuery,
    useAddToCartMutation,
} = cartApiSlice;
export const {
    useGetCartQuery,
    useAddToCartMutation,
    useUpdateCartItemMutation,
    useRemoveFromCartMutation,
    useClearCartMutation,
    useGetCartTotalQuery,
} = cartApiSlice;