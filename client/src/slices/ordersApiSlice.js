import { apiSlice } from "./apiSlice";

const ORDER_URL = "/orders";

export const ordersEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET ${ORDER_URL}
        getAllOrders: builder.query({
            query: ({
                search,
                range,
                status,
                payment_status,
                product_id,
                supplier_id,
                limit = 10,
                page = 1
            } = {}) => {
                const params = new URLSearchParams();

                if (search) params.append("search", search);
                if (range) params.append("range", range);
                if (status) params.append("status", status);
                if (payment_status) params.append("payment_status", payment_status);
                if (product_id) params.append("product_id", product_id);
                if (supplier_id) params.append("supplier_id", supplier_id);
                if (page) params.append("page", page);
                if (limit) params.append("limit", limit);

                return {
                    url: `${ORDER_URL}?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Order"],
        }),

        // POST ${ORDER_URL}/checkout
        checkoutOrder: builder.mutation({
            query: (data) => ({
                url: `${ORDER_URL}/checkout`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Order", "Cart"],
        }),

        // PUT ${ORDER_URL}/:id/status
        updateOrderStatus: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${ORDER_URL}/${id}/status`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Order"],
        }),

        // GET ${ORDER_URL}/my-orders
        getMyOrders: builder.query({
            query: () => ({
                url: `${ORDER_URL}/my-orders`,
                method: "GET",
            }),
            providesTags: ["Order"],
        }),

        // GET ${ORDER_URL}/:id
        getOrderDetails: builder.query({
            query: (orderId) => ({
                url: `${ORDER_URL}/${orderId}`,
                method: "GET",
            }),
            providesTags: (result, error, orderId) => [{ type: "Order", id: orderId }],
        }),

        // PUT Cancel Order
        cancelUserOrder: builder.mutation({
            query: (orderId) => ({
                url: `${ORDER_URL}/${orderId}/cancel`,
                method: "PUT",
            }),
            invalidatesTags: ["Order"],
        }),

        // GET ${ORDER_URL}/stats
        getOrderStats: builder.query({
            query: (params = {}) => {
                const { range } = params;
                const urlParams = new URLSearchParams();

                if (range) urlParams.append("range", range);

                return {
                    url: `${ORDER_URL}/stats?${urlParams.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Order"],
        }),
    }),
});

export const {
    useGetAllOrdersQuery,
    useCheckoutOrderMutation,
    useUpdateOrderStatusMutation,
    useGetMyOrdersQuery,
    useGetOrderDetailsQuery,
    useCancelUserOrderMutation,
    useGetOrderStatsQuery
} = ordersEndpoints;