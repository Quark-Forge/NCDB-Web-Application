import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../common/Card';
import Table from '../../common/Table';
import Badges from '../../common/Badges';
import Dropdown from '../../common/Dropdown';
import ExportPrintBar from '../../common/ExportPrintBar';
import PrintableOrders from './PrintableOrders';
import { useUpdateOrderStatusMutation } from '../../../slices/ordersApiSlice';
import { useExport } from '../../../hooks/useExport';
import { usePrint } from '../../../hooks/usePrint';
import { orderExportConfig } from '../../../utils/exportConfigs';
import { toast } from 'react-toastify';
import { FiEye, FiPrinter } from 'react-icons/fi';

const OrderTable = ({ orders = [], totalOrders = 0, onStatusUpdate }) => {
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const { exportToCSV, isExporting } = useExport();
  const { printRef, handlePrint } = usePrint();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    'Date',
    'Status',
    'Payment',
    'Total',
    'Actions'
  ];

  // Helper function to safely get payment status
  const getPaymentStatus = (order) => {
    if (!order.payment) return 'pending';
    return order.payment.payment_status || 'pending';
  };

  const getPaymentStatusText = (order) => {
    const status = getPaymentStatus(order);
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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

  const handleExport = () => {
    exportToCSV(orders, orderExportConfig.headers, orderExportConfig.filename, {
      dateFields: orderExportConfig.dateFields
    });
  };

  return (
    <>
      <Card className="p-0">
        <div className="px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b">
          <h2 className="text-sm font-semibold mb-2 sm:mb-0">Orders ({totalOrders})</h2>
          <ExportPrintBar
            onExport={handleExport}
            onPrint={handlePrint}
            isExporting={isExporting}
            exportDisabled={orders.length === 0}
            printDisabled={orders.length === 0}
          />
        </div>

        <div className="relative overflow-x-auto">
          <Table headers={headers}>
            {orders.map((order) => {
              const paymentStatus = getPaymentStatus(order);
              const paymentStatusText = getPaymentStatusText(order);

              return (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      #{order.order_number}
                    </Link>
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
                    <Badges variant={paymentVariant[paymentStatus] || 'default'}>
                      {paymentStatusText}
                    </Badges>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    Rs{order.total_amount}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                        aria-label={`View order ${order.order_number}`}
                      >
                        <FiEye size={16} />
                      </Link>
                      <button
                        onClick={() => {
                          // Single order print functionality
                          const printWindow = window.open('', '_blank');
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Order #${order.order_number}</title>
                                <style>
                                  body { font-family: Arial, sans-serif; margin: 20px; }
                                  .header { text-align: center; margin-bottom: 30px; }
                                  .section { margin-bottom: 20px; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>Order #${order.order_number}</h1>
                                  <p>Generated on ${new Date().toLocaleDateString()}</p>
                                </div>
                                <div class="section">
                                  <h3>Order Details</h3>
                                  <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                                  <p><strong>Status:</strong> ${order.status}</p>
                                  <p><strong>Payment:</strong> ${paymentStatusText}</p>
                                  <p><strong>Total:</strong> Rs${order.total_amount}</p>
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                          printWindow.print();
                        }}
                        className="text-gray-600 hover:text-gray-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-1"
                        aria-label={`Print order ${order.order_number}`}
                      >
                        <FiPrinter size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </Table>
        </div>
      </Card>

      {/* Hidden printable content */}
      <div style={{ display: 'none' }}>
        <PrintableOrders
          ref={printRef}
          orders={orders}
          totalOrders={totalOrders}
        />
      </div>
    </>
  );
};

export default OrderTable;