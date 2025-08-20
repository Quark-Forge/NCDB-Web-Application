import { apiSlice } from "./apiSlice";

const SUPPLIER_ITEMS_URL = '/api/supplier-items';

export const supplierItemsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // GET /api/supplier-items
        getSupplierItems: builder.query({
            query: () => `${SUPPLIER_ITEMS_URL}`,
            providesTags: ['supplier-item'],
        }),

        // DELETE /api/supplier-items/:supplier_id/items/:product_id
        deleteSupplierItem: builder.mutation({
            query: ({ supplier_id, product_id }) => {

                return {
                    url: `${SUPPLIER_ITEMS_URL}/${supplier_id}/items/${product_id}`,
                    method: 'DELETE',
                };
            },
            providesTags: ['supplier-item'],
        }),

        // GET /api/supplier-items/low-stock
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

    }),
});

export const {
    useGetSupplierItemsQuery,
    useDeleteSupplierItemMutation,
    useGetLowStockItemsQuery,
} = supplierItemsApiSlice;