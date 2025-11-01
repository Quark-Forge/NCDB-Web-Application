import { X, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import FormInput from "./FormInput";
import ImageUpload from "../../common/ImageUpload";
import { validateField, validateAllFields, isFormValid } from "../../../utils/productValidation";
import { useUpdateProductMutation } from "../../../slices/ProductsApiSlice";
import { useDeleteProductImageMutation } from "../../../slices/uploadApiSlice";

const EditProduct = ({
  showEditModal,
  closeModals,
  product: initialProduct,
  supplierItem: initialSupplierItem,
  categories,
  refetch
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    quantity_per_unit: '',
    unit_symbol: '',
    category_id: '',
    image_url: null,
  });

  const [errors, setErrors] = useState({});
  const [productImage, setProductImage] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProductImage, { isLoading: isDeletingImage }] = useDeleteProductImageMutation();

  useEffect(() => {
    if (initialProduct && initialSupplierItem) {
      setFormData({
        name: initialProduct.name || '',
        description: initialSupplierItem.description || '',
        price: initialSupplierItem.price?.toString() || '',
        discount_price: initialSupplierItem.discount_price?.toString() || '',
        quantity_per_unit: initialSupplierItem.quantity_per_unit?.toString() || '',
        unit_symbol: initialSupplierItem.unit_symbol || '',
        category_id: initialProduct.category_id?.toString() || '',
        image_url: initialSupplierItem.image_url || initialProduct.base_image_url || null,
      });

      // Set initial image for ImageUpload component
      const initialImage = initialSupplierItem.image_url || initialProduct.base_image_url;
      if (initialImage) {
        setProductImage(initialImage);
      }
    }
  }, [initialProduct, initialSupplierItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChangeWithValidation = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const errorMessage = validateField(name, value, formData);

    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    if (name === 'price' && formData.discount_price) {
      const discountError = validateField('discount_price', formData.discount_price, formData);
      setErrors(prev => ({
        ...prev,
        discount_price: discountError
      }));
    }
  };

  const handleImageChange = (imageUrl) => {
    setProductImage(imageUrl);
    setHasImageChanged(true);

    // Also update the formData for image_url to maintain consistency
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl || null
    }));
  };

  const handleImageUploadStart = () => {
    setIsImageUploading(true);
  };

  const handleImageUploadEnd = () => {
    setIsImageUploading(false);
    setHasImageChanged(false);
  };

  const handleDeleteImage = async () => {
    try {
      setIsImageUploading(true);

      // If there's an existing image, delete it from Cloudinary
      const currentImageUrl = initialSupplierItem?.image_url || initialProduct?.base_image_url;

      if (currentImageUrl && currentImageUrl.includes('cloudinary.com')) {
        await deleteProductImage(initialProduct.id).unwrap();
      }

      // Clear local state immediately for better UX
      setProductImage(null);
      setFormData(prev => ({
        ...prev,
        image_url: null
      }));
      setHasImageChanged(true);

      toast.success('Image deleted successfully');

      // Force immediate refetch of product data
      setTimeout(() => {
        refetch();
      }, 500);

    } catch (err) {
      console.error('Delete image error:', err);
      toast.error(
        err?.data?.message ||
        err?.data?.error?.message ||
        err.message ||
        'Error deleting image'
      );
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Don't submit if image is currently uploading
    if (isImageUploading) {
      toast.error('Please wait for image upload to complete');
      setIsSubmitting(false);
      return;
    }

    const allErrors = validateAllFields(formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      toast.error('Please fix all validation errors before submitting');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedData = {
        id: initialProduct.id,
        supplier_id: initialSupplierItem.supplier_id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        quantity_per_unit: parseFloat(formData.quantity_per_unit),
        unit_symbol: formData.unit_symbol.trim(),
        category_id: formData.category_id,
        image_url: formData.image_url?.trim() || null
      };

      const result = await updateProduct(updatedData).unwrap();

      toast.success('Product updated successfully!');

      // Force refetch before closing modal
      await refetch();

      closeModals();

    } catch (err) {
      console.error('Update product error:', err);
      toast.error(
        err?.data?.message ||
        err?.data?.error?.message ||
        err.message ||
        'Error updating product'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !isFormValid(formData, errors) || isImageUploading;

  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg md:rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Edit Product</h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isImageUploading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only supplier info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-2">Supplier Information</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Supplier ID</label>
                  <div className="text-sm text-gray-900 font-medium">
                    {initialSupplierItem && initialSupplierItem.supplier_id || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product SKU</label>
                  <div className="text-sm text-gray-900 font-medium">
                    {initialProduct && initialProduct.sku || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Supplier SKU</label>
                  <div className="text-sm text-gray-900 font-medium">
                    {initialSupplierItem && initialSupplierItem.supplier_sku || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Product Image
                </label>
                {productImage && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={isImageUploading || isDeletingImage}
                    className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {isDeletingImage ? 'Deleting...' : 'Delete Image'}
                  </button>
                )}
              </div>

              <ImageUpload
                currentImage={productImage}
                onImageChange={handleImageChange}
                onUploadStart={handleImageUploadStart}
                onUploadEnd={handleImageUploadEnd}
                entityId={initialProduct && initialProduct.id}
                entityType="product"
                className="mb-2"
              />

              {isImageUploading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-blue-700">Image upload in progress...</span>
                  </div>
                </div>
              )}

              {!productImage && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-700">
                    No image uploaded. You can upload an image or leave it empty.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleInputChangeWithValidation}
                error={errors.name}
                required={true}
                placeholder="Enter product name"
                disabled={isImageUploading}
              />

              <FormInput
                label="Category"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChangeWithValidation}
                error={errors.category_id}
                type="select"
                required={true}
                options={categories || []}
                disabled={isImageUploading}
              />

              <FormInput
                label="Price"
                name="price"
                value={formData.price}
                onChange={handleInputChangeWithValidation}
                error={errors.price}
                type="number"
                required={true}
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={isImageUploading}
              />

              <FormInput
                label="Discount Price"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleInputChangeWithValidation}
                error={errors.discount_price}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00 (optional)"
                disabled={isImageUploading}
              />

              <FormInput
                label="Quantity per Unit"
                name="quantity_per_unit"
                value={formData.quantity_per_unit}
                onChange={handleInputChangeWithValidation}
                error={errors.quantity_per_unit}
                type="number"
                required={true}
                step="0.01"
                min="0"
                placeholder="e.g., 1.5"
                disabled={isImageUploading}
              />

              <FormInput
                label="Unit Symbol"
                name="unit_symbol"
                value={formData.unit_symbol}
                onChange={handleInputChangeWithValidation}
                error={errors.unit_symbol}
                required={true}
                placeholder="e.g., kg, lbs, pcs"
                disabled={isImageUploading}
              />
            </div>

            <FormInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChangeWithValidation}
              error={errors.description}
              type="textarea"
              placeholder="Detailed product description..."
              disabled={isImageUploading}
            />

            {/* Cloudinary Image URL field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cloudinary Image URL
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url || ''}
                  onChange={handleInputChange}
                  className="block flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Cloudinary URL will appear here after upload"
                  readOnly={!!productImage && productImage.includes('cloudinary.com')}
                />
                {formData.image_url && (
                  <a
                    href={formData.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm whitespace-nowrap"
                  >
                    View Image
                  </a>
                )}
                {formData.image_url && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={isImageUploading}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm whitespace-nowrap flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear URL
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {productImage && productImage.includes('cloudinary.com')
                  ? 'Cloudinary URL (auto-filled after upload)'
                  : 'Upload an image above or paste a Cloudinary URL manually'
                }
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={closeModals}
                disabled={isImageUploading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;