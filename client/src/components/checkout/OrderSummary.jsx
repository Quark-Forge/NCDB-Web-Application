import { Shield } from 'lucide-react';

const OrderSummary = ({
    selectedItems,
    subtotal,
    shippingCost,
    total,
    freeShippingThreshold,
    selectedAddress,
    isProcessing,
    onPlaceOrder
}) => {
    
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit lg:sticky lg:top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {/* Items List */}
            <div className="space-y-4 mb-6">
                {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center space-x-3">
                        <img
                            src={item.Product?.base_image_url || '../../images/product.png'}
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
                        {shippingCost === 0 ? 'FREE' : `LKR ${shippingCost}`}
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
                onClick={onPlaceOrder}
                disabled={!selectedAddress || selectedItems.length === 0 || isProcessing}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedAddress && selectedItems.length > 0 && !isProcessing
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
    );
};

export default OrderSummary;