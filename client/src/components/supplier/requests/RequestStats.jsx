import { Clock, CheckCircle, XCircle, Package, DollarSign } from 'lucide-react';
import Card from '../../common/Card';

const RequestStats = ({ stats }) => {
    const statCards = [
        {
            label: 'Total Requests',
            value: stats?.total || 0,
            icon: Package,
            color: 'blue'
        },
        {
            label: 'Pending',
            value: stats?.pending || 0,
            icon: Clock,
            color: 'yellow'
        },
        {
            label: 'Approved',
            value: stats?.approved || 0,
            icon: CheckCircle,
            color: 'green'
        },
        {
            label: 'Rejected',
            value: stats?.rejected || 0,
            icon: XCircle,
            color: 'red'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
            yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            green: { bg: 'bg-green-100', text: 'text-green-600' },
            red: { bg: 'bg-red-100', text: 'text-red-600' }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {statCards.map((stat) => {
                const colorClasses = getColorClasses(stat.color);
                const IconComponent = stat.icon;

                return (
                    <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 ${colorClasses.bg} rounded-lg`}>
                                <IconComponent className={`h-6 w-6 ${colorClasses.text}`} />
                            </div>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};

export default RequestStats;