import { apiSlice } from "./apiSlice";

const CATEGORY_URL = '/api/categories';

export const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/category
        getCategories: builder.query({
            query: () => `${CATEGORY_URL}/active`,
        }),
    }),
});

export const {
    useGetCategoriesQuery,
} = categoryApiSlice;