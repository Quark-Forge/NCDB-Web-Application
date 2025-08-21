import { apiSlice } from "./apiSlice";

const SUPPLIER_ITEMS_URL = '/api/supplier-items';

export const supplierItemsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // GET all supplier items
        getSupplierItems: builder.query({
            query: () => `${SUPPLIER_ITEMS_URL}`,
            providesTags: ['supplier-item'],
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
    useDeleteSupplierItemMutation,
    useGetLowStockItemsQuery,
    useUpdateSupplierItemMutation,
} = supplierItemsApiSlice;
