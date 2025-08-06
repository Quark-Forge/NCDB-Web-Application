// src/components/ProductModal.jsx
import React, { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!product) return null;

  const handleAddToCart = () => {
    if (!userInfo) {
      navigate('/auth/login');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onAddToCart(product);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white z-10 w-full max-w-6xl p-10 rounded-lg shadow-lg overflow-y-auto max-h-[100vh]">
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
    src={product.image_url || '../../images/product.png'}
    alt={product.name}
    className="w-full h-full max-h-[400px] object-contain rounded-lg"
  />
</div>


          {/* Product Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}

              {/* Price */}
              <div className="mb-2">
                <span className="text-gray-700 font-semibold">Price: </span>
                <span className="text-blue-600 font-bold text-lg">
                  Rs {product.discount_price || product.price}
                </span>
                {product.discount_price && (
                  <span className="ml-2 text-gray-400 line-through">
                    Rs {product.price}
                  </span>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-2">
                <span className="text-gray-700">Unit: </span>
                {product.quantity_per_unit} {product.unit_symbol}
              </div>

              {/* Stock */}
              <div className="mb-2">
                <span className="text-green-600 font-medium">✓ In Stock</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold transition duration-200 text-white ${
                  isLoading
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
