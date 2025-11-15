import { DollarSign } from 'lucide-react';

const OrderSummaryCard = ({ order }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Order Summary
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">LKR {order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">LKR {order.shipping_cost || 0}</span>
                </div>
                <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>LKR {order.final_total || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSummaryCard;