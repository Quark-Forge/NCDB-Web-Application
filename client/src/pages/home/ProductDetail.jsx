import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Check,
    Truck,
    RotateCcw,
    Shield,
    Plus,
    Minus,
    CircleAlert,
    Image
} from 'lucide-react';
import { useGetSupplierItemByIdQuery } from '../../slices/supplierItemsApiSlice';
import {
    useAddToWishlistMutation,
    useRemoveFromWishlistMutation,
    useCheckWishlistItemQuery
} from '../../slices/wishlistApiSlice';
import { useAddToCartMutation } from '../../slices/cartApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { supplierItemId } = useParams();
    const navigate = useNavigate();
    const { cartCount, setCartCount, cartItems, setCartItems } = useOutletContext();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [wishlistItemId, setWishlistItemId] = useState(null);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // Get auth state from Redux store
    const { userInfo } = useSelector((state) => state.auth);

    // Fetch supplier item data
    const { data: supplierItemData, isLoading, error } = useGetSupplierItemByIdQuery(supplierItemId);
    const supplierItem = supplierItemData?.data || {};

    // Cart mutation
    const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

    // Wishlist mutations and queries - only enable if user is logged in
    const [addToWishlist] = useAddToWishlistMutation();
    const [removeFromWishlist] = useRemoveFromWishlistMutation();

    // Check if item is in wishlist - only if user is logged in and has customer role
    const shouldFetchWishlist = userInfo?.user_role === 'Customer';
    const { data: wishlistCheckData, refetch: refetchWishlistCheck } = useCheckWishlistItemQuery(
        supplierItem.product_id,
        { skip: !supplierItem.product_id || !shouldFetchWishlist }
    );

    // Extract product and supplier information
    const product = {
        id: supplierItem.product_id,
        name: supplierItem.Product?.name,
        description: supplierItem.description || supplierItem.Product?.description,
        image_url: supplierItem.image_url || supplierItem.Product?.base_image_url,
        specifications: supplierItem.Product?.specifications,
    };

    const selectedSupplier = {
        id: supplierItem.supplier_id,
        name: supplierItem.Supplier?.name,
        price: parseFloat(supplierItem.price) || 0,
        discount_price: supplierItem.discount_price ? parseFloat(supplierItem.discount_price) : null,
        stock_level: supplierItem.stock_level,
        image_url: supplierItem.image_url,
    };

    // Update wishlist status when check data changes - FIXED LOGIC
    useEffect(() => {
        if (wishlistCheckData && wishlistCheckData.data) {
            const hasWishlistItems = wishlistCheckData.data.items && wishlistCheckData.data.items.length > 0;
            setIsInWishlist(hasWishlistItems);

            // Find if the current supplier item is in the wishlist
            if (hasWishlistItems && supplierItem) {
                const currentItem = wishlistCheckData.data.items.find(
                    item => item.supplier_item_id === supplierItem.id
                );

                if (currentItem) {
                    setWishlistItemId(currentItem.wishlist_item_id);
                }
            }
        }
    }, [wishlistCheckData, supplierItem]);

    // Helper function to format price safely
    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toFixed(2);
        }
        if (typeof price === 'string') {
            const parsed = parseFloat(price);
            return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
        }
        return '0.00';
    };

    // Check if user is authenticated, if not redirect to login
    const requireAuth = (action) => {
        if (!userInfo) {
            navigate('/auth/login', {
                state: {
                    from: window.location.pathname,
                    message: `Please login to ${action}`
                }
            });
            return false;
        }
        return true;
    };

    const handleAddToCart = async () => {
        if (!supplierItem) return;

        // Check if user is logged in
        if (!requireAuth('add items to cart')) {
            return;
        }

        try {
            await addToCart({
                product_id: product.id,
                supplier_id: selectedSupplier.id,
                quantity: quantity.toString(),
                product_data: {
                    ...product,
                    supplierItem: selectedSupplier,
                    price: selectedSupplier.price,
                    discount_price: selectedSupplier.discount_price,
                    image_url: selectedSupplier.image_url || product.image_url,
                    supplier_name: selectedSupplier.name
                }
            }).unwrap();

            toast.success('Product added to cart successfully!');

            // Update local cart state if needed
            const itemToAdd = {
                ...product,
                supplier: selectedSupplier,
                quantity,
                cartId: supplierItem.id
            };

            const existingItemIndex = cartItems.findIndex(
                item => item.cartId === itemToAdd.cartId
            );

            if (existingItemIndex >= 0) {
                const updatedCartItems = [...cartItems];
                updatedCartItems[existingItemIndex].quantity += quantity;
                setCartItems(updatedCartItems);
            } else {
                setCartItems(prev => [...prev, itemToAdd]);
            }

            setCartCount(prev => prev + quantity);

        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error(error?.data?.message || 'Error adding product to cart');
        }
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (supplierItem?.stock_level || 10)) {
            setQuantity(newQuantity);
        }
    };

    const handleWishlistToggle = async () => {
        // Check if user is logged in and has customer role
        if (!userInfo) {
            requireAuth('add items to wishlist');
            return;
        }

        if (userInfo.user_role !== 'Customer') {
            toast.error('Only customers can add items to wishlist');
            return;
        }

        try {
            setIsWishlistLoading(true);

            if (isInWishlist && wishlistItemId) {
                // Remove from wishlist
                await removeFromWishlist(wishlistItemId).unwrap();
                setIsInWishlist(false);
                setWishlistItemId(null);
                toast.success('Removed from wishlist');
            } else {
                // Add to wishlist
                const result = await addToWishlist({
                    product_id: product.id,
                    supplier_item_id: supplierItem.id
                }).unwrap();

                setIsInWishlist(true);
                setWishlistItemId(result.data?.id || result.id);
                toast.success('Added to wishlist');
            }

            // Refetch the wishlist check to ensure state is up to date
            await refetchWishlistCheck();
        } catch (error) {
            console.error('Error updating wishlist:', error);
            toast.error(error?.data?.message || 'Error updating wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Product link copied to clipboard!');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    // Check if image exists
    const hasImage = selectedSupplier?.image_url || product.image_url || product.base_image_url;

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-6 w-1/4 bg-gray-200 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="bg-gray-200 h-96 rounded-lg"></div>
                            <div className="flex gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="bg-gray-200 h-20 w-20 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                            <div className="h-12 bg-gray-200 rounded w-full"></div>
                            <div className="h-12 bg-gray-200 rounded w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !supplierItem.id) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <CircleAlert className="h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or may have been removed.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const hasDiscount = selectedSupplier.discount_price && selectedSupplier.discount_price < selectedSupplier.price;
    const displayPrice = hasDiscount ? selectedSupplier.discount_price : selectedSupplier.price;
    const savings = hasDiscount ? selectedSupplier.price - selectedSupplier.discount_price : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                    <li>
                        <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
                    </li>
                    <li>
                        <span className="text-gray-300">/</span>
                    </li>
                    <li>
                        <Link to="/" className="text-gray-500 hover:text-gray-700">Products</Link>
                    </li>
                    <li>
                        <span className="text-gray-300">/</span>
                    </li>
                    <li className="truncate">
                        <span className="text-gray-700 font-medium">{product.name}</span>
                    </li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Images */}
                <div>
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                        {hasImage ? (
                            <img
                                src={selectedSupplier?.image_url || product.image_url || product.base_image_url}
                                alt={product.name}
                                className="w-full h-96 object-contain rounded-lg"
                            />
                        ) : (
                            <div className="w-full h-96 flex flex-col items-center justify-center text-gray-400 rounded-lg border-2 border-dashed border-gray-300">
                                <Image className="h-16 w-16 mb-4" />
                                <p className="text-lg font-medium">No Image Available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                    {selectedSupplier && (
                        <>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    {hasDiscount && (
                                        <span className="text-xl text-gray-500 line-through">
                                            Rs {formatPrice(selectedSupplier.price)}
                                        </span>
                                    )}
                                    <span className="text-3xl font-bold text-gray-900">
                                        Rs {formatPrice(displayPrice)}
                                    </span>
                                </div>
                                {hasDiscount && (
                                    <div className="mt-1">
                                        <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                                            Save Rs {formatPrice(savings)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700">{product.description || 'No description available.'}</p>
                            </div>

                            {/* Supplier Information */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Sold By</h3>
                                <div className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-medium">{selectedSupplier.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">Delivery: 3-5 business days</p>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Quantity</h3>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="mx-4 text-lg font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={quantity >= (selectedSupplier.stock_level || 10)}
                                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <span className="ml-4 text-sm text-gray-600">
                                        {selectedSupplier.stock_level || 10} available
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={selectedSupplier.stock_level <= 0 || isAddingToCart}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isAddingToCart ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <ShoppingCart className="h-5 w-5" />
                                            {selectedSupplier.stock_level <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </>
                                    )}
                                </button>

                                {/* Wishlist Button - Fixed heart color */}
                                <button
                                    onClick={handleWishlistToggle}
                                    disabled={isWishlistLoading || userInfo?.user_role !== 'Customer'}
                                    className={`p-3 border rounded-lg transition-colors ${isInWishlist
                                        ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isWishlistLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                                    ) : (
                                        <Heart
                                            className={`h-5 w-5 ${isInWishlist
                                                ? 'fill-red-500 text-red-500'
                                                : 'text-gray-700'
                                                }`}
                                        />
                                    )}
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Login Reminder for Guest Users */}
                            {!userInfo && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800 text-sm">
                                        <strong>Please login</strong> to add items to your cart or wishlist.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Product Details */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            {supplierItem.quantity_per_unit && (
                                <div className="flex">
                                    <span className="font-medium w-1/3">Quantity:</span>
                                    <span className="w-2/3">{supplierItem.quantity_per_unit} {supplierItem.unit_symbol}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;