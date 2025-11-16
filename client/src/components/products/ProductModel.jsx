import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useCheckWishlistItemQuery
} from '../../slices/wishlistApiSlice';

const ProductModal = ({ product, supplierItem, onClose, handleAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Wishlist mutations
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  // Check if product is in wishlist
  const shouldFetchWishlist = userInfo?.user_role === 'Customer';
  const { data: wishlistCheck, refetch: refetchWishlistCheck } = useCheckWishlistItemQuery(
    product.id,
    { skip: !shouldFetchWishlist }
  );

  useEffect(() => {
    if (wishlistCheck && wishlistCheck.data) {
      const hasWishlistItems = wishlistCheck.data.items && wishlistCheck.data.items.length > 0;
      setIsWishlisted(hasWishlistItems);

      if (hasWishlistItems && supplierItem) {
        const currentItem = wishlistCheck.data.items.find(
          item => item.supplier_item_id === supplierItem.id
        );
        if (currentItem) {
          setWishlistItemId(currentItem.wishlist_item_id);
        }
      }
    }
  }, [wishlistCheck, supplierItem]);

  if (!product) return null;

  // Get all available images
  const getImages = () => {
    const images = [];

    // Add main image
    const mainImage = supplierItem?.image_url || product.image_url || product.base_image_url;
    if (mainImage) images.push(mainImage);

    // Add additional images if available
    if (product.additional_images) {
      const additionalImages = Array.isArray(product.additional_images)
        ? product.additional_images
        : JSON.parse(product.additional_images);
      images.push(...additionalImages);
    }

    return images.length > 0 ? images : ['/images/product.png'];
  };

  const images = getImages();
  const displayName = product.name || supplierItem?.name || 'Unnamed Product';
  const description = supplierItem?.description || product.description;

  const price = parseFloat(supplierItem?.price || product.price || 0);
  const discountPrice = supplierItem?.discount_price
    ? parseFloat(supplierItem.discount_price)
    : null;
  const hasDiscount = discountPrice && discountPrice < price;

  const discountPercentage = hasDiscount
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const stockLevel = supplierItem?.stock_level || 0;
  const isOutOfStock = stockLevel <= 0;

  const handleWishlist = async () => {
    if (!userInfo) {
      navigate('/auth/login');
      return;
    }

    try {
      if (isWishlisted && wishlistItemId) {
        await removeFromWishlist(wishlistItemId).unwrap();
        setIsWishlisted(false);
        setWishlistItemId(null);
        toast.success('Removed from wishlist');
      } else {
        const result = await addToWishlist({
          product_id: product.id,
          supplier_item_id: supplierItem?.id || null
        }).unwrap();
        setIsWishlisted(true);
        setWishlistItemId(result.data.id);
        toast.success('Added to wishlist');
      }
      await refetchWishlistCheck();
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating wishlist');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayName,
          text: description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleAddToCartWithQuantity = async (e) => {
    e.stopPropagation();
    setIsLoading(true);

    // Call the original handleAddToCart with quantity
    // You might need to modify your handleAddToCart function to accept quantity
    await handleAddToCart(e, quantity);

    setIsLoading(false);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= Math.min(stockLevel, 10)) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white z-10 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 truncate pr-4">
            {displayName}
          </h2>
          <div className="flex items-center gap-2">
            {/* Action Buttons */}
            {userInfo?.user_role === 'Customer' && (
              <button
                onClick={handleWishlist}
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Share product"
            >
              <Share2 className="h-5 w-5" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="lg:w-1/2 p-6">
              <div className="relative bg-gray-50 rounded-xl overflow-hidden">
                {/* Main Image */}
                <div className="relative aspect-square">
                  <img
                    src={images[selectedImage]}
                    alt={displayName}
                    className="w-full h-full object-contain"
                  />

                  {/* Image Navigation */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {discountPercentage}% OFF
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden ${selectedImage === index
                            ? 'border-blue-500'
                            : 'border-gray-200'
                          }`}
                      >
                        <img
                          src={image}
                          alt={`${displayName} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="lg:w-1/2 p-6 border-l border-gray-100">
              <div className="space-y-6">
                {/* Price Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900">
                      Rs {hasDiscount ? discountPrice.toFixed(2) : price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xl text-gray-500 line-through">
                        Rs {price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {hasDiscount && (
                    <div className="text-green-600 font-semibold">
                      You save Rs {(price - discountPrice).toFixed(2)} ({discountPercentage}%)
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${isOutOfStock
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'
                    }`}></div>
                  {isOutOfStock ? 'Out of Stock' : `In Stock (${stockLevel} available)`}
                </div>

                {/* Quantity Selector */}
                {!isOutOfStock && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-lg font-medium min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= Math.min(stockLevel, 10)}
                          className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        Max: {Math.min(stockLevel, 10)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Description */}
                {description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>

                  {/* Unit Information */}
                  {supplierItem?.quantity_per_unit && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Unit Size</span>
                      <span className="font-medium">
                        {supplierItem.quantity_per_unit} {supplierItem.unit_symbol}
                      </span>
                    </div>
                  )}

                  {/* Supplier */}
                  {supplierItem?.Supplier?.name && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Sold By</span>
                      <span className="font-medium text-blue-600">
                        {supplierItem.Supplier.name}
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  {product.Category?.name && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{product.Category.name}</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="h-5 w-5 text-green-500" />
                    <span>Free shipping over Rs 2000</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <span>Easy returns</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Quality guaranteed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-100 bg-gray-50 p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Need help?</span> Contact our support team
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Continue Shopping
              </button>

              {(!userInfo || userInfo?.user_role === 'Customer') && (
                <button
                  onClick={handleAddToCartWithQuantity}
                  disabled={isLoading || isOutOfStock}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${isLoading || isOutOfStock
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart {quantity > 1 && `(${quantity})`}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;