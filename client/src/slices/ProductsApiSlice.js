import { apiSlice } from './apiSlice';

const PRODUCTS_URL = '/api/products';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/products
    getProducts: builder.query({
      query: ({ search, category, sort, page, limit }) => {
        const params = new URLSearchParams();

        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        return {
          url: `${PRODUCTS_URL}?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['product'],
    }),
    // GET /api/products/with-inactive
    getProductsWithInactive: builder.query({
      query: ({ search, category, sort, page, limit }) => {
        const params = new URLSearchParams();

        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        return {
          url: `${PRODUCTS_URL}/with-inactive?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['product'],
    }),

    // POST /api/products
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['product'],
    }),

    // PUT /api/products/:id
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['product'],
    }),

    // DELETE /api/products/:product_id/suppliers/:supplier_id
    deleteProduct: builder.mutation({
      query: ({ product_id, supplier_id }) => ({  // Destructure the object
        url: `${PRODUCTS_URL}/${product_id}/suppliers/${supplier_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['product'],
    }),

     // GET ${ORDER_URL}/update product stock
        getStockUpdate: builder.query({
            query: ({id}) => ({
                url: `${PRODUCTS_URL}/${id}/stock`,
                method: "GET",
            }),
            providesTags: ["product"],
        }),
  }),
});

export const {
  useGetProductsQuery,
  useGetStockUpdateQuery,
  useGetProductsWithInactiveQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
