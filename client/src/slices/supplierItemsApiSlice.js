import { apiSlice } from "./apiSlice";

const SUPPLIER_ITEMS_URL = '/supplier-items';

export const supplierItemsEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // GET all supplier items
        getSupplierItems: builder.query({
            query: () => `${SUPPLIER_ITEMS_URL}`,
            providesTags: ['supplier-item'],
        }),

        // GET current supplier's own items (SUPPLIERS ONLY)
        getMySupplierItems: builder.query({
            query: () => `${SUPPLIER_ITEMS_URL}/my-items`,
            providesTags: ['SupplierItem'],
        }),

        // GET single supplier item by ID
        getSupplierItemById: builder.query({
            query: (id) => `${SUPPLIER_ITEMS_URL}/${id}`,
            providesTags: (result, error, id) => [{ type: 'supplier-item', id }],
        }),

        // DELETE supplier item
        deleteSupplierItem: builder.mutation({
            query: ({ supplier_id, product_id }) => ({
                url: `${SUPPLIER_ITEMS_URL}/${supplier_id}/items/${product_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['supplier-item'],
        }),

        // GET low-stock items
        getLowStockItems: builder.query({
            query: ({ threshold, page, limit }) => {
                const params = new URLSearchParams();
                if (threshold) params.append('threshold', threshold);
                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);

                return {
                    url: `${SUPPLIER_ITEMS_URL}/low-stock/?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['low-stock-items'],
        }),

        // UPDATE / UPSERT supplier item
        updateSupplierItem: builder.mutation({
            query: ({ supplier_id, product_id, stock_level }) => ({
                url: `${SUPPLIER_ITEMS_URL}/${supplier_id}/items/${product_id}`,
                method: 'PUT', // or PATCH depending on your backend
                body: { stock_level },
            }),
            invalidatesTags: ['supplier-item'], // Refresh cache after update
        }),

    }),
});

export const {
    useGetSupplierItemsQuery,
    useGetMySupplierItemsQuery,
    useGetSupplierItemByIdQuery,
    useDeleteSupplierItemMutation,
    useGetLowStockItemsQuery,
    useUpdateSupplierItemMutation,
} = supplierItemsEndpoints;
