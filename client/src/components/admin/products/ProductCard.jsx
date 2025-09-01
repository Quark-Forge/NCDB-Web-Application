import {Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";                  
import ProductDetailModel from './ProductsDetailModel';

const allowedRoles = ['Admin','Inventory Manager'];

const ProductCard = ({
    filteredProducts = [],
    handleEdit,
    handleDelete,
    handleToggleStatus
}) => {
    const [isDetailModelOpen, setIsDetailModelOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { userInfo } = useSelector((state) => state.auth);
    
    const formatPrice = (price) => {
        if (price === null || price === undefined) return '0.00';
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const getTotalStock = (product) => {
        if (!product.SupplierItems || product.SupplierItems.length === 0) return 0;
        return product.SupplierItems.reduce((sum, item) => sum + (item.stock_level || 0), 0);
    };

    const handleViewDetails = (product, supplierItem) => {
        setSelectedProduct({ ...product, currentSupplierItem: supplierItem });
        setIsDetailModelOpen(true);
    };

    const closeModal = () => {
        setIsDetailModelOpen(false);
        setSelectedProduct(null);
    };

    const canEditDelete = allowedRoles.includes(userInfo?.user_role);

    if (filteredProducts.length === 0) {
        return (
            <div className="bg-white p-6 text-center text-gray-500">
                No products found
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="md:hidden space-y-3 p-3">
                {filteredProducts.flatMap(product =>
                    product.SupplierItems?.map(supplierItem => (
                        <div
                            key={`${product.id}-${supplierItem.id}`}
                            className={`border rounded-lg p-4 transition-colors ${product.is_active
                                ? 'border-gray-200 hover:bg-gray-50'
                                : 'border-gray-100 bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                        {supplierItem.image_url || product.image_url ? (
                                            <img
                                                src={supplierItem.image_url || product.image_url}
                                                alt={product.name}
                                                className={`h-full w-full object-cover ${!product.is_active ? 'opacity-50' : ''
                                                    }`}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'placeholder-image-url';
                                                }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className={`text-sm font-medium truncate ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {product.name}
                                            {!product.is_active && (
                                                <span className="ml-1 text-xs text-red-500">(Inactive)</span>
                                            )}
                                        </h3>
                                        <p className={`text-xs ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                            }`}>
                                            Rs{formatPrice(supplierItem.discount_price || supplierItem.price)}
                                            {supplierItem.discount_price && (
                                                <span className="ml-1 line-through">
                                                    Rs{formatPrice(supplierItem.price)}
                                                </span>
                                            )}
                                        </p>
                                        <p className={`text-xs mt-1 ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                            }`}>
                                            Supplier: {supplierItem.Supplier?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${supplierItem.stock_level > 0
                                    ? product.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-200 text-gray-600'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {supplierItem.stock_level}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full truncate ${product.is_active
                                        ? 'bg-gray-100 text-gray-800'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {product.Category?.name || 'No Category'}
                                    </span>
                                    <button
                                        onClick={() => handleToggleStatus(product.id, !product.is_active)}
                                        className={`text-xs px-2 py-1 rounded-full ${product.is_active
                                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                                            }`}
                                    >
                                        {product.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleViewDetails(product, supplierItem)}
                                        className={`p-1 rounded-md transition-colors ${product.is_active
                                            ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            : 'text-gray-400 cursor-not-allowed'
                                        }`}
                                        aria-label="View product details"
                                        disabled={!product.is_active}
                                    >
                                        <Eye size={18} /> 
                                    </button>
                                    <button
                                        onClick={() => handleEdit(product, supplierItem)}
                                        className={`p-1 rounded-md transition-colors ${product.is_active
                                            ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                                            : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                        aria-label="Edit product"
                                        disabled={!product.is_active}
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id, supplierItem.supplier_id)}
                                        className={`p-1 rounded-md transition-colors ${product.is_active
                                            ? 'text-red-600 hover:text-red-900 hover:red-blue-50'
                                            : 'text-gray-400 cursor-not-allowed'
                                            }`}
                                        aria-label="Delete product"
                                        disabled={!product.is_active}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Supplier
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.flatMap(product =>
                            product.SupplierItems?.map(supplierItem => (
                                <tr
                                    key={`${product.id}-${supplierItem.id}`}
                                    className={product.is_active ? 'hover:bg-gray-50' : 'bg-gray-50'}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(product.id, !product.is_active)}
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${product.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                        >
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                                {supplierItem.image_url || product.image_url ? (
                                                    <img
                                                        src={supplierItem.image_url || product.image_url}
                                                        alt={product.name}
                                                        className={`h-full w-full object-cover ${!product.is_active ? 'opacity-50' : ''
                                                            }`}
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'placeholder-image-url';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4 min-w-0">
                                                <div className={`text-sm font-medium truncate ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                    {product.name}
                                                </div>
                                                <div className={`text-sm ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                    SKU: {product.sku}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            Rs{formatPrice(supplierItem.discount_price || supplierItem.price)}
                                        </div>
                                        {supplierItem.discount_price && (
                                            <div className={`text-xs ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                                } line-through`}>
                                                Rs{formatPrice(supplierItem.price)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize truncate max-w-[120px] inline-block ${product.is_active
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {product.Category?.name || 'No Category'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm truncate max-w-[120px] inline-block ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {supplierItem.Supplier?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${supplierItem.stock_level > 0
                                            ? product.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-200 text-gray-600'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {supplierItem.stock_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleViewDetails(product, supplierItem)}
                                                className={`p-1 rounded-md transition-colors ${product.is_active
                                                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                }`}
                                                aria-label="View product details"
                                                disabled={!product.is_active}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product, supplierItem)}
                                                className={`p-1 rounded-md transition-colors ${product.is_active
                                                    ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                aria-label="Edit product"
                                                disabled={!product.is_active}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id, supplierItem.supplier_id)}
                                                className={`p-1 rounded-md transition-colors ${product.is_active
                                                    ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                aria-label="Delete product"
                                                disabled={!product.is_active}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isDetailModelOpen && selectedProduct && (
                <ProductDetailModel
                    product={selectedProduct}
                    onClose={closeModal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    canEditDelete={canEditDelete}
                />
            )}
        </div>
    );
};

export default ProductCard;