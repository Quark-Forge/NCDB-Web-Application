import { apiSlice } from "./apiSlice";

const PAYMENT_URL = "/payments";

export const paymentEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET payment transactions
        getPaymentTransactions: builder.query({
            query: ({
                search,
                range = '90d',
                payment_status,
                payment_method,
                page = 1,
                limit = 10
            } = {}) => {
                const params = new URLSearchParams();

                if (search) params.append("search", search);
                if (range) params.append("range", range);
                if (payment_status && payment_status !== 'all') params.append("payment_status", payment_status);
                if (payment_method && payment_method !== 'all') params.append("payment_method", payment_method);
                params.append("page", page);
                params.append("limit", limit);

                return {
                    url: `${PAYMENT_URL}/transactions?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Payment"],
        }),

        // GET payment statistics
        getPaymentStats: builder.query({
            query: ({ range = '30d' } = {}) => {
                const params = new URLSearchParams();
                if (range) params.append("range", range);

                return {
                    url: `${PAYMENT_URL}/stats?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["Payment"],
        }),

        // GET payment details
        getPaymentDetails: builder.query({
            query: (paymentId) => ({
                url: `${PAYMENT_URL}/${paymentId}`,
                method: "GET",
            }),
            providesTags: (result, error, paymentId) => [{ type: "Payment", id: paymentId }],
        }),

        // UPDATE payment status
        updatePaymentStatus: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${PAYMENT_URL}/${id}/status`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Payment"],
        }),

        // PROCESS refund
        processRefund: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${PAYMENT_URL}/${id}/refund`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Payment"],
        }),
    }),
});

export const {
    useGetPaymentTransactionsQuery,
    useGetPaymentStatsQuery,
    useGetPaymentDetailsQuery,
    useUpdatePaymentStatusMutation,
    useProcessRefundMutation
} = paymentEndpoints;