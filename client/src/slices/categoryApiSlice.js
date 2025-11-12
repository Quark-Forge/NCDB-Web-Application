import { apiSlice } from "./apiSlice";

const CATEGORY_URL = '/categories';

export const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/categories/active
        getCategories: builder.query({
            query: () => `${CATEGORY_URL}/active`,
            providesTags: ['category'],
        }),
        
        // GET /api/categories (all categories including inactive)
        getAllCategories: builder.query({
            query: () => CATEGORY_URL,
            providesTags: ['category'],
        }),
        
        // GET /api/categories/:id
        getCategoryById: builder.query({
            query: (id) => `${CATEGORY_URL}/${id}`,
            providesTags: ['category'],
        }),
        
        // POST /api/categories
        createCategory: builder.mutation({
            query: (data) => ({
                url: CATEGORY_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['category'],
        }),
        
        // PUT /api/categories/:id
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${CATEGORY_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['category'],
        }),
        
        // DELETE /api/categories/:id
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `${CATEGORY_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['category'],
        }),
        // PUT /api/categories/restore/:id
        restoreCategory: builder.mutation({
            query: (id) => ({
                url: `${CATEGORY_URL}/restore/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['category'],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetAllCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
    useRestoreCategoryMutation,
} = categoryApiSlice;