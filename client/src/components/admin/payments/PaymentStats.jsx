import { DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';

const PaymentStats = ({ stats }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const StatCard = ({ title, value, variant, icon: Icon }) => (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${variant} text-white`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${variant.split(' ')[0]}`}
                        style={{ width: '100%' }}
                    ></div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                variant="from-blue-500 to-blue-600"
                icon={DollarSign}
            />
            <StatCard
                title="Successful Transactions"
                value={stats.successfulTransactions}
                variant="from-green-500 to-green-600"
                icon={CreditCard}
            />
            <StatCard
                title="Pending/Issues"
                value={stats.pendingIssues}
                variant="from-red-500 to-red-600"
                icon={AlertCircle}
            />
        </div>
    );
};

export default PaymentStats;