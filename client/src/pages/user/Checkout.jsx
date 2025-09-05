import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from 'lucide-react';
import { useGetShippingAddressQuery } from '../../slices/shippingAddressApiSlice';
import { useCheckoutOrderMutation } from '../../slices/ordersApiSlice';
import CheckoutForm from '../../components/checkout/CheckoutForm';
import OrderSummary from '../../components/checkout/OrderSummary';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const Checkout = () => {
  const navigate = useNavigate();

  // Get selected items from localStorage
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: addressData, isLoading: addressLoading, error: addressError } = useGetShippingAddressQuery();
  const [checkoutOrder] = useCheckoutOrderMutation();

  const addresses = addressData?.data || addressData || [];

  useEffect(() => {
    const storedItems = localStorage.getItem("checkoutItems");
    if (storedItems) {
      setSelectedItems(JSON.parse(storedItems));
    }
  }, []);

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

  if (addressError) {
    return (
      <ErrorMessage
        message="Failed to load addresses"
        onRetry={() => window.location.reload()}
        buttonText="Try Again"
      />
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
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CheckoutForm
              addresses={addresses}
              selectedAddress={selectedAddress}
              paymentMethod={paymentMethod}
              onAddressSelect={setSelectedAddress}
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
    </div>
  );
};

export default Checkout;