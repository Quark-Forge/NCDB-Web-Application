import { useState, useEffect } from 'react';
import { Heart, ShoppingCartIcon, ImageOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAddToCartMutation } from '../../slices/cartApiSlice';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useCheckWishlistItemQuery
} from '../../slices/wishlistApiSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product, supplierItem, viewMode = 'grid' }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();

  // Improved image URL handling
  const getImageUrl = () => {
    const url = supplierItem?.image_url || product?.base_image_url;
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return url;
  };

  // Set image URL on component mount and when props change
  useEffect(() => {
    const imageUrl = getImageUrl();
    setCurrentImageUrl(imageUrl);
    setImageLoading(true);
    setImageError(false);

    if (imageUrl && imageUrl.startsWith('http')) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageLoading(false);
        setImageError(false);
      };
      img.onerror = () => {
        setImageLoading(false);
        setImageError(true);
        setCurrentImageUrl(null);
      };
    } else {
      setImageLoading(false);
      setCurrentImageUrl(null);
    }
  }, [product, supplierItem]);

  // Check if this product is already in the wishlist
  const shouldFetchWishlist = userInfo?.user_role === 'Customer';
  const { data: wishlistCheck, refetch: refetchWishlistCheck, isError } = useCheckWishlistItemQuery(
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

  const handleCardClick = () => {
    navigate(`/product/${supplierItem.id}`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!userInfo) {
      navigate('/auth/login');
      return;
    }
    try {
      setIsLoading(true);
      if (isWishlisted && wishlistItemId) {
        await removeFromWishlist(wishlistItemId).unwrap();
        setIsWishlisted(false);
        setWishlistItemId(null);
      } else {
        const result = await addToWishlist({
          product_id: product.id,
          supplier_item_id: supplierItem?.id || null
        }).unwrap();
        setIsWishlisted(true);
        setWishlistItemId(result.data.id);
      }
      await refetchWishlistCheck();
    } catch (err) {
      toast.error(err?.data?.message || 'Error updating wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!userInfo) {
      navigate('/auth/login');
      return;
    }
    try {
      await addToCart({
        product_id: product.id,
        supplier_id: supplierItem?.supplier_id,
        quantity: '1',
        product_data: {
          ...product,
          supplierItem,
          price: supplierItem?.price || product.price,
          image_url: currentImageUrl,
          supplier_name: supplierItem?.Supplier?.name
        }
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || 'Error adding to cart');
    }
  };

  const renderPrice = () => {
    if (!supplierItem) return null;
    const price = parseFloat(supplierItem.price || 0);
    const discountPrice = supplierItem.discount_price ? parseFloat(supplierItem.discount_price) : null;
    const hasDiscount = discountPrice && discountPrice < price;

    return (
      <div className={`${viewMode === 'list' ? 'flex flex-col' : 'flex flex-col'} gap-2 mb-2`}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">
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
        <span className="text-xs text-gray-500">
          Sold by: {supplierItem.Supplier?.name || 'Unknown supplier'}
        </span>
      </div>
    );
  };

  // Grid View Layout
  if (viewMode === 'grid') {
    return (
      <div
        onClick={handleCardClick}
        className="bg-white rounded-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
      >
        {/* Product Image */}
        <div className="relative flex justify-center overflow-hidden bg-gray-100 h-48">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {imageError || !currentImageUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ImageOff className="h-12 w-12 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          ) : (
            <img
              src={currentImageUrl}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              loading="lazy"
            />
          )}

          {/* Wishlist Button */}
          {userInfo?.user_role === 'Customer' && (
            <button
              onClick={handleWishlist}
              disabled={isLoading}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-110"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              ) : (
                <Heart
                  className={`h-4 w-4 transition-colors ${isWishlisted
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-400 hover:text-red-400'
                    }`}
                />
              )}
            </button>
          )}
        </div>

        {/* Product Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {renderPrice()}

          <div className="flex items-center justify-between mt-4">
            <div className="mb-2">
              {supplierItem && supplierItem.stock_level <= 0 ? (
                <span className="text-sm text-red-500 font-medium">Out of Stock</span>
              ) : (
                <span className="text-sm text-green-600 font-medium">
                  In Stock <span className='text-[12px]'>({supplierItem?.stock_level})</span>
                </span>
              )}
            </div>

            {(!userInfo || userInfo?.user_role === 'Customer') && (
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (supplierItem && supplierItem.stock_level <= 0)}
                className={`font-semibold w-11 h-11 rounded-3xl transition-all duration-200 flex items-center justify-center ${isAdding || (supplierItem && supplierItem.stock_level <= 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-400 hover:shadow-lg transform hover:scale-105'
                  } text-white`}
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ShoppingCartIcon className='p-1' />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View Layout
  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-lg hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100"
    >
      <div className="flex">
        {/* Product Image */}
        <div className="relative flex-shrink-0 w-32 h-32 bg-gray-100">
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {imageError || !currentImageUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ImageOff className="h-8 w-8 mb-1" />
              <span className="text-xs">No Image</span>
            </div>
          ) : (
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition-colors">
                {product.name}
              </h3>

              {renderPrice()}

              <div className="mt-2">
                {supplierItem && supplierItem.stock_level <= 0 ? (
                  <span className="text-sm text-red-500 font-medium">Out of Stock</span>
                ) : (
                  <span className="text-sm text-green-600 font-medium">
                    In Stock ({supplierItem?.stock_level})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              {/* Wishlist Button */}
              {userInfo?.user_role === 'Customer' && (
                <button
                  onClick={handleWishlist}
                  disabled={isLoading}
                  className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                  ) : (
                    <Heart
                      className={`h-4 w-4 transition-colors ${isWishlisted
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 hover:text-red-400'
                        }`}
                    />
                  )}
                </button>
              )}

              {/* Add to Cart Button */}
              {(!userInfo || userInfo?.user_role === 'Customer') && (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || (supplierItem && supplierItem.stock_level <= 0)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 flex items-center gap-2 ${isAdding || (supplierItem && supplierItem.stock_level <= 0)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg'
                    } text-white`}
                >
                  {isAdding ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <ShoppingCartIcon className='h-4 w-4' />
                      Add to Cart
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

export default ProductCard;