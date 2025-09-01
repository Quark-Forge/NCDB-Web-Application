import { Search, Filter, CreditCard } from 'lucide-react';
import Card from '../../common/Card';
import Dropdown from '../../common/Dropdown';

const PaymentFilters = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    paymentMethodFilter,
    onPaymentMethodFilterChange
}) => {
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'failed', label: 'Failed' },
        { value: 'disputed', label: 'Disputed' }
    ];

    const paymentMethodOptions = [
        { value: 'all', label: 'All Methods' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'apple_pay', label: 'Apple Pay' },
        { value: 'google_pay', label: 'Google Pay' }
    ];

    return (
        <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search transactions, orders, or customers..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                <Dropdown
                    options={statusOptions}
                    value={statusFilter}
                    onChange={onStatusFilterChange}
                    buttonClassName="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    renderSelected={(option) => (
                        <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            {option.label}
                        </div>
                    )}
                />

                <Dropdown
                    options={paymentMethodOptions}
                    value={paymentMethodFilter}
                    onChange={onPaymentMethodFilterChange}
                    buttonClassName="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    renderSelected={(option) => (
                        <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2" />
                            {option.label}
                        </div>
                    )}
                />
            </div>
        </Card>
    );
};

export default PaymentFilters;