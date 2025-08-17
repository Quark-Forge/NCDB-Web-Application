import { apiSlice } from '../slices/apiSlice';

const SHIPPING_COST_URL = '/api/shipping-costs';

const shippingCostApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getShippingCost: builder.query({
            query: () => ({
                url: `${SHIPPING_COST_URL}`,
                method: 'GET',
            }),
            providesTags: ['ShippingCost'],
        }),
        addShippingCost: builder.mutation({
            query: (shippingCost) => ({
                url: `${SHIPPING_COST_URL}`,
                method: 'POST',
                body: shippingCost,
            }),
            invalidatesTags: ['ShippingCost'],
        }),

    }),
});

export const {
    useGetShippingCostQuery,
    useAddShippingCostMutation,
} = shippingCostApiSlice;