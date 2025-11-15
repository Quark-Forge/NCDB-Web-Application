import { apiSlice } from '../slices/apiSlice';

const SHIPPING_Address_URL = '/shipping-addresses';

const shippingAddressEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getShippingAddress: builder.query({
            query: () => ({
                url: `${SHIPPING_Address_URL}`,
                method: 'GET',
            }),
            providesTags: ['ShippingAddress'],
        }),
        addShippingAddress: builder.mutation({
            query: (shippingAddress) => ({
                url: `${SHIPPING_Address_URL}`,
                method: 'POST',
                body: shippingAddress,
            }),
            invalidatesTags: ['ShippingAddress'],
        }),

    }),
});

export const {
    useGetShippingAddressQuery,
    useAddShippingAddressMutation,
} = shippingAddressEndpoints;