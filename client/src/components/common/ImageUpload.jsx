import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useUploadProductImageMutation, useDeleteProductImageMutation } from '../../slices/uploadApiSlice';
import { useUploadProfilePhotoMutation, useDeleteProfilePhotoMutation } from '../../slices/uploadApiSlice';

const ImageUpload = ({
    currentImage,
    onImageChange,
    entityId,
    entityType = 'product', // 'product' or 'profile'
    className = '',
    canDelete = true,
    onUploadStart,
    onUploadEnd
}) => {
    const [previewUrl, setPreviewUrl] = useState(currentImage || null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Use the correct mutations based on entityType
    const [uploadProductImage] = useUploadProductImageMutation();
    const [deleteProductImage] = useDeleteProductImageMutation();
    const [uploadProfilePhoto] = useUploadProfilePhotoMutation();
    const [deleteProfilePhoto] = useDeleteProfilePhotoMutation();

    const validateImageFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        }

        if (file.size > maxSize) {
            throw new Error('Image size must be less than 5MB');
        }

        return true;
    };

    const createImagePreview = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            validateImageFile(file);
            const previewUrl = await createImagePreview(file);
            setPreviewUrl(previewUrl);
            setSelectedFile(file);

            // Auto-upload when file is selected and entityId exists
            if (entityId) {
                await uploadImage(file);
            } else {
                // For new entities without ID yet, just set the preview
                if (onImageChange) {
                    onImageChange(previewUrl);
                }
            }
        } catch (error) {
            toast.error(error.message);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const uploadImage = async (file) => {
        try {
            setIsUploading(true);
            if (onUploadStart) onUploadStart();

            let result;

            if (entityType === 'product') {
                // Use product image upload
                result = await uploadProductImage({
                    productId: entityId,
                    imageFile: file
                }).unwrap();
            } else if (entityType === 'profile') {
                // Use profile photo upload
                const formData = new FormData();
                formData.append('photo', file);

                result = await uploadProfilePhoto(formData).unwrap();
            }

            if (result.success) {
                const imageUrl = entityType === 'product'
                    ? result.data.image_url
                    : result.data.profile_photo;

                const successMessage = entityType === 'product'
                    ? 'Product image uploaded successfully!'
                    : 'Profile photo uploaded successfully!';

                toast.success(successMessage);

                if (onImageChange) {
                    onImageChange(imageUrl);
                }

                setPreviewUrl(imageUrl);
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Upload error:', error);

            // More specific error handling
            if (error.status === 403) {
                const message = entityType === 'product'
                    ? 'You do not have permission to upload product images'
                    : 'You do not have permission to upload profile photos';
                toast.error(message);
            } else if (error.status === 401) {
                toast.error('Please log in to upload images');
            } else if (error.status === 404) {
                const message = entityType === 'product'
                    ? 'Product not found'
                    : 'User not found';
                toast.error(message);
            } else {
                toast.error(error?.data?.message || `Failed to upload ${entityType} image`);
            }

            // Reset to current image on error
            setPreviewUrl(currentImage || null);
            setSelectedFile(null);
        } finally {
            setIsUploading(false);
            if (onUploadEnd) onUploadEnd();
        }
    };

    const handleRemoveImage = async () => {
        if (!canDelete || !previewUrl || !entityId) return;

        try {
            setIsUploading(true);
            let result;

            if (entityType === 'product') {
                result = await deleteProductImage(entityId).unwrap();
            } else if (entityType === 'profile') {
                result = await deleteProfilePhoto().unwrap();
            }

            if (result.success) {
                const successMessage = entityType === 'product'
                    ? 'Product image deleted successfully!'
                    : 'Profile photo deleted successfully!';

                toast.success(successMessage);
                setPreviewUrl(null);
                setSelectedFile(null);

                if (onImageChange) {
                    onImageChange(null);
                }

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error?.data?.message || `Failed to delete ${entityType} image`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            try {
                validateImageFile(file);
                const previewUrl = await createImagePreview(file);
                setPreviewUrl(previewUrl);
                setSelectedFile(file);

                if (entityId) {
                    await uploadImage(file);
                } else {
                    if (onImageChange) {
                        onImageChange(previewUrl);
                    }
                }
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const isLoading = isUploading;

    return (
        <div className={`${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {entityType === 'product' ? 'Product Image' : 'Profile Photo'} {entityId && '(Click to change)'}
            </label>
            <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${previewUrl
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !isLoading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg, image/jpg, image/png, image/gif, image/webp"
                    className="hidden"
                    disabled={isLoading}
                />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                        <p className="text-sm text-gray-600">
                            {isUploading
                                ? `Uploading ${entityType} image...`
                                : `Deleting ${entityType} image...`
                            }
                        </p>
                    </div>
                ) : previewUrl ? (
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt={entityType === 'product' ? 'Product preview' : 'Profile preview'}
                            className="mx-auto max-h-48 rounded-lg object-cover"
                        />
                        {canDelete && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (entityId) {
                                        handleRemoveImage();
                                    } else {
                                        setPreviewUrl(null);
                                        setSelectedFile(null);
                                        if (onImageChange) onImageChange(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                            Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF, WebP up to 5MB
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                            Images are stored securely in Cloudinary
                        </p>
                    </div>
                )}
            </div>
            {!entityId && previewUrl && (
                <p className="text-xs text-gray-500 mt-2">
                    Image will be uploaded to Cloudinary after {entityType} creation
                </p>
            )}
        </div>
    );
};

export default ImageUpload;