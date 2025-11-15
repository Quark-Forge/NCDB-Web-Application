import { apiSlice } from '../slices/apiSlice';

const SHIPPING_COST_URL = '/shipping-costs';

const shippingCostEndpoints = apiSlice.injectEndpoints({
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
        updateShippingCost: builder.mutation({
            query: ({ id, ...shippingCost }) => ({
                url: `${SHIPPING_COST_URL}/${id}`,
                method: 'PUT',
                body: shippingCost,
            }),
            invalidatesTags: ['ShippingCost'],
        }),
        deleteShippingCost: builder.mutation({
            query: (id) => ({
                url: `${SHIPPING_COST_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ShippingCost'],
        }),

    }),
});

export const {
    useGetShippingCostQuery,
    useAddShippingCostMutation,
    useUpdateShippingCostMutation,
    useDeleteShippingCostMutation,
} = shippingCostEndpoints;