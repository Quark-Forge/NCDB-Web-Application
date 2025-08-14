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

export const {
    useGetCartQuery,
    useAddToCartMutation,
} = cartApiSlice;