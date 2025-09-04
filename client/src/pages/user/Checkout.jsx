// src/screens/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Edit3, Plus, X, Shield, CreditCard, Banknote } from 'lucide-react';
import { useGetShippingAddressQuery } from '../../slices/shippingAddressApiSlice';
import { useGetCartQuery } from '../../slices/cartApiSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading } = useGetCartQuery();

  // Get selected items from navigation state or default to all cart items
  const selectedItemIds = location.state?.selectedItems || [];

  const {
    data: addresses = [],
    isLoading: addressLoading,
    error: addressError,
  } = useGetShippingAddressQuery();

  console.log(addresses);
  
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

//   const [checkoutItems, setCheckoutItems] = useState([]);

  useEffect(() => {
    // 1. Get selected item IDs from localStorage
    const storedItems = localStorage.getItem("checkoutItems");
    if (storedItems) {
      const selectedItems = JSON.parse(storedItems);

      // 2. If API has cart data, match them
      if (data?.data?.CartItems) {
        const filtered = data.data.CartItems.filter((item) =>
          selectedItems.some((sel) => sel.id === item.id)
        );
        setSelectedItems(filtered);
      } else {
        // fallback if no API yet
        setSelectedItems(selectedItems);
      }
    }
  }, [data]);

  // Mock stored addresses - in real app, fetch from API
  const [storedAddresses, setStoredAddresses] = useState([
    {
      id: 1,
      name: 'John Doe',
      phone: '+94 77 123 4567',
      email: 'john@example.com',
      address: '123 Main Street, Colombo 03',
      city: 'Colombo',
      postalCode: '00300',
      isDefault: true
    },
    {
      id: 2,
      name: 'John Doe',
      phone: '+94 77 123 4567',
      email: 'john@example.com',
      address: '456 Office Lane, Kandy',
      city: 'Kandy',
      postalCode: '20000',
      isDefault: false
    }
  ]);

  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: ''
  });

  // Load cart data and filter selected items
//   useEffect(() => {
//     if (data?.data?.CartItems) {
//       const allItems = data.data.CartItems;
//       setCartItems(allItems);
      
//       // Filter selected items
//       if (selectedItemIds.length > 0) {
//         const filtered = allItems.filter(item => selectedItemIds.includes(item.id));
//         setSelectedItems(filtered);
//       } else {
//         // If no specific selection, include all items
//         setSelectedItems(allItems);
//       }
//     }
//   }, [data, selectedItemIds]);

  // Set default address
  useEffect(() => {
    const defaultAddress = storedAddresses.find(addr => addr.isDefault);
    if (defaultAddress && !selectedAddress) {
      setSelectedAddress(defaultAddress);
    }
  }, [storedAddresses, selectedAddress]);

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const freeShippingThreshold = 3348.40;
  const subtotal = calculateSubtotal();
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 300; // LKR 300 shipping
  const total = subtotal + shippingCost;

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleAddNewAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city) {
      alert('Please fill in all required fields');
      return;
    }

    const addressToAdd = {
      id: Date.now(),
      ...newAddress,
      isDefault: storedAddresses.length === 0
    };

    setStoredAddresses(prev => [...prev, addressToAdd]);
    setSelectedAddress(addressToAdd);
    setNewAddress({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      postalCode: ''
    });
    setShowAddressModal(false);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a shipping address');
      return;
    }

    if (selectedItems.length === 0) {
      alert('No items to checkout');
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Order placed successfully!');
      navigate('/user/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-500 mb-4">No items to checkout</h3>
          <button
            onClick={() => navigate('/user/cart')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Go back to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Shipping Address</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-700"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              </div>

              {selectedAddress ? (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedAddress.name}</p>
                      <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                      {selectedAddress.email && (
                        <p className="text-sm text-gray-600">{selectedAddress.email}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">{selectedAddress.address}</p>
                      <p className="text-sm text-gray-600">{selectedAddress.city}, {selectedAddress.postalCode}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-gray-500">No address selected</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                  >
                    Select Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <Banknote className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium">Cash on Delivery</span>
                    <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium">Credit / Debit Card</span>
                    <p className="text-sm text-gray-500">Pay securely with your card</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 h-fit lg:sticky lg:top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            {/* Items List */}
            <div className="space-y-4 mb-6">
              {selectedItems.map(item => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.Product?.base_image_url || 'https://via.placeholder.com/60'}
                    alt={item.Product?.name || 'Product'}
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.Product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity || 1}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    LKR {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <hr className="mb-6" />
            
            {/* Cost Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Items ({selectedItems.length})</span>
                <span>LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingCost === 0 ? 'FREE' : `LKR ${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {subtotal >= freeShippingThreshold && (
                <div className="text-xs text-green-600">
                  🎉 You qualify for free shipping!
                </div>
              )}
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>LKR {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddress || selectedItems.length === 0 || isProcessing}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                selectedAddress && selectedItems.length > 0 && !isProcessing
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Processing...' : `Place Order (${selectedItems.length} items)`}
            </button>

            {/* Buyer Protection */}
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

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Select Address</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Stored Addresses */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-900">Saved Addresses</h4>
                {storedAddresses.map(address => (
                  <div
                    key={address.id}
                    onClick={() => handleAddressSelect(address)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress?.id === address.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{address.name}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                        <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                        <p className="text-sm text-gray-600">{address.city}, {address.postalCode}</p>
                        {address.isDefault && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address */}
              <div className="border-t pt-6">
                <div className="flex items-center mb-4">
                  <Plus className="w-5 h-5 text-red-500 mr-2" />
                  <h4 className="font-medium text-gray-900">Add New Address</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number *"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newAddress.email}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, email: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3 w-full sm:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Address *"
                    value={newAddress.address}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3 w-full sm:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City *"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="border border-gray-300 rounded-lg p-3 w-full"
                  />
                </div>
                
                <button
                  onClick={handleAddNewAddress}
                  className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Add Address
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;