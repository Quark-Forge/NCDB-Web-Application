import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
    ChevronLeft,
    Printer,
    Truck,
    RefreshCw,
    DollarSign,
    Archive,
    Mail,
    Clock,
    CheckCircle,
    XCircle,
    UserCircle,
    Package,
    CreditCard,
} from 'lucide-react';
import Badges from '../../../components/common/Badges';
import { useGetOrderDetailsQuery, useUpdateOrderStatusMutation } from '../../../slices/ordersApiSlice';

const OrderDetails = () => {

    const { orderId } = useParams();

    const statusVariant = {
        pending: 'warning',
        confirmed: 'primary',
        shipped: 'info',
        delivered: 'success',
        cancelled: 'danger'
    };

    const navigate = useNavigate();
    const [status, setStatus] = useState('');

    // Fetch order details
    const {
        data,
        isLoading,
        error,
        refetch,
    } = useGetOrderDetailsQuery(orderId);

    const order = data?.data || [];
    
    // Update order status
    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

    useEffect(() => {
        if (order) setStatus(order.status);
    }, [order]);

    const handleStatusUpdate = async () => {
        try {
            await updateOrder({ id: orderId, status }).unwrap();
            toast.success('Order status updated');
            refetch();
        } catch (err) {
            toast.error(err?.data?.message || 'Failed to update');
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="space-y-6">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                    <ChevronLeft size={18} /> Back to Orders
                </button>
                <div className="flex gap-2">
                    <button className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-md hover:bg-gray-200">
                        <Printer size={16} /> Print
                    </button>
                </div>
            </div>

            {/* Order summary card */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold">Order #{order.order_number}</h2>
                        <p className="text-gray-600">
                            Placed on: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badges
                            variant={statusVariant[order?.status || 'default']}
                        >
                            {order?.status?.toUpperCase()}
                        </Badges>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm"
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
                            disabled={isUpdating}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isUpdating ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column (Customer + Items) */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Customer info */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <UserCircle size={18} /> Customer Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                                <p className="text-sm font-medium text-gray-600">{order.shipping_name}</p>
                                <p className="text-sm font-medium text-gray-600">{order.email}</p>
                                <p className="text-sm font-medium text-gray-600">{order.shipping_phone}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-700">Shipping Address</h4>
                                <p className="text-sm font-medium text-gray-600">{order.address_line1}</p>
                                <p className="text-sm font-medium text-gray-600">{order.address_line2}</p>
                                <p className="text-sm font-medium text-gray-600">
                                    {order.city}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Package size={18} /> Order Items
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={item.Product.base_image_url}
                                                        alt={item.Product.name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                    <span>{item.Product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">LKR{item.price}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">{item.quantity}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">LKR{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right column (Payment + Actions) */}
                <div className="space-y-4">
                    {/* Payment info */}
                    {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <CreditCard size={18} /> Payment
                        </h3>
                        <div className="space-y-2">
                            <p>
                                <span className="text-gray-600">Method:</span> {order.paymentMethod}
                            </p>
                            <p>
                                <span className="text-gray-600">Status:</span>{' '}
                                {order.isPaid ? (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle size={16} /> Paid
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-600">
                                        <XCircle size={16} /> Not Paid
                                    </span>
                                )}
                            </p>
                            {order.isPaid && (
                                <p>
                                    <span className="text-gray-600">Paid at:</span>{' '}
                                    {new Date(order.paidAt).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div> */}

                    {/* Order summary */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <DollarSign size={18} /> Order Summary
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>LKR{order.total_amount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span>LKR{order.shipping_cost}</span>
                            </div>
                            {/* <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span>${order.taxPrice}</span>
                            </div> */}
                            <div className="flex justify-between font-medium border-t pt-2 mt-2">
                                <span>Total</span>
                                <span>LKR{order.total}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-2">
                        <h3 className="font-medium mb-2">Actions</h3>
                        <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700">
                            <Truck size={16} /> Create Shipping Label
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 px-3 py-2 rounded-md text-sm hover:bg-gray-200">
                            <RefreshCw size={16} /> Refund Order
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 bg-gray-100 px-3 py-2 rounded-md text-sm hover:bg-gray-200">
                            <Mail size={16} /> Resend Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;