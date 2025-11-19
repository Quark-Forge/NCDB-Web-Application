import { FiEye, FiClock, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetAllOrdersQuery } from '../../../slices/ordersApiSlice';
import { useSelector } from 'react-redux';


const StatusBadge = ({ status }) => {
    const statusConfig = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
        confirmed: { color: 'bg-blue-100 text-blue-800', icon: FiClock },
        shipped: { color: 'bg-indigo-100 text-indigo-800', icon: FiTruck },
        delivered: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
        cancelled: { color: 'bg-red-100 text-red-800', icon: FiClock }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} flex items-center gap-1 w-fit`}>
            <Icon className="text-xs" />
            {status}
        </span>
    );
};

const RecentOrdersTable = () => {
    const { data: ordersData, isLoading } = useGetAllOrdersQuery({
        limit: 5,
        page: 1
    });

    const { userInfo } = useSelector((state) => state.auth);

    const orders = ordersData?.data || [];

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-gray-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            {
                                userInfo.user_role === 'Admin' || userInfo.user_role === 'Order Manager' && (
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                )
                            }

                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                    #{order.order_number}
                                </td>
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                    LKR{parseFloat(order.total_amount).toFixed(2)}
                                </td>

                                {
                                    (userInfo.user_role === 'Admin' || userInfo.user_role === 'Order Manager') && (
                                        <td className="px-4 py-4 text-sm">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                <FiEye /> View
                                            </Link>
                                        </td>
                                    )
                                }

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No recent orders found
                </div>
            )}
        </div>
    );
};

export default RecentOrdersTable;