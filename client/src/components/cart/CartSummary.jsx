import { Shield } from 'lucide-react';

const CartSummary = ({
    selectedItemsCount,
    total,
    isUpdating,
    onCheckout
}) => {
    const shippingCost = 0; // Remove free shipping calculation
    const finalTotal = total + shippingCost;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 h-fit lg:sticky lg:top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                    <span>Items ({selectedItemsCount})</span>
                    <span>LKR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                </div>
                <hr className="my-4" />
                <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>LKR {finalTotal.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={onCheckout}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedItemsCount > 0 && !isUpdating
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                disabled={selectedItemsCount === 0 || isUpdating}
            >
                {isUpdating ? 'Updating...' : `Checkout (${selectedItemsCount})`}
            </button>
        </div>
    );
};

export default CartSummary;