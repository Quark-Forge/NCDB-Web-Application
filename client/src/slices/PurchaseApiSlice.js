import { apiSlice } from "./apiSlice";

const SUPPLIER_ITEM_REQUESTS_URL = '/supplier-item-requests';

export const purchaseEndpoints = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET all supplier item requests (for admins/managers)
    getSupplierItemRequests: builder.query({
      query: ({ status, page, limit, supplier_id, search } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (supplier_id) params.append('supplier_id', supplier_id);
        if (search) params.append('search', search);

        return {
          url: `${SUPPLIER_ITEM_REQUESTS_URL}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['SupplierItemRequest'],
    }),

    // GET supplier's own requests (for suppliers)
    getMySupplierItemRequests: builder.query({
      query: ({ status, page, limit, search } = {}) => {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);

        return {
          url: `${SUPPLIER_ITEM_REQUESTS_URL}/my-requests?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['SupplierItemRequest'],
    }),

    // GET single supplier item request
    getSupplierItemRequestById: builder.query({
      query: (id) => `${SUPPLIER_ITEM_REQUESTS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'SupplierItemRequest', id }],
    }),

    // CREATE supplier item request
    createSupplierItemRequest: builder.mutation({
      query: (data) => ({
        url: SUPPLIER_ITEM_REQUESTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupplierItemRequest'],
    }),

    // UPDATE supplier item request (for admins/managers)
    updateSupplierItemRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SupplierItemRequest'],
    }),

    // UPDATE request status (for suppliers)
    updateSupplierItemRequestStatus: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SupplierItemRequest'],
    }),

    // CANCEL request (for admins/managers)
    cancelSupplierItemRequest: builder.mutation({
      query: (id) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['SupplierItemRequest'],
    }),

    // DELETE request (admin only)
    deleteSupplierItemRequest: builder.mutation({
      query: (id) => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SupplierItemRequest'],
    }),

    // GET request statistics
    getRequestStatistics: builder.query({
      query: () => ({
        url: `${SUPPLIER_ITEM_REQUESTS_URL}/stats`,
        method: 'GET',
      }),
      providesTags: ['SupplierItemRequest'],
    }),

  }),
});

export const {
  useGetSupplierItemRequestsQuery,
  useGetMySupplierItemRequestsQuery,
  useGetSupplierItemRequestByIdQuery,
  useCreateSupplierItemRequestMutation,
  useUpdateSupplierItemRequestMutation,
  useUpdateSupplierItemRequestStatusMutation,
  useCancelSupplierItemRequestMutation,
  useDeleteSupplierItemRequestMutation,
  useGetRequestStatisticsQuery,
} = purchaseEndpoints;