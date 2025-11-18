import { apiSlice } from '../slices/apiSlice';

const SHIPPING_ADDRESS_URL = '/shipping-addresses';

const shippingAddressEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getShippingAddress: builder.query({
            query: () => ({
                url: `${SHIPPING_ADDRESS_URL}`,
                method: 'GET',
            }),
            providesTags: ['ShippingAddress'],
        }),
        addShippingAddress: builder.mutation({
            query: (shippingAddress) => ({
                url: `${SHIPPING_ADDRESS_URL}`,
                method: 'POST',
                body: shippingAddress,
            }),
            invalidatesTags: ['ShippingAddress'],
        }),
        updateShippingAddress: builder.mutation({
            query: ({ id, ...shippingAddress }) => ({
                url: `${SHIPPING_ADDRESS_URL}/${id}`,
                method: 'PUT',
                body: shippingAddress,
            }),
            invalidatesTags: ['ShippingAddress'],
        }),
        deleteShippingAddress: builder.mutation({
            query: (id) => ({
                url: `${SHIPPING_ADDRESS_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['ShippingAddress'],
        }),
    }),
});

export const {
    useGetShippingAddressQuery,
    useAddShippingAddressMutation,
    useUpdateShippingAddressMutation,
    useDeleteShippingAddressMutation,
} = shippingAddressEndpoints;