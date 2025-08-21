import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const OrderStatusChart = ({ statusData }) => {
    const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

    const chartData = statusData.map(item => ({
        name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: parseInt(item.count),
        count: item.count
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} orders`, props.payload.name]} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrderStatusChart;