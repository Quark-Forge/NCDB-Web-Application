import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Badges from '../../common/Badges';
import Dropdown from '../../common/Dropdown';
import { useUpdateOrderStatusMutation } from '../../../slices/ordersApiSlice';
import { toast } from 'react-toastify';

const OrderTable = ({ orders = [], totalOrders = 0, onStatusUpdate }) => {
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const statusVariant = {
    pending: 'warning',
    confirmed: 'primary',
    shipped: 'info',
    delivered: 'success',
    cancelled: 'danger'
  };

  const paymentVariant = {
    paid: 'success',
    pending: 'warning',
    failed: 'danger',
    refunded: 'info'
  };

  const headers = [
    'Order ID',
    'Customer',
    'Date',
    'Status',
    'Payment',
    'Total',
    'Actions'
  ];

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus({
        id: orderId,
        status: newStatus
      }).unwrap();

      if (onStatusUpdate) {
        onStatusUpdate(orderId, newStatus);
      }
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(error.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <Card className="p-0">
      <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
        <h2 className="text-sm font-semibold mb-2 sm:mb-0">Orders ({totalOrders})</h2>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-gray-50 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors"
            aria-label="Export orders to CSV"
          >
            Export CSV
          </button>
          <button
            className="px-3 py-1 bg-gray-50 rounded-lg text-xs sm:text-sm hover:bg-gray-100 transition-colors"
            aria-label="Print orders"
          >
            Print
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <Table headers={headers}>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                <Link
                  to={`/orders/${order._id}`}
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  #{order.order_number}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {order.shipping_name || 'Guest'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  {updatingOrderId === order.id && isUpdating ? (
                    <span className="text-sm text-gray-500">Updating...</span>
                  ) : (
                    <Dropdown
                      options={statusOptions}
                      value={order.status}
                      onChange={(value) => handleStatusChange(order.id, value)}
                      renderSelected={(selected) => (
                        <Badges variant={statusVariant[selected.value] || 'default'}>
                          {selected.label}
                        </Badges>
                      )}
                      buttonClassName="p-1 hover:bg-gray-100 rounded"
                      menuClassName="min-w-[160px]"
                      disabled={isUpdating}
                    />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badges variant={paymentVariant[order.paymentStatus] || 'default'}>
                  {(order.payment_status || 'Unknown').charAt(0).toUpperCase() +
                    (order.paymentStatus || 'Unknown').slice(1)}
                </Badges>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(order.total_amount)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                    aria-label={`View order ${order.order_number}`}
                  >
                    View
                  </Link>
                  <button
                    className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-1"
                    aria-label={`Print order ${order.order_number}`}
                  >
                    Print
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </Card>
  );
};

export default OrderTable;