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
    return order.payment_status || 'pending';
  };

  const getPaymentStatusText = (order) => {
    const status = getPaymentStatus(order);
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Helper function to get customer name
  const getCustomerName = (order) => {
    return order.Address?.shipping_name || 'N/A';
  };

  // Helper function to get customer phone
  const getCustomerPhone = (order) => {
    return order.Address?.shipping_phone || 'N/A';
  };

  // Helper function to get customer address
  const getCustomerAddress = (order) => {
    const address = order.Address;
    if (!address) return 'N/A';

    const addressParts = [
      address.address_line1,
      address.address_line2,
      address.city,
      address.postal_code
    ].filter(Boolean);

    return addressParts.join(', ');
  };

  // Helper function to get payment method text
  const getPaymentMethodText = (order) => {
    const method = order.payment_method;
    if (!method) return 'N/A';

    switch (method) {
      case 'cash_on_delivery':
        return 'Cash on Delivery';
      case 'card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  // Helper function to get order items summary
  const getOrderItemsSummary = (order) => {
    if (!order.OrderItems || order.OrderItems.length === 0) return 'No items';

    const itemCount = order.OrderItems.reduce((total, item) => total + item.quantity, 0);
    return `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
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
    // Define export config with correct field mappings
    const orderExportConfig = {
      headers: [
        { key: 'order_number', label: 'Order Number' },
        { key: 'customer_name', label: 'Customer Name' },
        { key: 'customer_phone', label: 'Customer Phone' },
        { key: 'customer_address', label: 'Customer Address' },
        { key: 'status', label: 'Order Status' },
        { key: 'payment_status', label: 'Payment Status' },
        { key: 'payment_method', label: 'Payment Method' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'final_total', label: 'Final Total' },
        { key: 'items_summary', label: 'Items Summary' },
        {
          key: 'order_date',
          label: 'Order Date',
          formatter: (value) => {
            return value ? new Date(value).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'N/A';
          }
        }
      ],
      dateFields: ['order_date'],
      filename: 'orders_report'
    };

    // Prepare data for export with all required fields
    const exportData = orders.map(order => ({
      ...order,
      // Map the actual data fields to export fields
      order_number: order.order_number,
      customer_name: getCustomerName(order),
      customer_phone: getCustomerPhone(order),
      customer_address: getCustomerAddress(order),
      payment_status: getPaymentStatusText(order),
      payment_method: getPaymentMethodText(order),
      order_date: order.order_date || order.createdAt,
      status: order.status,
      total_amount: order.total_amount,
      final_total: order.final_total,
      items_summary: getOrderItemsSummary(order)
    }));

    exportToCSV(exportData, orderExportConfig.headers, orderExportConfig.filename, {
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
                    {formatDate(order.order_date || order.createdAt)}
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
                    Rs{order.final_total || order.total_amount}
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
                                  .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                                  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                  th { background-color: #f5f5f5; }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <h1>Order #${order.order_number}</h1>
                                  <p>Generated on ${new Date().toLocaleDateString()}</p>
                                </div>
                                <div class="section">
                                  <h3>Order Details</h3>
                                  <p><strong>Date:</strong> ${formatDate(order.order_date || order.createdAt)}</p>
                                  <p><strong>Status:</strong> ${order.status}</p>
                                  <p><strong>Payment Status:</strong> ${paymentStatusText}</p>
                                  <p><strong>Payment Method:</strong> ${getPaymentMethodText(order)}</p>
                                  <p><strong>Total Amount:</strong> Rs${order.total_amount}</p>
                                  <p><strong>Final Total:</strong> Rs${order.final_total}</p>
                                </div>
                                <div class="section">
                                  <h3>Customer Details</h3>
                                  <p><strong>Name:</strong> ${getCustomerName(order)}</p>
                                  <p><strong>Phone:</strong> ${getCustomerPhone(order)}</p>
                                  <p><strong>Address:</strong> ${getCustomerAddress(order)}</p>
                                </div>
                                <div class="section">
                                  <h3>Order Items</h3>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      ${order.OrderItems?.map(item => `
                                        <tr>
                                          <td>Product ID: ${item.product_id}</td>
                                          <td>${item.quantity}</td>
                                          <td>Rs${item.price}</td>
                                          <td>Rs${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
                                        </tr>
                                      `).join('') || '<tr><td colspan="4">No items</td></tr>'}
                                    </tbody>
                                  </table>
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