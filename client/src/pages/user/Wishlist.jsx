import { useState } from 'react';
import { useAddToCartMutation } from '../../slices/cartApiSlice';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    useClearWishlistMutation,
    useGetWishlistQuery,
    useRemoveFromWishlistMutation,
    useUpdateWishlistItemMutation
} from '../../slices/wishlistApiSlice';
import {
    Heart,
    Trash2,
    ShoppingCart,
    ChevronLeft,
    AlertCircle,
    Loader,
    X,
    Check
} from 'lucide-react';



const Wishlist = () => {

    const { userInfo } = useSelector((state) => state.auth);
    const isCustomer = userInfo?.user_role === 'Customer';
    const { data: wishlistResponse, isLoading, error, refetch } = useGetWishlistQuery(undefined, {
        skip: !isCustomer,
    });
    const [removeFromWishlist] = useRemoveFromWishlistMutation();
    const [clearWishlist] = useClearWishlistMutation();
    const [updateWishlistItem] = useUpdateWishlistItemMutation();
    const [addToCart] = useAddToCartMutation();


    const navigate = useNavigate();
    const [selectedSupplier, setSelectedSupplier] = useState({});
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    // Extract wishlist data from response
    const wishlist = wishlistResponse?.data;
    const wishlistItems = wishlist?.items || [];
    const wishlistCount = wishlist?.count || 0;

    const handleRemoveItem = async (itemId) => {
        try {
            await removeFromWishlist(itemId).unwrap();
            toast.success('Item removed from wishlist');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to remove item');
        }
    };

    const handleClearWishlist = async () => {
        if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
            try {
                await clearWishlist().unwrap();
                toast.success('Wishlist cleared successfully');
            } catch (error) {
                toast.error(error?.data?.message || 'Failed to clear wishlist');
            }
        }
    };

    const handleAddToCart = async (item) => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        try {
            await addToCart({
                product_id: item.product.id,
                supplier_item_id: item.supplier_info.supplier_item_id,
                quantity: 1
            }).unwrap();

            toast.success('Item added to cart');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to add item to cart');
        }
    };

    const handleUpdateSupplier = async (itemId, supplierItemId) => {
        try {
            await updateWishlistItem({
                itemId,
                supplier_item_id: supplierItemId
            }).unwrap();

            setShowSupplierModal(false);
            toast.success('Supplier updated successfully');
        } catch (error) {
            toast.error(error?.data?.message || 'Failed to update supplier');
        }
    };

    const openSupplierModal = (item) => {
        setCurrentItem(item);
        setSelectedSupplier(item.supplier_info.supplier_item_id);
        setShowSupplierModal(true);
    };

    // Format price function
    const formatPrice = (price) => {
        return parseFloat(price).toFixed(2);
    };

    if (!userInfo) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
                    <p className="text-gray-600 mb-8">You need to be signed in to view your wishlist.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-center items-center py-12">
                        <Loader className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Wishlist</h2>
                    <p className="text-gray-600 mb-8">{error?.data?.message || 'Failed to load your wishlist'}</p>
                    <button
                        onClick={refetch}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                            <p className="text-gray-600">
                                {wishlistCount} item{wishlistCount !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    {wishlistCount > 0 && (
                        <button
                            onClick={handleClearWishlist}
                            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                        >
                            <Trash2 className="h-5 w-5" />
                            <span>Clear All</span>
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {wishlistCount === 0 && (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-600 mb-6">Start adding items you love!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}

                {/* Wishlist Items */}
                {wishlistCount > 0 && (
                    <div className="grid gap-6">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-6">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.product.base_image_url || '../../images/product.png'}
                                        alt={item.product.name}
                                        className="w-32 h-32 object-cover rounded-lg"

                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                                        {item.product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 capitalize">
                                        {item.product.description}
                                    </p>

                                    {item.product.category && (
                                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-4 capitalize">
                                            {item.product.category.name}
                                        </span>
                                    )}

                                    {/* Stock and Unit Info */}
                                    <div className="mb-4 space-y-2">
                                        <div className="flex items-center space-x-2 text-sm">
                                            <span className="font-medium">Stock:</span>
                                            <span className={item.supplier_info.current_stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                {item.supplier_info.current_stock} available
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm">
                                            <span className="font-medium">Quantity:</span>
                                            <span className="text-gray-600">
                                                {item.supplier_info.quantity_per_unit} {item.supplier_info.unit_symbol}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center space-x-2 mb-4">
                                        <span className="text-2xl font-bold text-gray-900">
                                            Rs. {formatPrice(item.supplier_info.discount_price || item.supplier_info.original_price)}
                                        </span>
                                        {item.supplier_info.discount_price && (
                                            <span className="text-lg text-gray-500 line-through">
                                                Rs. {formatPrice(item.supplier_info.original_price)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Availability */}
                                    <div className="flex items-center space-x-2 mb-4">
                                        {item.supplier_info.is_available ? (
                                            <div className="flex items-center space-x-1 text-green-600">
                                                <Check className="h-4 w-4" />
                                                <span className="text-sm">In Stock</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-1 text-red-600">
                                                <X className="h-4 w-4" />
                                                <span className="text-sm">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col space-y-3">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        disabled={!item.supplier_info.is_available}
                                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        <span>Add to Cart</span>
                                    </button>

                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Continue Shopping Button */}
                {wishlistCount > 0 && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;