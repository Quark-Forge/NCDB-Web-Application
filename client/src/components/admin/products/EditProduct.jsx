import { X, Loader2 } from "lucide-react";
import { useUpdateProductMutation } from "../../../slices/ProductsApiSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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
    image_url: '',
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

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
        image_url: initialSupplierItem.image_url || '',
      });
    }
  }, [initialProduct, initialSupplierItem]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        id: initialProduct.id,
        supplier_id: initialSupplierItem.supplier_id,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        quantity_per_unit: parseFloat(formData.quantity_per_unit),
        unit_symbol: formData.unit_symbol.trim(),
        category_id: formData.category_id,
        image_url: formData.image_url.trim() || null
      };

      if (isNaN(updatedData.price) || isNaN(updatedData.quantity_per_unit) ||
        (updatedData.discount_price !== null && isNaN(updatedData.discount_price))) {
        throw new Error('Please enter valid numbers for price and quantity');
      }

      await updateProduct(updatedData).unwrap();
      toast.success('Product updated successfully!');
      closeModals();
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
        err?.data?.error?.message ||
        err.message ||
        'Error updating product'
      );
    }
  };

  if (!showEditModal) return null;

  return (
    <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg md:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Edit Product</h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="block text-sm font-medium text-gray-500 mb-1">Supplier ID</label>
              <div className="text-sm text-gray-900">
                {initialSupplierItem?.supplier_id || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
                <input
                  type="number"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity per Unit *</label>
                <input
                  type="number"
                  name="quantity_per_unit"
                  value={formData.quantity_per_unit}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Symbol *</label>
                <input
                  type="text"
                  name="unit_symbol"
                  value={formData.unit_symbol}
                  onChange={handleInputChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Product SKU</label>
                  <div className="text-sm text-gray-900">{initialProduct?.sku || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Supplier SKU</label>
                  <div className="text-sm text-gray-900">{initialSupplierItem?.supplier_sku || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={closeModals}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isUpdating ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;