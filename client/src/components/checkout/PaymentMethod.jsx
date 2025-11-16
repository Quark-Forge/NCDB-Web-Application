import { Banknote, CreditCard } from 'lucide-react';

const PaymentMethod = ({ paymentMethod, onPaymentMethodChange }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>

            <div className="space-y-3">
                <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cash_on_delivery'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                        type="radio"
                        name="payment"
                        value="cash_on_delivery"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 focus:ring-2"
                    />
                    <Banknote className={`w-5 h-5 ${paymentMethod === 'cash_on_delivery' ? 'text-red-600' : 'text-gray-600'
                        }`} />
                    <div>
                        <span className={`font-medium ${paymentMethod === 'cash_on_delivery' ? 'text-red-700' : 'text-gray-900'
                            }`}>
                            Cash on Delivery
                        </span>
                        <p className="text-sm text-gray-500">Pay when your order is delivered</p>
                    </div>
                </label>

                {/* <label className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === 'credit_card' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                }`}>
                    <input
                        type="radio"
                        name="payment"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500 focus:ring-2"
                    />
                    <CreditCard className={`w-5 h-5 ${
                        paymentMethod === 'credit_card' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                    <div>
                        <span className={`font-medium ${
                            paymentMethod === 'credit_card' ? 'text-red-700' : 'text-gray-900'
                        }`}>
                            Credit / Debit Card
                        </span>
                        <p className="text-sm text-gray-500">Pay securely with your card</p>
                    </div>
                </label> */}
            </div>
        </div>
    );
};

export default PaymentMethod;