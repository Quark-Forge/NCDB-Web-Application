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

    // GET /api/products/:id
    getProductById: builder.query({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'GET',
      }),
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

    // DELETE /api/products/:id
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['product'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApiSlice;
