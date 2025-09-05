import { Plus, Minus, Trash2 } from 'lucide-react';
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from '../../slices/cartApiSlice';

const CartItem = ({
    item,
    isSelected,
    isUpdating,
    onToggleSelect,
    onRemoveItem
}) => {
    const [updateCartItem] = useUpdateCartItemMutation();
    const [removeFromCart] = useRemoveFromCartMutation();

    const calculateSubtotal = (item) => {
        const price = parseFloat(item.price || 0);
        return price * (item.quantity || 1);
    };

    const handleUpdateQuantity = async (newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await updateCartItem({
                product_id: item.product_id,
                supplier_id: item.supplier_id,
                quantity: newQuantity,
            }).unwrap();
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemoveItem = async () => {
        try {
            await removeFromCart({
                product_id: item.product_id,
                supplier_id: item.supplier_id,
            }).unwrap();
            onRemoveItem(item.id);
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    return (
        <div className="border-b border-gray-200 pb-6">
            <div className="flex items-start space-x-4">
                {/* Select */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    disabled={isUpdating}
                    className="mt-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />

                {/* Image */}
                <div className="flex-shrink-0">
                    <img
                        src={item.Product?.base_image_url || '../../images/product.png'}
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
                                onClick={() => handleUpdateQuantity((item.quantity || 1) - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="min-w-[2rem] text-center font-medium">
                                {item.quantity || 1}
                            </span>
                            <button
                                onClick={() => handleUpdateQuantity((item.quantity || 1) + 1)}
                                disabled={isUpdating}
                                className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleRemoveItem}
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
    );
};

export default CartItem;