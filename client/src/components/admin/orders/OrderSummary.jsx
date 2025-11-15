import Badges from '../../common/Badges';

const OrderSummary = ({ order, status, onStatusChange, onStatusUpdate, isUpdating }) => {
    const statusVariant = {
        pending: 'warning',
        confirmed: 'primary',
        shipped: 'info',
        delivered: 'success',
        cancelled: 'danger'
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Order #{order.order_number}</h2>
                    <p className="text-gray-600">
                        Placed on: {new Date(order.createdAt).toLocaleDateString('en-LK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badges variant={statusVariant[order.status] || 'default'}>
                        {order.status?.toUpperCase()}
                    </Badges>
                    <select
                        value={status}
                        onChange={onStatusChange}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isUpdating}
                    >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={onStatusUpdate}
                        disabled={isUpdating || status === order.status}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? 'Updating...' : 'Update Status'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSummary;