// src/components/ProductCard.jsx
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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onAddToCart(product);
      setIsLoading(false);
    }, 300);
  };

  const handleCardClick = () => {
    // Navigate to product details page
    console.log('Navigate to product:', product.id);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : i < rating
            ? 'fill-yellow-200 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Discount Badge
        {product.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold shadow-lg">
            -{product.discount}%
          </div>
        )} */}
        
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

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Quick View
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Rating
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {renderStars(product.rating)}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div> */}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600">
              Rs {product.price.toFixed(2)}
            </span>
            {/* {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                Rs {product.originalPrice.toFixed(2)}
              </span>
            )} */}
          </div>
          {/* {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-green-600 font-semibold">
              Save Rs{(product.originalPrice - product.price).toFixed(2)}
            </span>
          )} */}
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          <span className="text-sm text-green-600 font-medium">
            ✓ In Stock
          </span>
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