import { Package } from 'lucide-react';

const OrderItems = ({ order, imageErrors, onImageError }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Package size={20} /> Order Items
            </h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {order.items?.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={imageErrors[item.id] ? '/placeholder-image.jpg' : (item.Product?.base_image_url || '/placeholder-image.jpg')}
                                            alt={item.Product?.name}
                                            className="w-12 h-12 object-cover rounded"
                                            onError={() => onImageError(item.id)}
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.Product?.name}
                                            </div>
                                            {item.Product?.sku && (
                                                <div className="text-xs text-gray-500">
                                                    SKU: {item.Product.sku}
                                                </div>
                                            )}
                                            {item.Supplier && (
                                                <div className="text-xs text-blue-600">
                                                    Supplier: {item.Supplier.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    LKR {item.price}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    LKR {(item.price * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderItems;