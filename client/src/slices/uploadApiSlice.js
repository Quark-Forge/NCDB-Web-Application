import { apiSlice } from "./apiSlice";

const UPLOAD_URL = '/upload';

export const uploadApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // POST /api/upload/profile/photo
        uploadProfilePhoto: builder.mutation({
            query: (formData) => ({
                url: `${UPLOAD_URL}/profile/photo`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['User'],
        }),

        // DELETE /api/upload/profile/photo
        deleteProfilePhoto: builder.mutation({
            query: () => ({
                url: `${UPLOAD_URL}/profile/photo`,
                method: 'DELETE',
            }),
            invalidatesTags: ['User'],
        }),

        // POST /api/upload/products/:id/image
        uploadProductImage: builder.mutation({
            query: (data) => {
                const formData = new FormData();
                formData.append('image', data.imageFile);

                return {
                    url: `${UPLOAD_URL}/products/${data.productId}/image`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: ['Product'],
        }),

        // DELETE /api/upload/products/:id/image
        deleteProductImage: builder.mutation({
            query: (productId) => ({
                url: `${UPLOAD_URL}/products/${productId}/image`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
    }),
});

export const {
    useUploadProfilePhotoMutation,
    useDeleteProfilePhotoMutation,
    useUploadProductImageMutation,
    useDeleteProductImageMutation,
} = uploadApiSlice;