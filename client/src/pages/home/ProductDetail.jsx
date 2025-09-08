import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useGetProductByIdQuery } from '../../slices/productsApiSlice';
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
    CircleAlert
} from 'lucide-react';

const ProductDetail = () => {
    const { id, supplierId } = useParams(); // Now gets both product ID and supplier ID
    const navigate = useNavigate();
    const { cartCount, setCartCount, cartItems, setCartItems } = useOutletContext();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    // Fetch product data with specific supplier
    const { data: productData, isLoading, error } = useGetProductByIdQuery({ id, supplierId });
    const product = productData?.data || {};

    const selectedSupplier = product.selected_supplier;
    const allSuppliers = product.all_suppliers || [];

    const handleAddToCart = () => {
        if (!selectedSupplier) return;

        const itemToAdd = {
            ...product,
            supplier: selectedSupplier,
            quantity,
            cartId: `${product.id}-${selectedSupplier.id}`
        };

        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(
            item => item.cartId === itemToAdd.cartId
        );

        if (existingItemIndex >= 0) {
            // Update quantity if item exists
            const updatedCartItems = [...cartItems];
            updatedCartItems[existingItemIndex].quantity += quantity;
            setCartItems(updatedCartItems);
        } else {
            // Add new item to cart
            setCartItems(prev => [...prev, itemToAdd]);
        }

        setCartCount(prev => prev + quantity);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (selectedSupplier?.stock_level || 10)) {
            setQuantity(newQuantity);
        }
    };

    const handleSupplierChange = (newSupplierId) => {
        navigate(`/product/${id}/${newSupplierId}`);
    };

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

    if (error) {
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
                        <img
                            src={selectedSupplier?.image_url || product.image_url || '/api/placeholder/500/500'}
                            alt={product.name}
                            className="w-full h-96 object-contain rounded-lg"
                        />
                    </div>

                    {product.images && product.images.length > 0 && (
                        <div className="flex gap-4 overflow-x-auto py-2">
                            {product.images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-20 h-20 border rounded-lg overflow-hidden ${selectedImage === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                    <div className="flex items-center mb-4">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-5 w-5 ${star <= (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">({product.reviewCount || 24} reviews)</span>
                    </div>

                    {selectedSupplier && (
                        <>
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    {selectedSupplier.discount_price && selectedSupplier.discount_price < selectedSupplier.price && (
                                        <span className="text-xl text-gray-500 line-through">Rs {selectedSupplier.price.toFixed(2)}</span>
                                    )}
                                    <span className="text-3xl font-bold text-gray-900">
                                        Rs {selectedSupplier.discount_price && selectedSupplier.discount_price < selectedSupplier.price
                                            ? selectedSupplier.discount_price.toFixed(2)
                                            : selectedSupplier.price.toFixed(2)}
                                    </span>
                                </div>
                                {selectedSupplier.discount_price && selectedSupplier.discount_price < selectedSupplier.price && (
                                    <div className="mt-1">
                                        <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                                            Save Rs {(selectedSupplier.price - selectedSupplier.discount_price).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700">{product.description || 'No description available.'}</p>
                            </div>

                            {/* Supplier Selection */}
                            {allSuppliers.length > 1 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Available From</h3>
                                    <div className="space-y-2">
                                        {allSuppliers.map(supplier => (
                                            <div
                                                key={supplier.id}
                                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedSupplier.id === supplier.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                onClick={() => handleSupplierChange(supplier.id)}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-medium">{supplier.supplier_name}</h4>
                                                        <p className="text-sm text-gray-600">Delivery: {supplier.delivery_time}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium">Rs {supplier.price.toFixed(2)}</p>
                                                        <p className="text-sm text-gray-600">Stock: {supplier.stock_level}</p>
                                                    </div>
                                                </div>
                                                {selectedSupplier.id === supplier.id && (
                                                    <div className="flex items-center mt-2 text-sm text-green-600">
                                                        <Check className="h-4 w-4 mr-1" />
                                                        <span>Selected</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
                                    disabled={selectedSupplier.stock_level <= 0}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    {selectedSupplier.stock_level <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button className="p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Heart className="h-5 w-5" />
                                </button>
                                <button className="p-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                </button>
                            </div>
                        </>
                    )}

                    {/* Product Details */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                                <div key={key} className="flex">
                                    <span className="font-medium w-1/3">{key}:</span>
                                    <span className="w-2/3">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features & Benefits */}
            <div className="mt-12 border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Features & Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start">
                        <Truck className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1">Free Shipping</h3>
                            <p className="text-gray-600">Free delivery on orders over Rs 1000</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <RotateCcw className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1">30-Day Returns</h3>
                            <p className="text-gray-600">Money-back guarantee</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <Shield className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                        <div>
                            <h3 className="font-medium text-gray-900 mb-1">2-Year Warranty</h3>
                            <p className="text-gray-600">Coverage for any manufacturer defects</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;