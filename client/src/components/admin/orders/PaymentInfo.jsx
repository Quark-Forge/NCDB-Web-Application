import { DollarSign } from 'lucide-react';
import Badges from '../../common/Badges';

const PaymentInfo = ({ payment }) => {
    if (!payment) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign size={20} /> Payment Information
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badges variant={
                        payment.payment_status === 'completed' ? 'success' :
                            payment.payment_status === 'pending' ? 'warning' :
                                payment.payment_status === 'failed' ? 'danger' : 'default'
                    }>
                        {payment.payment_status?.toUpperCase()}
                    </Badges>
                </div>
                {payment.payment_method && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Method</span>
                        <span className="font-medium">{payment.payment_method}</span>
                    </div>
                )}
                {payment.amount && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium">LKR {payment.amount}</span>
                    </div>
                )}
                {payment.transaction_id && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-medium text-sm">{payment.transaction_id}</span>
                    </div>
                )}
                {payment.payment_date && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date</span>
                        <span className="font-medium">
                            {new Date(payment.payment_date).toLocaleDateString('en-LK')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentInfo;