import { X, Pencil, Trash2, Package, DollarSign, Calendar, Truck } from "lucide-react";
import { useState } from "react";

const ProductDetailModel = ({
    product,
    onClose,
    onEdit,
    onDelete,
    canEditDelete
}) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    
    const handleDeleteConfirm = () => {
        if (product.currentSupplierItem) {
            onDelete(product.id, product.currentSupplierItem.supplier_id);
        }
        onClose();
    };

    const handleEdit = () => {
        if (product.currentSupplierItem) {
            onEdit(product, product.currentSupplierItem);
        }
        onClose();
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return '0.00';
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const supplierItem = product.currentSupplierItem;

    return (
        <div className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg md:rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Product Details</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="w-48 h-48 rounded-lg overflow-hidden bg-gray-100 border">
                                    {supplierItem?.image_url || product.base_image_url ? (
                                        <img
                                            src={supplierItem?.image_url || product.base_image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '';
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Package size={48} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Product Name</label>
                                            <p className="text-gray-900 font-medium capitalize">{product.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Product SKU</label>
                                            <p className="text-gray-900 font-mono">{product.sku}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Category</label>
                                            <p className="text-gray-900">{product.Category?.name || 'No Category'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Description</label>
                                            <p className="text-gray-700">{product.description || supplierItem?.description || 'No description available'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {supplierItem && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Information</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Supplier</label>
                                            <p className="text-gray-900 font-medium">{supplierItem.Supplier?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Supplier SKU</label>
                                            <p className="text-gray-900 font-mono">{supplierItem.supplier_sku}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {supplierItem && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center">
                                                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600">Selling Price</p>
                                                    <p className="text-lg font-bold text-blue-900">Rs {formatPrice(supplierItem.price)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center">
                                                <Package className="h-5 w-5 text-green-600 mr-2" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-600">Stock Level</p>
                                                    <p className="text-lg font-bold text-green-900">{supplierItem.stock_level}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {supplierItem.discount_price && (
                                            <div className="bg-orange-50 p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <DollarSign className="h-5 w-5 text-orange-600 mr-2" />
                                                    <div>
                                                        <p className="text-sm font-medium text-orange-600">Discount Price</p>
                                                        <p className="text-lg font-bold text-orange-900">Rs {formatPrice(supplierItem.discount_price)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="flex items-center">
                                                <Truck className="h-5 w-5 text-purple-600 mr-2" />
                                                <div>
                                                    <p className="text-sm font-medium text-purple-600">Lead Time</p>
                                                    <p className="text-lg font-bold text-purple-900">{supplierItem.lead_time_days} days</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {supplierItem && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Quantity per Unit</label>
                                            <p className="text-gray-900">{supplierItem.quantity_per_unit} {supplierItem.unit_symbol}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Purchase Price</label>
                                            <p className="text-gray-900">Rs {formatPrice(supplierItem.purchase_price)}</p>
                                        </div>
                                        {supplierItem.expiry_days && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-500">Expiry Period</label>
                                                <p className="text-gray-900">{supplierItem.expiry_days} days</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Created</label>
                                        <p className="text-gray-900">{formatDate(product.created_at)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                        <p className="text-gray-900">{formatDate(product.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {canEditDelete && (
                        <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            {!isConfirmingDelete ? (
                                <>
                                    <button
                                        onClick={handleEdit}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit Product
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmingDelete(true)}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsConfirmingDelete(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Confirm Delete
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModel;  