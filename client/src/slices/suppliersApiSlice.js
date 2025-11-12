import { apiSlice } from "./apiSlice";

const SUPPLIERS_URL = '/suppliers';

export const suppliersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/suppliers
        getAllSuppliers: builder.query({
            query: () => SUPPLIERS_URL,
            providesTags: ['supplier'],
        }),
        // GET /api/suppliers/ active
        getAllActiveSuppliers: builder.query({
            query: () => `${SUPPLIERS_URL}/active`,
            providesTags: ['supplier'],
        }),
        
        // GET /api/suppliers/:id
        getSupplierById: builder.query({
            query: (id) => `${SUPPLIERS_URL}/${id}`,
            providesTags: ['supplier'],
        }),
        
        // POST /api/suppliers
        createSupplier: builder.mutation({
            query: (data) => ({
                url: SUPPLIERS_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['supplier'],
        }),
        
        // PUT /api/suppliers/:id
        updateSupplier: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${SUPPLIERS_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['supplier'],
        }),
        
        // DELETE /api/suppliers/:id
        deleteSupplier: builder.mutation({
            query: (id) => ({
                url: `${SUPPLIERS_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['supplier'],
        }),

        // PUT /api/suppliers/restore/:id
        restoreSupplier: builder.mutation({
            query: (id) => ({
                url: `${SUPPLIERS_URL}/restore/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['supplier'],
        }),
    }),
});

export const {
    useGetAllSuppliersQuery,
    useGetAllActiveSuppliersQuery,
    useGetSupplierByIdQuery,
    useCreateSupplierMutation,
    useUpdateSupplierMutation,
    useDeleteSupplierMutation,
    useRestoreSupplierMutation,
} = suppliersApiSlice;
