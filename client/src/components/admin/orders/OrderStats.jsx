import Card from '../../common/Card';

const OrderStats = ({ data, isLoading }) => {
    const stats = data?.data || {};

    if (isLoading) {
        return (
            <Card className="p-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="text-center text-gray-500 py-8">Loading order statistics...</div>
            </Card>
        );
    }

    const StatCard = ({ title, value, trend, change, icon }) => {
        const trendColors = {
            up: 'text-green-600 bg-green-50',
            down: 'text-red-600 bg-red-50',
            neutral: 'text-gray-600 bg-gray-50'
        };

        const gradientColors = {
            total: 'from-blue-500 to-blue-600',
            pending: 'from-yellow-500 to-yellow-600',
            completed: 'from-green-500 to-green-600',
            today: 'from-purple-500 to-purple-600'
        };

        const getGradient = (title) => {
            if (title.includes('Total')) return gradientColors.total;
            if (title.includes('Pending')) return gradientColors.pending;
            if (title.includes('Completed')) return gradientColors.completed;
            return gradientColors.today;
        };

        return (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{value || 0}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${getGradient(title)} text-white`}>
                        {icon}
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

    const orderIcons = {
        total: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
        pending: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        completed: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        today: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )
    };

    return (
        <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Order Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Total Orders"
                    value={stats.total_orders}
                    icon={orderIcons.total}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pending_orders}
                    icon={orderIcons.pending}
                />
                <StatCard
                    title="Completed Orders"
                    value={stats.completed_orders}
                    icon={orderIcons.completed}
                />
                <StatCard
                    title="Today's Orders"
                    value={stats.today_orders}
                    icon={orderIcons.today}
                />
            </div>
        </div>
    );
};

export default OrderStats;