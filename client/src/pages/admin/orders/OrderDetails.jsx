import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    ChevronLeft,
    Printer,
    Truck,
    RefreshCw,
    DollarSign,
    Mail,
    UserCircle,
    Package,
    Shield,
    AlertCircle
} from 'lucide-react';
import Badges from '../../../components/common/Badges';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../../slices/ordersApiSlice';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('');

    // Fetch order details
    const {
        data,
        isLoading,
        error,
        refetch,
    } = useGetOrderDetailsQuery(orderId);

    const order = data?.data || {};

    // Update order status
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    useEffect(() => {
        if (order.status) setStatus(order.status);
    }, [order]);

    const handleStatusUpdate = async () => {
        try {
            await updateOrder({ id: orderId, status }).unwrap();
            toast.success('Order status updated');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update order status');
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Order #${order.order_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                        .section { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .total { font-weight: bold; font-size: 1.1em; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Order Invoice</h1>
                        <h2>Order #${order.order_number}</h2>
                        <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="section">
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.shipping_name}</p>
                        <p><strong>Phone:</strong> ${order.shipping_phone}</p>
                        <p><strong>Address:</strong> ${order.address_line1}${order.address_line2 ? ', ' + order.address_line2 : ''}, ${order.city}</p>
                    </div>

                    <div class="section">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items?.map(item => `
                                    <tr>
                                        <td>${item.Product?.name}</td>
                                        <td>LKR ${item.price}</td>
                                        <td>${item.quantity}</td>
                                        <td>LKR ${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('') || ''}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h3>Order Summary</h3>
                        <table>
                            <tr>
                                <td><strong>Subtotal:</strong></td>
                                <td>LKR ${order.total_amount || 0}</td>
                            </tr>
                            <tr>
                                <td><strong>Shipping:</strong></td>
                                <td>LKR ${order.shipping_cost || 0}</td>
                            </tr>
                            <tr class="total">
                                <td><strong>Total:</strong></td>
                                <td>LKR ${order.total || 0}</td>
                            </tr>
                        </table>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error states
    if (error) {
        if (error.status === 403) {
            return (
                <div className="max-w-2xl mx-auto mt-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-red-800 mb-2">Access Denied</h2>
                        <p className="text-red-600 mb-4">
                            You don't have permission to view this order. This order may not belong to your account.
                        </p>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            );
        }

        if (error.status === 404) {
            return (
                <div className="max-w-2xl mx-auto mt-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-yellow-800 mb-2">Order Not Found</h2>
                        <p className="text-yellow-600 mb-4">
                            The order you're looking for doesn't exist or may have been deleted.
                        </p>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Order</h2>
                    <p className="text-red-600 mb-4">
                        {error.data?.message || 'Failed to load order details. Please try again.'}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => refetch()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/admin/orders')}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if order data is available
    if (!order || !order.id) {
        return (
            <div className="max-w-2xl mx-auto mt-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-yellow-800 mb-2">No Order Data</h2>
                    <p className="text-yellow-600 mb-4">
                        Unable to load order information.
                    </p>
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const statusVariant = {
        pending: 'warning',
        confirmed: 'primary',
        shipped: 'info',
        delivered: 'success',
        cancelled: 'danger'
    };

    return (
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                >
                    <ChevronLeft size={18} /> Back to Orders
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                    >
                        <Printer size={16} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Order summary card */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Order #{order.order_number}</h2>
                        <p className="text-gray-600">
                            Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', {
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
                            onChange={(e) => setStatus(e.target.value)}
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
                            onClick={handleStatusUpdate}
                            disabled={isUpdating || status === order.status}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column (Customer + Items) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer info */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <UserCircle size={20} /> Customer Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900">{order.shipping_name}</p>
                                    {order.email && (
                                        <p className="text-sm text-gray-600">{order.email}</p>
                                    )}
                                    <p className="text-sm text-gray-600">{order.shipping_phone}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Shipping Address</h4>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-900">{order.address_line1}</p>
                                    {order.address_line2 && (
                                        <p className="text-sm text-gray-900">{order.address_line2}</p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                        {order.city}, {order.state} {order.postal_code}
                                    </p>
                                    {order.country && (
                                        <p className="text-sm text-gray-600">{order.country}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <Package size={20} /> Order Items
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items?.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.Product?.base_image_url || '/placeholder-image.jpg'}
                                                        alt={item.Product?.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item.Product?.name}
                                                        </div>
                                                        {item.Product?.sku && (
                                                            <div className="text-xs text-gray-500">
                                                                SKU: {item.Product.sku}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                LKR {item.price}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                LKR {(item.price * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right column (Payment + Actions) */}
                <div className="space-y-6">
                    {/* Order summary */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <DollarSign size={20} /> Order Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">LKR {order.total_amount || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">LKR {order.shipping_cost || 0}</span>
                            </div>
                            <div className="border-t pt-3 mt-2">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>LKR {order.total || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4">Order Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors">
                                <Truck size={18} /> Create Shipping Label
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors">
                                <RefreshCw size={18} /> Process Refund
                            </button>
                            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors">
                                <Mail size={18} /> Resend Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;