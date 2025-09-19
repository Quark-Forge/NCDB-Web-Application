import { FiDollarSign, FiShoppingCart, FiPackage, FiCheckCircle } from 'react-icons/fi';

const StatsCard = ({ title, value, change, changeType, icon: Icon }) => {
    const gradientColors = {
        revenue: 'from-blue-500 to-blue-600',
        orders: 'from-green-500 to-green-600',
        conversion: 'from-purple-500 to-purple-600',
        average: 'from-orange-500 to-orange-600'
    };

    const getGradient = (title) => {
        if (title.includes('Revenue')) return gradientColors.revenue;
        if (title.includes('Orders')) return gradientColors.orders;
        if (title.includes('Conversion')) return gradientColors.conversion;
        return gradientColors.average;
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getGradient(title)} text-white`}>
                    <Icon className="text-xl" />
                </div>
            </div>
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full ${getGradient(title).split(' ')[0]}`}
                        style={{ width: '100%' }}
                    ></div>
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
            icon: FiDollarSign
        },
        {
            title: 'Total Orders',
            value: (stats.total_orders || 0).toLocaleString(),
            icon: FiShoppingCart
        },
        {
            title: 'Conversion Rate',
            value: `${stats.conversion_rate || 0}%`,
            icon: FiCheckCircle
        },
        {
            title: 'Avg. Order Value',
            value: `LKR ${(stats.average_order_value || 0).toLocaleString()}`,
            icon: FiPackage
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, index) => (
                <StatsCard key={index} {...card} />
            ))}
        </div>
    );
};

export default StatsGrid;