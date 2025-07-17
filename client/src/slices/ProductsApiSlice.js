import { apiSlice } from './apiSlice';

const PRODUCTS_URL = '/api/products';

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/products
    getProducts: builder.query({
      query: () => ({
        url: PRODUCTS_URL,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    // GET /api/products/:id
    getProductById: builder.query({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),

    // POST /api/products
    createProduct: builder.mutation({
      query: (data) => ({
        url: PRODUCTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // PUT /api/products/:id
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),

    // DELETE /api/products/:id
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
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
