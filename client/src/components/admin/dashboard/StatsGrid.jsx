import { FiDollarSign, FiShoppingCart, FiPackage, FiCheckCircle } from 'react-icons/fi';

const StatsCard = ({ title, value, change, changeType, icon: Icon }) => {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Icon className="text-xl" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className=" font-bold text-gray-900">{value}</p>
                    <p className={`text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        {change}
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatsGrid = ({ stats }) => {
    const cards = [
        {
            title: 'Total Revenue',
            value: `LKR ${(stats.total_revenue || 0).toLocaleString()}`,
            change: '+12.3% from last month',
            changeType: 'increase',
            icon: FiDollarSign
        },
        {
            title: 'Total Orders',
            value: (stats.total_orders || 0).toLocaleString(),
            change: '+8.1% from last month',
            changeType: 'increase',
            icon: FiShoppingCart
        },
        {
            title: 'Conversion Rate',
            value: `${stats.conversion_rate || 0}%`,
            change: '+2.5% from last month',
            changeType: 'increase',
            icon: FiCheckCircle
        },
        {
            title: 'Avg. Order Value',
            value: `LKR ${stats.average_order_value || 0}`,
            change: '+4.2% from last month',
            changeType: 'increase',
            icon: FiPackage
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <StatsCard key={index} {...card} />
            ))}
        </div>
    );
};

export default StatsGrid;