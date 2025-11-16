import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from 'lucide-react';
import {
  useGetCartQuery,
  useClearCartMutation,
} from '../../slices/cartApiSlice';
import CartItemsList from '../../components/cart/CartItemsList';
import CartSummary from '../../components/cart/CartSummary';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const Cart = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useGetCartQuery();
  const [clearCart] = useClearCartMutation();

  const [cartItems, setCartItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load from API - Fix response format
  useEffect(() => {
    if (data?.CartItems) {
      setCartItems(data.CartItems);
    } else if (data?.data?.CartItems) {
      setCartItems(data.data.CartItems);
    }
  }, [data]);

  // Update selectAll state when cartItems or selectedItems change
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectAll(selectedItems.length === cartItems.length);
    }
  }, [selectedItems, cartItems]);

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

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => {
        const price = parseFloat(item.price || 0);
        return total + price * (item.quantity || 1);
      }, 0);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your cart..." />;
  }

  if (isError) {
    return (
      <ErrorMessage
        message="Failed to load cart"
        icon={<ShoppingCart className="w-16 h-16 mx-auto mb-2" />}
        onRetry={refetch}
        buttonText="Try Again"
      />
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

          <CartItemsList
            cartItems={cartItems}
            selectedItems={selectedItems}
            isUpdating={isUpdating}
            selectAll={selectAll}
            onToggleSelectAll={toggleSelectAll}
            onToggleSelectItem={(id) => setSelectedItems(prev =>
              prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
            )}
            refetchCart={refetch}
          />
        </div>

        {/* Summary */}
        <CartSummary
          selectedItemsCount={selectedItems.length}
          total={calculateTotal()}
          isUpdating={isUpdating}
          onCheckout={() => {
            const selectedCartItems = cartItems.filter(item =>
              selectedItems.includes(item.id)
            );
            localStorage.setItem("checkoutItems", JSON.stringify(selectedCartItems));
            navigate("/user/checkout");
          }}
        />
      </div>
    </div>
  );
};

export default Cart;