import { ChevronLeft, Printer } from 'lucide-react';

const OrderHeader = ({ order, onBack, onPrint }) => {
    return (
        <div className="flex items-center justify-between">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
            >
                <ChevronLeft size={18} /> Back to Orders
            </button>
            <div className="flex gap-2">
                <button
                    onClick={onPrint}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                    <Printer size={16} /> Print Invoice
                </button>
            </div>
        </div>
    );
};

export default OrderHeader;