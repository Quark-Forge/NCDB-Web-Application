import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';

const CartPopup = ({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem }) => {
  if (!isOpen) return null;

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.product_data?.price || item.price || 0);
    return sum + item.quantity * price;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Shopping Cart</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Cart Items (Scrollable) */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-2">Add some products to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const price = parseFloat(item.product_data?.price || item.price || 0);
                const imageUrl = item.product_data?.image_url || item.image_url || '../../images/product.png';
                const supplierName = item.product_data?.supplier_name;

                return (
                  <div key={`${item.product_id}-${index}`} className="flex items-center space-x-4 border-b pb-4">
                    <img
                      src={imageUrl}
                      alt={item.product_data?.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.product_data?.name}</h3>
                      {supplierName && (
                        <p className="text-xs text-gray-500">Sold by: {supplierName}</p>
                      )}
                      <p className="text-blue-600 font-bold">Rs {price.toFixed(2)}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-2">
                      <button onClick={() => onUpdateQuantity(index, Math.max(item.quantity - 1, 1))}>
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(index, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button onClick={() => onRemoveItem(index)} className="text-red-500">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total Items: {totalItems}</span>
              <span className="font-bold text-blue-600">Rs {totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 py-2 border rounded-lg">
                Continue Shopping
              </button>
              <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg">
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;