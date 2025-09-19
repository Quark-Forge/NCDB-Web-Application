import { apiSlice } from './apiSlice';

const SUPPLIER_ITEM_REQUESTS_URL = '/api/supplier-item-requests';

export const purchaseApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/supplier-item-requests
    getSupplierItemRequests: builder.query({
      query: ({ status, supplier_id } = {}) => {
        const params = new URLSearchParams();
        
        if (status) params.append('status', status);
        if (supplier_id) params.append('supplier_id', supplier_id);
        
        return {
          url: `${SUPPLIER_ITEM_REQUESTS_URL}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Purchase'],
    }),
    
    // GET /api/supplier-item-requests/supplier/my-requests
    getMySupplierItemRequests: builder.query({
      query: () => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/supplier/my-requests`,
        method: 'GET',
      }),
      providesTags: ['Purchase'],
    }),
    
    // GET /api/supplier-item-requests/:id
    getSupplierItemRequestById: builder.query({
      query: (id) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: ['Purchase'],
    }),
    
    // POST /api/supplier-item-requests
    createSupplierItemRequest: builder.mutation({
      query: (data) => ({
        url: SUPPLIER_ITEM_REQUESTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Purchase'],
    }),
    
    // PUT /api/supplier-item-requests/:id/status
    updateSupplierItemRequestStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Purchase'],
    }),
    
    // PUT /api/supplier-item-requests/:id/cancel
    cancelSupplierItemRequest: builder.mutation({
      query: (id) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Purchase'],
    }),
    
    // DELETE /api/supplier-item-requests/:id
    deleteSupplierItemRequest: builder.mutation({
      query: (id) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Purchase'],
    }),
  }),
});

export const {
  useGetSupplierItemRequestsQuery,
  useGetMySupplierItemRequestsQuery,
  useGetSupplierItemRequestByIdQuery,
  useCreateSupplierItemRequestMutation,
  useUpdateSupplierItemRequestStatusMutation,
  useCancelSupplierItemRequestMutation,
  useDeleteSupplierItemRequestMutation,
} = purchaseApiSlice;