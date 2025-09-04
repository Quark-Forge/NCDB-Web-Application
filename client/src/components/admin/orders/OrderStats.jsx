import Card from '../../common/Card';

const OrderStats = ({ data, isLoading }) => {

    const stats = data?.data || [];

    if (isLoading) return <Card className="p-4">Loading stats...</Card>;
    

    return (
        <Card className="p-4">
            <h3 className="text-sm font-medium mb-4">Order Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                    title="Total Orders"
                    value={stats.total_orders}
                    trend="up"
                    change="12%"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending_orders}
                    trend="down"
                    change="5%"
                />
                <StatCard
                    title="Completed"
                    value={stats.completed_orders}
                    trend="up"
                    change="8%"
                />
                <StatCard
                    title="Today's Orders"
                    value={stats.today_orders}
                    trend="up"
                    change="15%"
                />
            </div>
        </Card>
    );
};

const StatCard = ({ title, value, trend, change }) => {
    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600'
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→'
    };

    return (
        <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="text-xs text-gray-500 font-medium">{title}</h4>
            <div className="flex items-end justify-between mt-1">
                <p className="text-lg font-bold">{value}</p>
                {trend && (
                    <span className={`text-xs ${trendColors[trend]}`}>
                        {trendIcons[trend]} {change}
                    </span>
                )}
            </div>
        </div>
    );
};

export default OrderStats;