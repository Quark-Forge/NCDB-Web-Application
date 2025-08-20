import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ salesData }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-UK', {
            month: 'short',
            day: 'numeric'
        });
    };

    const chartData = salesData.map(item => ({
        date: formatDate(item.date),
        sales: parseFloat(item.total_sales) || 0,
        orders: item.order_count || 0
    }));

    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                        formatter={(value, name) => [
                            name === 'sales' ? `$${value}` : value,
                            name === 'sales' ? 'Revenue' : 'Orders'
                        ]}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sales"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Revenue"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Orders"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesChart;