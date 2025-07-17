import React, { useState } from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    console.log(`${isWishlisted ? 'Removed from' : 'Added to'} wishlist:`, product.name);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsLoading(true);
    setTimeout(() => {
      onAddToCart(product);
      setIsLoading(false);
    }, 300);
  };

  const handleCardClick = () => {
    console.log('Navigate to product:', product.id);
  };

  const renderPrice = () => {
    const price = parseFloat(product.price);
    const discountPrice = parseFloat(product.discount_price);
    const hasDiscount = discountPrice < price;

    return (
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">
            Rs {hasDiscount ? discountPrice.toFixed(2) : price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
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
    );
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image_url || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Quantity */}
        <p className="text-sm text-gray-500 mb-1">
          Quantity: {product.quantity_per_unit} {product.unit_symbol}
        </p>

        {/* Price */}
        {renderPrice()}

        {/* Stock */}
        <div className="mb-4">
          <span className="text-sm text-green-600 font-medium">✓ In Stock</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading}
          className={`w-full font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
          } text-white`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
