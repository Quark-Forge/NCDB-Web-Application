import { DollarSign, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';

const PaymentStats = ({ data, isLoading }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 animate-pulse h-24 rounded-lg"></div>
                ))}
            </div>
        );
    }

    const stats = data?.data || {
        totalRevenue: 0,
        successfulTransactions: 0,
        pendingIssues: 0,
        totalTransactions: 0
    };

    const StatCard = ({ title, value, variant, icon: Icon, isCurrency = false }) => (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {isCurrency ? formatCurrency(value) : value}
                    </p>
                </div>
                <div className={`p-3 rounded-lg ${variant} text-white`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
                title="Total Revenue"
                value={stats.totalRevenue}
                variant="bg-blue-500"
                icon={DollarSign}
                isCurrency={true}
            />
            <StatCard
                title="Successful Transactions"
                value={stats.successfulTransactions}
                variant="bg-green-500"
                icon={CreditCard}
            />
            <StatCard
                title="Pending/Issues"
                value={stats.pendingIssues}
                variant="bg-red-500"
                icon={AlertCircle}
            />
            <StatCard
                title="Total Transactions"
                value={stats.totalTransactions}
                variant="bg-purple-500"
                icon={TrendingUp}
            />
        </div>
    );
};

export default PaymentStats;