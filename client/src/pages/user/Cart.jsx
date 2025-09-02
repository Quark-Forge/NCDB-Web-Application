// src/screens/Cart.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Plus, Minus, Trash2, Shield } from 'lucide-react';
import {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from '../../slices/cartApiSlice';

const Cart = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetCartQuery();
  const [addToCart] = useAddToCartMutation();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeFromCart] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  const [cartItems, setCartItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load from API
  useEffect(() => {
    if (data?.data?.CartItems) {
      setCartItems(data.data.CartItems);
    }
  }, [data]);

  // Update selectAll state when cartItems or selectedItems change
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectAll(selectedItems.length === cartItems.length);
    }
  }, [selectedItems, cartItems]);

  // Update quantity using backend updateCartItem
  const updateQuantity = async (cartItemId, newQuantity) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item || newQuantity < 1) return;

    setIsUpdating(true);
    try {
      await updateCartItem({
        product_id: item.product_id,
        supplier_id: item.supplier_id,
        quantity: newQuantity,
      }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Error updating quantity:', error);
      // You might want to show an error toast here
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove item from cart using backend removeFromCart
  const removeItem = async (cartItemId) => {
    const item = cartItems.find(i => i.id === cartItemId);
    if (!item) return;

    setIsUpdating(true);
    try {
      await removeFromCart({
        product_id: item.product_id,
        supplier_id: item.supplier_id,
      }).unwrap();
      
      // Remove item from selected items if it was selected
      setSelectedItems(prev => prev.filter(id => id !== cartItemId));
      
      await refetch();
    } catch (error) {
      console.error('Error removing item:', error);
      // You might want to show an error toast here
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setIsUpdating(true);
      try {
        await clearCart().unwrap();
        setSelectedItems([]);
        await refetch();
      } catch (error) {
        console.error('Error clearing cart:', error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        return total + price * (item.quantity || 1);
      }, 0);
  };

  const calculateSubtotal = (item) => {
    const price = parseFloat(item.price || 0);
    return price * (item.quantity || 1);
  };

  const freeShippingThreshold = 3348.40;
  const currentTotal = calculateTotal();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <ShoppingCart className="w-16 h-16 mx-auto mb-2" />
            <p>Failed to load cart</p>
          </div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cart Items */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Cart ({cartItems.length})</h1>
            <div className="flex items-center space-x-4">
              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  disabled={isUpdating}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Clear All
                </button>
              )}
              <ShoppingCart className="w-6 h-6 text-gray-500" />
            </div>
          </div>

          {cartItems.length > 0 && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                disabled={isUpdating}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Select all ({cartItems.length} items)
              </label>
            </div>
          )}

          {/* {remainingForFreeShipping > 0 && cartItems.length > 0 && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
              <p className="text-green-800">
                Add <span className="font-semibold">LKR {remainingForFreeShipping.toFixed(2)}</span> more for free shipping!
              </p>
            </div>
          )} */}

          {currentTotal >= freeShippingThreshold && cartItems.length > 0 && (
            <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded">
              <p className="text-green-800 font-medium">
                🎉 Congratulations! You qualify for free shipping!
              </p>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">Your cart is empty</h3>
              <p className="text-gray-400 mt-2">Add some products to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map(item => (
                <div key={item.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-4">

                    {/* Select */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      disabled={isUpdating}
                      className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.Product?.base_image_url || 'https://via.placeholder.com/100'}
                        alt={item.Product?.name || 'Product'}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {item.Product?.name || 'Unknown Product'}
                      </h3>
                      {item.Product?.description && (
                        <p className="text-xs text-gray-500 mb-1 line-clamp-2">
                          {item.Product.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mb-2">
                        Supplier: {item.Supplier?.name || 'Unknown Supplier'}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-gray-900">
                            LKR {parseFloat(item.price || 0).toFixed(2)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-xs text-gray-500">
                              Subtotal: LKR {calculateSubtotal(item).toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="min-w-[2rem] text-center font-medium">
                            {item.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            disabled={isUpdating}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={isUpdating}
                            className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit lg:sticky lg:top-6">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span>Items ({selectedItems.length})</span>
              <span>LKR {currentTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className={currentTotal >= freeShippingThreshold ? 'text-green-600 font-medium' : ''}>
                {currentTotal >= freeShippingThreshold ? 'FREE' : 'Calculated at checkout'}
              </span>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>LKR {currentTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
          onClick={() => navigate('/user/checkout')}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              selectedItems.length > 0 && !isUpdating
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={selectedItems.length === 0 || isUpdating}
          >
            {isUpdating ? 'Updating...' : `Checkout (${selectedItems.length})`}
          </button>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium mb-3">Buyer Protection</h3>
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Get a full refund if the item is not as described or not delivered.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;