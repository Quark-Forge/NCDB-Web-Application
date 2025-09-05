import { ShoppingCart } from 'lucide-react';
import CartItem from './CartItem';
import FreeShippingNotice from './FreeShippingNotice';

const CartItemsList = ({
    cartItems,
    selectedItems,
    isUpdating,
    selectAll,
    onToggleSelectAll,
    onToggleSelectItem,
    refetchCart
}) => {
    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.id))
            .reduce((total, item) => {
                const price = parseFloat(item.price || 0);
                return total + price * (item.quantity || 1);
            }, 0);
    };

    const freeShippingThreshold = 3348.40;
    const currentTotal = calculateTotal();
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - currentTotal);

    return (
        <>
            {cartItems.length > 0 && (
                <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={onToggleSelectAll}
                        disabled={isUpdating}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                        Select all ({cartItems.length} items)
                    </label>
                </div>
            )}

            <FreeShippingNotice
                currentTotal={currentTotal}
                freeShippingThreshold={freeShippingThreshold}
                remainingForFreeShipping={remainingForFreeShipping}
            />

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500">Your cart is empty</h3>
                    <p className="text-gray-400 mt-2">Add some products to get started</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {cartItems.map(item => (
                        <CartItem
                            key={item.id}
                            item={item}
                            isSelected={selectedItems.includes(item.id)}
                            isUpdating={isUpdating}
                            onToggleSelect={() => onToggleSelectItem(item.id)}
                            refetchCart={refetchCart}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

export default CartItemsList;