import { apiSlice } from "./apiSlice";

const CATEGORY_URL = '/categories';

export const categoryEndpoints = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/categories/active
        getCategories: builder.query({
            query: () => `${CATEGORY_URL}/active`,
            providesTags: ['Category'],
        }),

        // GET /api/categories (all categories including inactive)
        getAllCategories: builder.query({
            query: () => CATEGORY_URL,
            providesTags: ['Category'],
        }),

        // GET /api/categories/:id
        getCategoryById: builder.query({
            query: (id) => `${CATEGORY_URL}/${id}`,
            providesTags: ['Category'],
        }),

        // POST /api/categories
        createCategory: builder.mutation({
            query: (data) => ({
                url: CATEGORY_URL,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),

        // PUT /api/categories/:id
        updateCategory: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `${CATEGORY_URL}/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Category'],
        }),

        // DELETE /api/categories/:id
        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `${CATEGORY_URL}/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),

        // PUT /api/categories/restore/:id
        restoreCategory: builder.mutation({
            query: (id) => ({
                url: `${CATEGORY_URL}/restore/${id}`,
                method: 'PUT',
            }),
            invalidatesTags: ['Category'],
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
} = categoryEndpoints;