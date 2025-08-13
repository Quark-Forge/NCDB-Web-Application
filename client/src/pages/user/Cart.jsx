import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Shield, CreditCard } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState(() => {
    // For demo purposes, using your sample data
    return [
      {
        id: "8022da76-67e5-40f9-8373-613c756eec16",
        name: "Coconut Oil",
        description: "qwt6ifhroriorogre",
        price: "1200.00",
        discount_price: "200.00",
        image_url: "https://tse3.mm.bing.net/th/id/OIP.F56aWBolFRYU4bm18-GJqAHaE8?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3",
        quantity: 1,
        stock_level: 4,
        quantity_per_unit: "3.00",
        unit_symbol: "ltr",
        supplier_name: "test Suplier 2",
        Category: {
          id: "83aec223-d8aa-4a03-b06a-986007b85469",
          name: "oil"
        },
        sku: "234"
      }
    ];
    // Uncomment below to use localStorage
    // const storedCart = localStorage.getItem('cart');
    // return storedCart ? JSON.parse(storedCart) : [];
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const updateQuantity = (id, change) => {
    const updatedItems = cartItems.map(item =>
      item.id === id 
        ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) }
        : item
    );
    setCartItems(updatedItems);
    // localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    setSelectedItems(selected => selected.filter(itemId => itemId !== id));
    // localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const toggleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selected => selected.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.discount_price || item.price || 0);
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
  };

  const freeShippingThreshold = 3348.40;
  const currentTotal = calculateTotal();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Cart ({cartItems.length})
                </h1>
                <ShoppingCart className="w-6 h-6 text-gray-500" />
              </div>

              {/* Select All */}
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="select-all" className="ml-2 text-sm text-gray-700">
                  Select all items
                </label>
              </div>

              {/* Shipping Banner */}
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded">
                <div className="flex items-center">
                  <span className="bg-green-400 text-black px-2 py-1 rounded text-xs font-medium mr-3">
                    NCDB Mart
                  </span>
                  <span className="text-sm text-gray-700">Fast & Reliable Delivery</span>
                </div>
                {remainingForFreeShipping > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Add <span className="font-semibold">LKR {remainingForFreeShipping.toFixed(2)}</span> for free shipping.
                  </p>
                )}
              </div>

              {/* Empty Cart Message */}
              {cartItems.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500">Add some items to get started!</p>
                </div>
              )}
              {cartItems.map(item => (
                <div key={item.id} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {/* Product Image */}
                    <div className="relative">
                      <img
                        src={item.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                      {item.stock_level <= 3 && item.stock_level > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Only {item.stock_level} left
                        </div>
                      )}
                      {item.stock_level === 0 && (
                        <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      
                      {item.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              LKR {parseFloat(item.discount_price || item.price || 0).toFixed(2)}
                            </span>
                            {item.discount_price && item.price !== item.discount_price && (
                              <span className="text-sm text-gray-500 line-through">
                                LKR {parseFloat(item.price || 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                          {item.newShopperSave && (
                            <p className="text-xs text-red-600 mt-1">
                              New shoppers save LKR {parseFloat(item.newShopperSave || 0).toFixed(2)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {item.supplier_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity_per_unit} {item.unit_symbol} per unit
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50"
                              disabled={(item.quantity || 1) <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50"
                              disabled={item.stock_level <= (item.quantity || 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 p-1"
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
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    LKR {currentTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedItems.length > 0
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={selectedItems.length === 0}
              >
                Checkout ({selectedItems.length})
              </button>

              {/* Payment Methods */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Pay with</h3>
                <div className="flex space-x-2">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
                    alt="Visa" 
                    className="h-6 w-auto"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
                    alt="Mastercard" 
                    className="h-6 w-auto"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg" 
                    alt="JCB" 
                    className="h-6 w-auto"
                  />
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
                    alt="American Express" 
                    className="h-6 w-auto"
                  />
                </div>
              </div>

              {/* Buyer Protection */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Buyer protection
                </h3>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Get a full refund if the item is not as described or not delivered
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;