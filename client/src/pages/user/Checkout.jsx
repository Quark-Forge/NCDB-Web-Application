import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { useGetShippingAddressQuery } from '../../slices/shippingAddressApiSlice';
import { useCheckoutOrderMutation } from '../../slices/ordersApiSlice';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import OrderSummary from '../../components/checkout/OrderSummary';
import PaymentMethod from '../../components/checkout/PaymentMethod'; // Import your PaymentMethod component
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddressModal from '../../components/checkout/AddressModal';

const Checkout = () => {
  const navigate = useNavigate();

  // Get selected items from localStorage
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const { data: addressData, isLoading: addressLoading, error: addressError, refetch: refetchAddresses } = useGetShippingAddressQuery();
  const [checkoutOrder] = useCheckoutOrderMutation();

  // Handle empty addresses array (new users)
  const addresses = addressData?.data || addressData || [];

  useEffect(() => {
    const storedItems = localStorage.getItem("checkoutItems");
    if (storedItems) {
      setSelectedItems(JSON.parse(storedItems));
    }

    // Automatically show address modal if no addresses exist
    if (addresses.length === 0 && !addressLoading && !addressError) {
      setShowAddressModal(true);
    }
  }, [addresses.length, addressLoading, addressError]);

  const calculateSubtotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0);
      return total + price * (item.quantity || 1);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingCost = selectedAddress?.ShippingCost?.cost || selectedAddress?.shipping_cost || 0;
  const total = subtotal + parseFloat(shippingCost);

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

    try {
      // Get only the IDs of selected cart items
      const selectedItemIds = selectedItems.map(item => item.id);

      const orderData = {
        address_id: selectedAddress.id,
        selected_items: selectedItemIds, // Send selected item IDs
        payment_method: paymentMethod,
        total_amount: total,
        shipping_cost: shippingCost
      };

      const result = await checkoutOrder(orderData).unwrap();

      if (result.success) {
        localStorage.removeItem("checkoutItems");
        alert('Order placed successfully!');
        navigate('/user/myorders');
      } else {
        alert(result.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (addressLoading) {
    return <LoadingSpinner message="Loading checkout..." />;
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Shipping Address</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {selectedAddress ? 'Change Address' : 'Select Address'}
                </button>
              </div>

              {addressError ? (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-red-500 mb-2">Failed to load addresses</p>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => refetchAddresses()}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Add New Address
                    </button>
                  </div>
                </div>
              ) : selectedAddress ? (
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedAddress.shipping_name || selectedAddress.name}</p>
                      <p className="text-sm text-gray-600">{selectedAddress.shipping_phone || selectedAddress.phone}</p>
                      {selectedAddress.email && (
                        <p className="text-sm text-gray-600">{selectedAddress.email}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedAddress.address_line1 || selectedAddress.address}
                        {selectedAddress.address_line2 && `, ${selectedAddress.address_line2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.city}, {selectedAddress.postal_code}
                      </p>
                      {shippingCost > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Shipping: LKR {parseFloat(shippingCost).toFixed(2)}
                        </p>
                      )}
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

            {/* Use your PaymentMethod component */}
            <PaymentMethod
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          </div>

          <OrderSummary
            selectedItems={selectedItems}
            subtotal={subtotal}
            shippingCost={shippingCost}
            total={total}
            selectedAddress={selectedAddress}
            isProcessing={isProcessing}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressModal
          addresses={addressError ? [] : addresses}
          selectedAddress={selectedAddress}
          onClose={() => setShowAddressModal(false)}
          onSelectAddress={(address) => {
            setSelectedAddress(address);
            setShowAddressModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Checkout;