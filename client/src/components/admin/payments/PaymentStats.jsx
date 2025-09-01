import { DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import Card from '../../common/Card';

const PaymentStats = ({ stats }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
                <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-3 mr-4">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-3 mr-4">
                        <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Successful Transactions</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.successfulTransactions}</p>
                    </div>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex items-center">
                    <div className="rounded-full bg-red-100 p-3 mr-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Pending/Issues</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.pendingIssues}</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PaymentStats;