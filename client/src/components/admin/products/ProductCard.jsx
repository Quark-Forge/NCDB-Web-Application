import {Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";                  
import ProductDetailModel from './ProductsDetailModel';
const allowedRoles=['Admin','Inventory Manager'];

const ProductCard = ({ filteredProducts = [], handleEdit, handleDelete }) => {
     const { userInfo } = useSelector((state) => state.auth);
    const [selectedProduct,setSelectedProduct]=useState(null);
    const [isDetailModelOpen,setIsDetailModelOpen]=useState(false);
    const handleViewDetails=(product)=>{
        setSelectedProduct(product);
        setIsDetailModelOpen(true);
    }

    const closeModel= () =>{
         setSelectedProduct(null);
        setIsDetailModelOpen(false);
    }
     const canEditDelete = allowedRoles.includes(userInfo?.user_role);
    const formatPrice = (price) => {
        if (price === null || price === undefined) return '0.00';
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return isNaN(num) ? '0.00' : num.toFixed(2);
    };

    const getTotalStock = (product) => {
        if (product.stock_level !== undefined) return product.stock_level;
        if (product.SupplierItems?.length) {
            return product.SupplierItems.reduce((sum, item) => sum + (item.stock_level || 0), 0);
        }
        return 0;
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
            {/* Mobile Cards View */}
            <div className="md:hidden space-y-3 p-3">
                {filteredProducts.map((product) => {
                    const totalStock = getTotalStock(product);
                    return (
                        <div
                            key={`${product.id}-${product.supplier_id}`}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
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
                                        <h3 className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-gray-500">
                                            Rs{formatPrice(product.price)}
                                            {product.discount_price && (
                                                <span className="ml-1 text-gray-400 line-through">
                                                    Rs{formatPrice(product.discount_price)}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Supplier: {product.supplier_name || product.Supplier?.name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {totalStock}
                                </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full truncate">
                                    {product.Category?.name || 'No Category'}
                                </span>
                                <div className="flex space-x-2">
                                    <button>
                                        <Eye size={18} /> 
                                    </button>
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                        aria-label="Edit product"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete({ supplier_id: product.supplier_id, product_id: product.id })}
                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                        aria-label="Delete product"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
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
                        {filteredProducts.map((product) => {
                            const totalStock = getTotalStock(product);
                            return (
                                <tr key={`${product.id}-${product.supplier_id}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
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
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            Rs{formatPrice(product.price)}
                                        </div>
                                        {product.discount_price && (
                                            <div className="text-xs text-gray-500 line-through">
                                                Rs{formatPrice(product.discount_price)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize truncate max-w-[120px] inline-block">
                                            {product.Category?.name || 'No Category'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900 truncate max-w-[120px] inline-block">
                                            {product.supplier_name || product.Supplier?.name || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {totalStock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => handleViewDetails(product)}
                                                className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors"
                                                aria-label="View product"
                                            >
                                                <Eye size={18} /> 
                                            </button>
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                                                aria-label="Edit product"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete({ supplier_id: product.supplier_id, product_id: product.id })}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                                                aria-label="Delete product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

           { isDetailModelOpen && selectedProduct &&(
                <ProductDetailModel
                   product={selectedProduct}
                   onClose={closeModel}
                   onEdit={handleEdit}
                   onDelete={handleDelete}
                   canEditDelete={canEditDelete}
                />
           )

           }
        </div>
    );
};

export default ProductCard;
