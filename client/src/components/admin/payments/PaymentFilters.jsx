import { Search } from 'lucide-react';

const PaymentFilters = ({ filters, onFilterChange }) => {
    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
        { value: 'partially_refunded', label: 'Partially Refunded' }
    ];

    const paymentMethodOptions = [
        { value: '', label: 'All Methods' },
        { value: 'cash_on_delivery', label: 'Cash on Delivery' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'digital_wallet', label: 'Digital Wallet' }
    ];

    const rangeOptions = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: 'all', label: 'All time' }
    ];

    const handleFilterUpdate = (key, value) => {
        onFilterChange({
            ...filters,
            [key]: value
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search transactions, orders, or customers..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.search}
                            onChange={(e) => handleFilterUpdate('search', e.target.value)}
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div className="w-full lg:w-48">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.range}
                        onChange={(e) => handleFilterUpdate('range', e.target.value)}
                    >
                        {rangeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filter */}
                <div className="w-full lg:w-48">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.payment_status}
                        onChange={(e) => handleFilterUpdate('payment_status', e.target.value)}
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment Method Filter */}
                <div className="w-full lg:w-48">
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={filters.payment_method}
                        onChange={(e) => handleFilterUpdate('payment_method', e.target.value)}
                    >
                        {paymentMethodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default PaymentFilters;