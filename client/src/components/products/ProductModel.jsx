// src/components/products/ProductModal.jsx
import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProductModal = ({ product, supplierItem, onClose, handleAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!product) return null;

  const displayImage =
    supplierItem?.image_url ||
    product.image_url ||
    product.base_image_url ||
    '/images/product.png';

  const displayName = product.name || supplierItem?.name || 'Unnamed Product';
  const description = supplierItem?.description || product.description;

  const price = parseFloat(supplierItem?.price || product.price || 0);
  const discountPrice = supplierItem?.discount_price
    ? parseFloat(supplierItem.discount_price)
    : null;
  const hasDiscount = discountPrice && discountPrice < price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white z-10 w-full max-w-6xl p-8 rounded-lg shadow-lg overflow-y-auto max-h-[100vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Product Image */}
          <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100 rounded-lg">
            <img
              src={displayImage}
              alt={displayName}
              className="w-full h-full max-h-[400px] object-contain rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{displayName}</h2>

              {/* Description */}
              {description && (
                <p className="text-gray-600 mb-4">{description}</p>
              )}

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-semibold">Price:</span>
                  <span className="text-blue-600 font-bold text-lg">
                    Rs {hasDiscount ? discountPrice.toFixed(2) : price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-gray-400 line-through">
                      Rs {price.toFixed(2)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <span className="text-sm text-green-600 font-semibold">
                    Save Rs {(price - discountPrice).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Quantity */}
              {supplierItem?.quantity_per_unit && (
                <div className="mb-2">
                  <span className="text-gray-700">Unit: </span>
                  {supplierItem.quantity_per_unit} {supplierItem.unit_symbol}
                </div>
              )}

              {/* Stock */}
              <div className="mb-2">
                <span className="text-green-600 font-medium">✓ In Stock</span>
              </div>

              {/* Supplier */}
              {supplierItem?.Supplier?.name && (
                <div className="mb-2 text-sm text-gray-500">
                  Sold by: {supplierItem.Supplier.name}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(e);
                }}
                disabled={isLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition duration-200 text-white ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 hover:scale-105'
                  }`}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
