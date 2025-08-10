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
            query: ({supplier_id, product_id}) => {

                return {
                    url: `${SUPPLIER_ITEMS_URL}/${supplier_id}/items/${product_id}`,
                    method: 'DELETE',
                };
            },
            providesTags: ['supplier-item'],
        }),

    }),
});

export const {
    useGetSupplierItemsQuery,
    useDeleteSupplierItemMutation,
} = supplierItemsApiSlice;