import { Truck, RefreshCw, Mail } from 'lucide-react';

const OrderActions = ({ onCreateShippingLabel }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-4">Order Actions</h3>
            <div className="space-y-3">
                <button
                    onClick={onCreateShippingLabel}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Truck size={18} /> Create Shipping Label
                </button>
            </div>
        </div>
    );
};

export default OrderActions;