import { useState, useEffect } from 'react';
import { Heart, ShoppingCartIcon } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../products/ProductModel';
import { useAddToCartMutation } from '../../slices/cartApiSlice';
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useCheckWishlistItemQuery
} from '../../slices/wishlistApiSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product, supplierItem }) => {
    const { userInfo } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();


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

      // Find if the current supplier item is in the wishlist
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
    setShowModal(true);
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
        // Remove from wishlist
        await removeFromWishlist(wishlistItemId).unwrap();
        setIsWishlisted(false);
        setWishlistItemId(null);
      } else {
        // Add to wishlist
        const result = await addToWishlist({
          product_id: product.id,
          supplier_item_id: supplierItem?.id || null
        }).unwrap();

        setIsWishlisted(true);
        setWishlistItemId(result.data.id);
      }

      // Refetch the wishlist check to ensure state is up to date
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
          image_url: supplierItem?.image_url || product.image_url || product.base_image_url,
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
    const discountPrice = supplierItem.discount_price
      ? parseFloat(supplierItem.discount_price)
      : null;

    const hasDiscount = discountPrice && discountPrice < price;

    return (
      <div className="flex flex-col items-center text-left justify-between gap-2 mb-2">
        <div className="flex flex-row w-full items-center gap-2">
          <span className="w-full text-xl font-bold text-gray-800">
            Rs {hasDiscount ? discountPrice.toFixed(2) : price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="w-full text-sm text-gray-500 line-through">
              Rs {price.toFixed(2)}
            </span>
          )}
        </div>
        {hasDiscount && (
          <span className="w-full text-sm text-green-600 font-semibold">
            Save Rs {(price - discountPrice).toFixed(2)}
          </span>
        )}
        <span className="w-full text-xs text-gray-500">
          Sold by: {supplierItem.Supplier?.name || 'Unknown supplier'}
        </span>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-1"
      >
        {/* Product Image */}
        <div className="relative flex justify-center overflow-hidden">
          <img
            src={supplierItem?.image_url || product.image_url || product.base_image_url || '../../images/product.png'}
            alt={product.name}
            className="w-fit h-40 object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />

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
        <div className="p-4 flex flex-row">
          <div className='flex w-full flex-col'>
            {/* Name */}
            <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
              {product.name}
            </h3>

            {/* Price */}
            {renderPrice()}

            {/* Stock */}
            <div className="mb-4">
              {supplierItem && supplierItem.stock_level <= 0 ? (
                <span className="text-sm text-red-500 font-medium">Out of Stock</span>
              ) : (
                <span className="text-sm text-green-600 font-medium">
                  In Stock <span className='text-[12px]'>({supplierItem?.stock_level})</span>
                </span>
              )}
            </div>
          </div>

          {/* Show Add to Cart only for Customer users */}
          {userInfo?.user_role === 'Customer' && (
            <div className='flex w-1/2 justify-end'>
              <button
                onClick={handleAddToCart}
                disabled={isAdding || (supplierItem && supplierItem.stock_level <= 0)}
                className={`font-semibold w-11 h-11 rounded-3xl transition-all duration-200 flex items-center justify-center space-x-2 ${isAdding || (supplierItem && supplierItem.stock_level <= 0)
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
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={product}
          supplierItem={supplierItem}
          onClose={() => setShowModal(false)}
          handleAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default ProductCard;