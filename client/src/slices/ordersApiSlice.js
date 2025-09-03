import { apiSlice } from "./apiSlice";

const ORDER_URL = "/api/orders";

const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET ${ORDER_URL}
        getAllOrders: builder.query({
            query: ({ search, range, status, startDate, endDate, product_id, supplier_id, limit, page }) => {
                const params = new URLSearchParams();

                if (search) params.append("search", search);
                if (range) params.append("range", range);
                if (startDate) params.append("startDate", startDate);
                if (endDate) params.append("endDate", startDate);
                if (product_id) params.append("product_id", product_id);
                if (supplier_id) params.append("supplier_id", supplier_id);
                if (status) params.append("status", status);
                if (page) params.append("page", page);
                if (limit) params.append("limit", limit);

                return {
                    url: `${ORDER_URL}?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["order"],
        }),

        // POST ${ORDER_URL}
        checkoutOrder: builder.mutation({
            query: (data) => ({
                url: `${ORDER_URL}/checkout`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["order"],
        }),

        // PUT ${ORDER_URL}/:id
        updateOrderStatus: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${ORDER_URL}/${id}/status`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["order"],
        }),

        // GET ${ORDER_URL}/my-orders
        getMyOrders: builder.query({
            query: () => ({
                url: `${ORDER_URL}/my-orders`,
                method: "GET",
            }),
            providesTags: ["order"],
        }),

        // GET ${ORDER_URL}/:id
        getOrderDetails: builder.query({
            query: (orderId) => ({
                url: `${ORDER_URL}/${orderId}`,
                method: "GET",
            }),
            providesTags: (result, error, orderId) => [{ type: "order", orderId }],
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
            providesTags: ["order"],
        }),
    }),
});

export const {
    useGetAllOrdersQuery,
    useCheckoutOrderMutation,
    useUpdateOrderStatusMutation,
    useGetMyOrdersQuery,
    useGetOrderDetailsQuery,
    useGetOrderStatsQuery

} = ordersApiSlice;