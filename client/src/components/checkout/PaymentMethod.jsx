import { Banknote, CreditCard } from 'lucide-react';

const PaymentMethod = ({ paymentMethod, onPaymentMethodChange }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <Banknote className="w-5 h-5 text-gray-600" />
                    <div>
                        <span className="font-medium">Cash on Delivery</span>
                        <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                    </div>
                </label>

                {/* <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                    />
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                        <span className="font-medium">Credit / Debit Card</span>
                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                    </div>
                </label> */}
            </div>
        </div>
    );
};

export default PaymentMethod;