import { Eye, Pencil, Trash2, ImageOff } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import ProductDetailModel from './ProductsDetailModel';

const allowedRoles = ['Admin', 'Inventory Manager'];

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

    const getImageUrl = (product, supplierItem) => {
        // Priority: supplierItem image > product base_image_url
        return supplierItem && supplierItem.image_url
            ? supplierItem.image_url
            : product && product.base_image_url
                ? product.base_image_url
                : null;
    };

    const isCloudinaryImage = (url) => {
        return url && url.includes('cloudinary.com');
    };

    const getOptimizedImageUrl = (url, width = 100, height = 100) => {
        if (!isCloudinaryImage(url)) return url;

        // Cloudinary URL transformation for optimized loading
        if (url.includes('/upload/')) {
            return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`);
        }
        return url;
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';

        // Fixed: Remove optional chaining assignment
        const nextSibling = e.target.nextSibling;
        if (nextSibling && nextSibling.style) {
            nextSibling.style.display = 'flex';
        }
    };

    const handleViewDetails = (product, supplierItem) => {
        setSelectedProduct({
            ...product,
            currentSupplierItem: supplierItem,
            displayImage: getImageUrl(product, supplierItem)
        });
        setIsDetailModelOpen(true);
    };

    const closeModal = () => {
        setIsDetailModelOpen(false);
        setSelectedProduct(null);
    };

    const canEditDelete = allowedRoles.includes(userInfo && userInfo.user_role);

    const ImageWithFallback = ({ product, supplierItem, className = "", isActive = true }) => {
        const imageUrl = getImageUrl(product, supplierItem);
        const optimizedUrl = getOptimizedImageUrl(imageUrl);

        return (
            <div className={`flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100 relative ${className}`}>
                {optimizedUrl ? (
                    <>
                        <img
                            src={optimizedUrl}
                            alt={product.name}
                            className={`h-full w-full object-cover transition-opacity ${!isActive ? 'opacity-50' : ''}`}
                            onError={handleImageError}
                            loading="lazy"
                        />
                        <div className="hidden absolute inset-0 items-center justify-center bg-gray-100">
                            <ImageOff className="h-5 w-5 text-gray-400" />
                        </div>
                    </>
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <ImageOff className="h-5 w-5" />
                    </div>
                )}
            </div>
        );
    };

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
                    product.SupplierItems && product.SupplierItems.map(supplierItem => (
                        <div
                            key={`${product.id}-${supplierItem.id}`}
                            className={`border rounded-lg p-4 transition-colors ${product.is_active
                                ? 'border-gray-200 hover:bg-gray-50'
                                : 'border-gray-100 bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <ImageWithFallback
                                        product={product}
                                        supplierItem={supplierItem}
                                        isActive={product.is_active}
                                    />
                                    <div className="min-w-0 flex-1">
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
                                                <span className="ml-1 line-through text-gray-400">
                                                    Rs{formatPrice(supplierItem.price)}
                                                </span>
                                            )}
                                        </p>
                                        <p className={`text-xs mt-1 ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                            }`}>
                                            Supplier: {supplierItem.Supplier && supplierItem.Supplier.name || 'N/A'}
                                        </p>
                                        {isCloudinaryImage(getImageUrl(product, supplierItem)) && (
                                            <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 px-1 rounded">
                                                Cloudinary
                                            </span>
                                        )}
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
                                        {product.Category && product.Category.name || 'No Category'}
                                    </span>
                                    <button
                                        onClick={() => handleToggleStatus(product.id, !product.is_active)}
                                        className={`text-xs px-2 py-1 rounded-full transition-colors ${product.is_active
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
                                    {canEditDelete && (
                                        <>
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
                                                    ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                                    : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                aria-label="Delete product"
                                                disabled={!product.is_active}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
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
                            product.SupplierItems && product.SupplierItems.map(supplierItem => (
                                <tr
                                    key={`${product.id}-${supplierItem.id}`}
                                    className={product.is_active ? 'hover:bg-gray-50' : 'bg-gray-50'}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(product.id, !product.is_active)}
                                            className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${product.is_active
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                        >
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <ImageWithFallback
                                                product={product}
                                                supplierItem={supplierItem}
                                                isActive={product.is_active}
                                            />
                                            <div className="ml-4 min-w-0">
                                                <div className={`text-sm font-medium truncate max-w-[200px] ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                                    }`}>
                                                    {product.name}
                                                </div>
                                                <div className={`text-sm ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                    SKU: {product.sku}
                                                </div>
                                                {isCloudinaryImage(getImageUrl(product, supplierItem)) && (
                                                    <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 px-1 rounded">
                                                        Cloudinary
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`text-sm font-medium ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            Rs{formatPrice(supplierItem.discount_price || supplierItem.price)}
                                        </div>
                                        {supplierItem.discount_price && (
                                            <div className={`text-xs ${product.is_active ? 'text-gray-500' : 'text-gray-400'
                                                } line-through`}>
                                                Rs{formatPrice(supplierItem.price)}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            Cost: Rs{formatPrice(supplierItem.purchase_price)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize truncate max-w-[120px] inline-block ${product.is_active
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {product.Category && product.Category.name || 'No Category'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="max-w-[120px]">
                                            <span className={`text-sm truncate block ${product.is_active ? 'text-gray-900' : 'text-gray-500'
                                                }`}>
                                                {supplierItem.Supplier && supplierItem.Supplier.name || 'N/A'}
                                            </span>
                                            <span className="text-xs text-gray-400 truncate block">
                                                {supplierItem.supplier_sku}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${supplierItem.stock_level > 0
                                                ? product.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-200 text-gray-600'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {supplierItem.stock_level} in stock
                                            </span>
                                            {supplierItem.lead_time_days > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    {supplierItem.lead_time_days} day lead
                                                </span>
                                            )}
                                        </div>
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
                                            {canEditDelete && (
                                                <>
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
                                                </>
                                            )}
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