import React from 'react';

const PrintableOrders = React.forwardRef(({ orders = [], totalOrders = 0 }, ref) => {
    const formatDateForPrint = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentStatus = (order) => {
        if (!order.payment) return 'pending';
        return order.payment.payment_status || 'pending';
    };

    const getPaymentStatusText = (order) => {
        const status = getPaymentStatus(order);
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const totalAmount = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
    const totalItems = orders.reduce((sum, order) => sum + (order.order_items?.length || 0), 0);

    return (
        <div ref={ref}>
            <div className="print-header">
                <h1>Orders Report</h1>
                <p>NCDB Mart - Order Management System</p>
                <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                <p>Total Orders: <strong>{totalOrders}</strong></p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date & Time</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Total Amount</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => (
                        <tr key={order.id}>
                            <td className="font-bold">#{order.order_number}</td>
                            <td>{formatDateForPrint(order.createdAt)}</td>
                            <td>
                                <div>
                                    <div>{order.User?.name || 'N/A'}</div>
                                    {order.User?.email && (
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {order.User.email}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="capitalize">{order.status}</td>
                            <td className="capitalize">{getPaymentStatusText(order)}</td>
                            <td className="font-bold">Rs {parseFloat(order.total_amount || 0).toFixed(2)}</td>
                            <td className="text-center">{order.order_items?.length || 0}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                        <td colSpan="5" className="text-right font-bold" style={{ textAlign: 'right', padding: '12px' }}>
                            Grand Total:
                        </td>
                        <td className="font-bold" style={{ padding: '12px' }}>
                            Rs {totalAmount.toFixed(2)}
                        </td>
                        <td className="text-center font-bold" style={{ padding: '12px' }}>
                            {totalItems}
                        </td>
                    </tr>
                </tfoot>
            </table>

            <div className="print-footer">
                <p>This is a computer-generated report. No signature is required.</p>
                <p>NCDB Mart Order Management System</p>
            </div>
        </div>
    );
});

PrintableOrders.displayName = 'PrintableOrders';

export default PrintableOrders;