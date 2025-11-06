import { apiSlice } from "./apiSlice";

const UPLOAD_URL = '/upload';

export const uploadApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // POST /api/upload/products/:id/image
        uploadProductImage: builder.mutation({
            query: (data) => {
                // Create FormData properly
                const formData = new FormData();
                formData.append('image', data.imageFile);

                console.log('=== FormData Debug ===');
                console.log('Product ID:', data.productId);
                console.log('File in FormData:', data.imageFile);

                // Log FormData contents
                for (let pair of formData.entries()) {
                    console.log('FormData entry:', pair[0], pair[1]);
                }

                return {
                    url: `${UPLOAD_URL}/products/${data.productId}/image`,
                    method: 'POST',
                    body: formData,
                    // Explicitly avoid setting any Content-Type header
                    headers: {
                        // Let browser set the multipart/form-data with boundary
                    },
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
    }),
});

export const {
    useUploadProfilePhotoMutation,
    useDeleteProfilePhotoMutation,
    useUploadProductImageMutation,
    useDeleteProductImageMutation,
} = uploadApiSlice;